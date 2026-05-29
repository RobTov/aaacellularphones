package postgres

import (
	"context"
	"fmt"

	"github.com/aaacellularphones/backend/internal/domain"
	"github.com/aaacellularphones/backend/internal/middleware"
	"github.com/jmoiron/sqlx"
)

type orderRepo struct {
	db *sqlx.DB
}

func NewOrderRepository(db *sqlx.DB) domain.OrderRepository {
	return &orderRepo{db: db}
}

func (r *orderRepo) Create(ctx context.Context, o *domain.Order) error {
	query := `INSERT INTO orders (user_id, status, total_amount, shipping_address, billing_address)
	          VALUES (:user_id, :status, :total_amount, :shipping_address, :billing_address)
	          RETURNING id, created_at, updated_at`
	rows, err := r.db.NamedQueryContext(ctx, query, o)
	if err != nil {
		return fmt.Errorf("create order: %w", err)
	}
	defer rows.Close()
	if rows.Next() {
		return rows.Scan(&o.ID, &o.CreatedAt, &o.UpdatedAt)
	}
	return nil
}

func (r *orderRepo) GetByID(ctx context.Context, id string) (*domain.Order, error) {
	var o domain.Order
	err := r.db.GetContext(ctx, &o, "SELECT * FROM orders WHERE id = $1", id)
	if err != nil {
		return nil, fmt.Errorf("get order by id: %w", err)
	}
	return &o, nil
}

func (r *orderRepo) GetByUserID(ctx context.Context, userID string, page, limit int) ([]domain.Order, int, error) {
	var total int
	err := r.db.GetContext(ctx, &total, "SELECT COUNT(*) FROM orders WHERE user_id = $1", userID)
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	var orders []domain.Order
	err = r.db.SelectContext(ctx, &orders,
		"SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC OFFSET $2 LIMIT $3",
		userID, offset, limit)
	if err != nil {
		return nil, 0, err
	}
	return orders, total, nil
}

func (r *orderRepo) List(ctx context.Context, page, limit int) ([]domain.Order, int, error) {
	var total int
	err := r.db.GetContext(ctx, &total, "SELECT COUNT(*) FROM orders")
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	var orders []domain.Order
	err = r.db.SelectContext(ctx, &orders,
		`SELECT o.*, u.email as "user.email", u.first_name as "user.first_name", u.last_name as "user.last_name"
		 FROM orders o LEFT JOIN users u ON o.user_id = u.id
		 ORDER BY o.created_at DESC OFFSET $1 LIMIT $2`, offset, limit)
	if err != nil {
		return nil, 0, err
	}
	return orders, total, nil
}

func (r *orderRepo) UpdateStatus(ctx context.Context, id string, status domain.OrderStatus) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2", status, id)
	return err
}

func (r *orderRepo) AddItem(ctx context.Context, item *domain.OrderItem) error {
	query := `INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, unit_price, total_price)
	          VALUES (:order_id, :product_id, :product_name, :product_image, :quantity, :unit_price, :total_price)
	          RETURNING id, created_at`
	rows, err := r.db.NamedQueryContext(ctx, query, item)
	if err != nil {
		return fmt.Errorf("add order item: %w", err)
	}
	defer rows.Close()
	if rows.Next() {
		return rows.Scan(&item.ID, &item.CreatedAt)
	}
	return nil
}

func (r *orderRepo) GetItems(ctx context.Context, orderID string) ([]domain.OrderItem, error) {
	var items []domain.OrderItem
	err := r.db.SelectContext(ctx, &items,
		"SELECT * FROM order_items WHERE order_id = $1", orderID)
	if err != nil {
		return nil, err
	}
	return items, nil
}

func (r *orderRepo) CreateWithItems(ctx context.Context, o *domain.Order, items []domain.OrderItem) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback()

	if err := setAuditUserID(ctx, tx); err != nil {
		return err
	}

	query := `INSERT INTO orders (user_id, status, total_amount, shipping_address, billing_address)
	          VALUES ($1, $2, $3, $4, $5)
	          RETURNING id, created_at, updated_at`
	err = tx.QueryRowContext(ctx, query,
		o.UserID, o.Status, o.TotalAmount, o.ShippingAddress, o.BillingAddress,
	).Scan(&o.ID, &o.CreatedAt, &o.UpdatedAt)
	if err != nil {
		return fmt.Errorf("create order: %w", err)
	}

	for i := range items {
		items[i].OrderID = o.ID
		itemQuery := `INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, unit_price, total_price)
		              VALUES ($1, $2, $3, $4, $5, $6, $7)
		              RETURNING id, created_at`
		err = tx.QueryRowContext(ctx, itemQuery,
			items[i].OrderID, items[i].ProductID, items[i].ProductName,
			items[i].ProductImage, items[i].Quantity, items[i].UnitPrice, items[i].TotalPrice,
		).Scan(&items[i].ID, &items[i].CreatedAt)
		if err != nil {
			return fmt.Errorf("add order item: %w", err)
		}

		var newStock int
		err = tx.QueryRowContext(ctx,
			`UPDATE products SET stock = stock - $1, updated_at = NOW()
			 WHERE id = $2 AND stock >= $1
			 RETURNING stock`,
			items[i].Quantity, items[i].ProductID,
		).Scan(&newStock)
		if err != nil {
			return fmt.Errorf("insufficient stock for product %s: %w", items[i].ProductName, domain.ErrInsufficientStock)
		}

		if newStock == 0 {
			_, err = tx.ExecContext(ctx,
				"UPDATE products SET status = $1, updated_at = NOW() WHERE id = $2",
				domain.ProductOutOfStock, items[i].ProductID)
			if err != nil {
				return fmt.Errorf("update product status: %w", err)
			}
		}
	}

	return tx.Commit()
}

// payment

type paymentRepo struct {
	db *sqlx.DB
}

func NewPaymentRepository(db *sqlx.DB) domain.PaymentRepository {
	return &paymentRepo{db: db}
}

func (r *paymentRepo) Create(ctx context.Context, p *domain.Payment) error {
	query := `INSERT INTO payments (order_id, stripe_session_id, stripe_payment_intent_id, amount, currency, status)
	          VALUES (:order_id, :stripe_session_id, :stripe_payment_intent_id, :amount, :currency, :status)
	          RETURNING id, created_at, updated_at`
	rows, err := r.db.NamedQueryContext(ctx, query, p)
	if err != nil {
		return fmt.Errorf("create payment: %w", err)
	}
	defer rows.Close()
	if rows.Next() {
		return rows.Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
	}
	return nil
}

func (r *paymentRepo) GetByID(ctx context.Context, id string) (*domain.Payment, error) {
	var p domain.Payment
	err := r.db.GetContext(ctx, &p, "SELECT * FROM payments WHERE id = $1", id)
	if err != nil {
		return nil, fmt.Errorf("get payment by id: %w", err)
	}
	return &p, nil
}

func (r *paymentRepo) GetByOrderID(ctx context.Context, orderID string) (*domain.Payment, error) {
	var p domain.Payment
	err := r.db.GetContext(ctx, &p, "SELECT * FROM payments WHERE order_id = $1", orderID)
	if err != nil {
		return nil, fmt.Errorf("get payment by order: %w", err)
	}
	return &p, nil
}

func (r *paymentRepo) GetBySessionID(ctx context.Context, sessionID string) (*domain.Payment, error) {
	var p domain.Payment
	err := r.db.GetContext(ctx, &p, "SELECT * FROM payments WHERE stripe_session_id = $1", sessionID)
	if err != nil {
		return nil, fmt.Errorf("get payment by session: %w", err)
	}
	return &p, nil
}

func (r *paymentRepo) UpdateStatus(ctx context.Context, id string, status domain.PaymentStatus) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2", status, id)
	return err
}

func (r *paymentRepo) UpdateSession(ctx context.Context, id, sessionID, intentID string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE payments SET stripe_session_id = $1, stripe_payment_intent_id = $2, updated_at = NOW() WHERE id = $3`,
		sessionID, intentID, id)
	return err
}

// review

type reviewRepo struct {
	db *sqlx.DB
}

func NewReviewRepository(db *sqlx.DB) domain.ReviewRepository {
	return &reviewRepo{db: db}
}

func (r *reviewRepo) Create(ctx context.Context, rev *domain.Review) error {
	query := `INSERT INTO reviews (user_id, product_id, rating, title, comment)
	          VALUES (:user_id, :product_id, :rating, :title, :comment)
	          RETURNING id, created_at, updated_at`
	rows, err := r.db.NamedQueryContext(ctx, query, rev)
	if err != nil {
		return fmt.Errorf("create review: %w", err)
	}
	defer rows.Close()
	if rows.Next() {
		return rows.Scan(&rev.ID, &rev.CreatedAt, &rev.UpdatedAt)
	}
	return nil
}

func (r *reviewRepo) GetByID(ctx context.Context, id string) (*domain.Review, error) {
	var rev domain.Review
	err := r.db.GetContext(ctx, &rev, "SELECT * FROM reviews WHERE id = $1", id)
	if err != nil {
		return nil, fmt.Errorf("get review by id: %w", err)
	}
	return &rev, nil
}

func (r *reviewRepo) GetByProductID(ctx context.Context, productID string, page, limit int) ([]domain.Review, int, error) {
	var total int
	err := r.db.GetContext(ctx, &total,
		"SELECT COUNT(*) FROM reviews WHERE product_id = $1 AND is_approved = true", productID)
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	var reviews []domain.Review
	err = r.db.SelectContext(ctx, &reviews,
		`SELECT r.*
		 FROM reviews r
		 WHERE r.product_id = $1 AND r.is_approved = true 
		 ORDER BY r.created_at DESC OFFSET $2 LIMIT $3`,
		productID, offset, limit)
	if err != nil {
		return nil, 0, err
	}
	return reviews, total, nil
}

func (r *reviewRepo) GetByUserID(ctx context.Context, userID string, page, limit int) ([]domain.Review, int, error) {
	var total int
	err := r.db.GetContext(ctx, &total,
		"SELECT COUNT(*) FROM reviews WHERE user_id = $1", userID)
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	var reviews []domain.Review
	err = r.db.SelectContext(ctx, &reviews,
		"SELECT * FROM reviews WHERE user_id = $1 ORDER BY created_at DESC OFFSET $2 LIMIT $3",
		userID, offset, limit)
	if err != nil {
		return nil, 0, err
	}
	return reviews, total, nil
}

func (r *reviewRepo) Update(ctx context.Context, rev *domain.Review) error {
	_, err := r.db.NamedExecContext(ctx,
		`UPDATE reviews SET rating = :rating, title = :title, comment = :comment, 
		 is_approved = :is_approved, updated_at = NOW() WHERE id = :id`, rev)
	return err
}

func (r *reviewRepo) Delete(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM reviews WHERE id = $1", id)
	return err
}

func (r *reviewRepo) GetAverageRating(ctx context.Context, productID string) (float64, int, error) {
	var result struct {
		Avg float64 `db:"avg"`
		Ct  int     `db:"ct"`
	}
	err := r.db.GetContext(ctx, &result,
		`SELECT COALESCE(AVG(rating), 0) as avg, COUNT(*) as ct 
		 FROM reviews WHERE product_id = $1 AND is_approved = true`, productID)
	if err != nil {
		return 0, 0, err
	}
	return result.Avg, result.Ct, nil
}

// admin log

type adminLogRepo struct {
	db *sqlx.DB
}

func NewAdminLogRepository(db *sqlx.DB) domain.AdminLogRepository {
	return &adminLogRepo{db: db}
}

func (r *adminLogRepo) Create(ctx context.Context, l *domain.AdminLog) error {
	query := `INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, details, ip_address)
	          VALUES (:admin_id, :action, :entity_type, :entity_id, :details, :ip_address)
	          RETURNING id, created_at`
	rows, err := r.db.NamedQueryContext(ctx, query, l)
	if err != nil {
		return fmt.Errorf("create admin log: %w", err)
	}
	defer rows.Close()
	if rows.Next() {
		return rows.Scan(&l.ID, &l.CreatedAt)
	}
	return nil
}

func (r *adminLogRepo) List(ctx context.Context, page, limit int) ([]domain.AdminLog, int, error) {
	var total int
	err := r.db.GetContext(ctx, &total, "SELECT COUNT(*) FROM admin_logs")
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	var logs []domain.AdminLog
	err = r.db.SelectContext(ctx, &logs,
		"SELECT * FROM admin_logs ORDER BY created_at DESC OFFSET $1 LIMIT $2", offset, limit)
	if err != nil {
		return nil, 0, err
	}
	return logs, total, nil
}

// ============================================================
// LOG REPOSITORY (immutable audit logs via triggers)
// ============================================================

type logRepo struct {
	db *sqlx.DB
}

func NewLogRepository(db *sqlx.DB) domain.LogRepository {
	return &logRepo{db: db}
}

func (r *logRepo) List(ctx context.Context, page, limit int) ([]domain.Log, int, error) {
	var total int
	err := r.db.GetContext(ctx, &total, "SELECT COUNT(*) FROM logs")
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	var logs []domain.Log
	err = r.db.SelectContext(ctx, &logs,
		"SELECT * FROM logs ORDER BY created_at DESC OFFSET $1 LIMIT $2", offset, limit)
	if err != nil {
		return nil, 0, err
	}
	return logs, total, nil
}

// setAuditUserID sets the app.current_user_id config for trigger-based audit logging.
func setAuditUserID(ctx context.Context, exec sqlx.ExtContext) error {
	userID := middleware.AuditUserIDFromContext(ctx)
	if userID == "" {
		return nil
	}
	_, err := exec.ExecContext(ctx, "SELECT set_config('app.current_user_id', $1, true)", userID)
	return err
}
