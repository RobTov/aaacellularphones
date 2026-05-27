package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/aaacellularphones/backend/internal/domain"
	"github.com/jmoiron/sqlx"
)

type userRepo struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) domain.UserRepository {
	return &userRepo{db: db}
}

func (r *userRepo) Create(ctx context.Context, u *domain.User) error {
	query := `INSERT INTO users (email, password_hash, first_name, last_name, role)
	          VALUES (:email, :password_hash, :first_name, :last_name, :role)
	          RETURNING id, created_at, updated_at`
	rows, err := r.db.NamedQueryContext(ctx, query, u)
	if err != nil {
		return fmt.Errorf("create user: %w", err)
	}
	defer rows.Close()
	if rows.Next() {
		return rows.Scan(&u.ID, &u.CreatedAt, &u.UpdatedAt)
	}
	return nil
}

func (r *userRepo) GetByID(ctx context.Context, id string) (*domain.User, error) {
	var u domain.User
	err := r.db.GetContext(ctx, &u, "SELECT * FROM users WHERE id = $1", id)
	if err != nil {
		return nil, fmt.Errorf("get user by id: %w", err)
	}
	return &u, nil
}

func (r *userRepo) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	var u domain.User
	err := r.db.GetContext(ctx, &u, "SELECT * FROM users WHERE email = $1", email)
	if err != nil {
		return nil, fmt.Errorf("get user by email: %w", err)
	}
	return &u, nil
}

func (r *userRepo) Update(ctx context.Context, u *domain.User) error {
	query := `UPDATE users SET 
	          first_name = :first_name, last_name = :last_name, 
	          email = :email, role = :role, is_active = :is_active,
	          updated_at = NOW()
	          WHERE id = :id`
	_, err := r.db.NamedExecContext(ctx, query, u)
	return err
}

func (r *userRepo) List(ctx context.Context, offset, limit int) ([]domain.User, int, error) {
	var total int
	err := r.db.GetContext(ctx, &total, "SELECT COUNT(*) FROM users")
	if err != nil {
		return nil, 0, err
	}

	var users []domain.User
	err = r.db.SelectContext(ctx, &users,
		"SELECT * FROM users ORDER BY created_at DESC OFFSET $1 LIMIT $2", offset, limit)
	if err != nil {
		return nil, 0, err
	}
	return users, total, nil
}

func (r *userRepo) Delete(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM users WHERE id = $1", id)
	return err
}

// category

type categoryRepo struct {
	db *sqlx.DB
}

func NewCategoryRepository(db *sqlx.DB) domain.CategoryRepository {
	return &categoryRepo{db: db}
}

func (r *categoryRepo) Create(ctx context.Context, c *domain.Category) error {
	query := `INSERT INTO categories (name, slug, description, image_url, parent_id, sort_order)
	          VALUES (:name, :slug, :description, :image_url, :parent_id, :sort_order)
	          RETURNING id, created_at, updated_at`
	rows, err := r.db.NamedQueryContext(ctx, query, c)
	if err != nil {
		return fmt.Errorf("create category: %w", err)
	}
	defer rows.Close()
	if rows.Next() {
		return rows.Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)
	}
	return nil
}

func (r *categoryRepo) GetByID(ctx context.Context, id string) (*domain.Category, error) {
	var c domain.Category
	err := r.db.GetContext(ctx, &c, "SELECT * FROM categories WHERE id = $1", id)
	if err != nil {
		return nil, fmt.Errorf("get category by id: %w", err)
	}
	return &c, nil
}

func (r *categoryRepo) GetBySlug(ctx context.Context, slug string) (*domain.Category, error) {
	var c domain.Category
	err := r.db.GetContext(ctx, &c, "SELECT * FROM categories WHERE slug = $1", slug)
	if err != nil {
		return nil, fmt.Errorf("get category by slug: %w", err)
	}
	return &c, nil
}

func (r *categoryRepo) Update(ctx context.Context, c *domain.Category) error {
	query := `UPDATE categories SET 
	          name = :name, slug = :slug, description = :description,
	          image_url = :image_url, parent_id = :parent_id, 
	          sort_order = :sort_order, is_active = :is_active,
	          updated_at = NOW()
	          WHERE id = :id`
	_, err := r.db.NamedExecContext(ctx, query, c)
	return err
}

func (r *categoryRepo) List(ctx context.Context) ([]domain.Category, error) {
	var cats []domain.Category
	err := r.db.SelectContext(ctx, &cats,
		"SELECT * FROM categories ORDER BY sort_order ASC, name ASC")
	if err != nil {
		return nil, err
	}
	return cats, nil
}

func (r *categoryRepo) Delete(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM categories WHERE id = $1", id)
	return err
}

// product

type productRepo struct {
	db *sqlx.DB
}

func NewProductRepository(db *sqlx.DB) domain.ProductRepository {
	return &productRepo{db: db}
}

func (r *productRepo) Create(ctx context.Context, p *domain.Product) error {
	p.IsActive = true
	query := `INSERT INTO products (name, slug, description, price, compare_price, stock, images, category_id, specifications)
	          VALUES (:name, :slug, :description, :price, :compare_price, :stock, :images, :category_id, :specifications)
	          RETURNING id, created_at, updated_at`
	rows, err := r.db.NamedQueryContext(ctx, query, p)
	if err != nil {
		return fmt.Errorf("create product: %w", err)
	}
	defer rows.Close()
	if rows.Next() {
		return rows.Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
	}
	return nil
}

func (r *productRepo) GetByID(ctx context.Context, id string) (*domain.Product, error) {
	var p domain.Product
	err := r.db.GetContext(ctx, &p, "SELECT * FROM products WHERE id = $1", id)
	if err != nil {
		return nil, fmt.Errorf("get product by id: %w", err)
	}
	return &p, nil
}

func (r *productRepo) GetBySlug(ctx context.Context, slug string) (*domain.Product, error) {
	var p domain.Product
	err := r.db.GetContext(ctx, &p,
		`SELECT p.*, c.name as category_name 
		 FROM products p LEFT JOIN categories c ON p.category_id = c.id 
		 WHERE p.slug = $1`, slug)
	if err != nil {
		return nil, fmt.Errorf("get product by slug: %w", err)
	}
	return &p, nil
}

func (r *productRepo) Update(ctx context.Context, p *domain.Product) error {
	query := `UPDATE products SET 
	          name = :name, slug = :slug, description = :description,
	          price = :price, compare_price = :compare_price, stock = :stock,
	          images = :images, category_id = :category_id, is_active = :is_active,
	          specifications = :specifications,
	          updated_at = NOW()
	          WHERE id = :id`
	_, err := r.db.NamedExecContext(ctx, query, p)
	return err
}

func (r *productRepo) List(ctx context.Context, filter domain.ProductFilter) ([]domain.Product, int, error) {
	where := []string{"1=1"}
	args := map[string]any{}
	idx := 1

	if filter.CategoryID != "" {
		where = append(where, fmt.Sprintf("p.category_id = :cat_%d", idx))
		args[fmt.Sprintf("cat_%d", idx)] = filter.CategoryID
		idx++
	}
	if filter.Search != "" {
		where = append(where, fmt.Sprintf("(LOWER(p.name) LIKE :search_%d OR LOWER(p.description) LIKE :search_%d)", idx, idx))
		args[fmt.Sprintf("search_%d", idx)] = "%" + strings.ToLower(filter.Search) + "%"
		idx++
	}
	if filter.MinPrice > 0 {
		where = append(where, fmt.Sprintf("p.price >= :min_%d", idx))
		args[fmt.Sprintf("min_%d", idx)] = filter.MinPrice
		idx++
	}
	if filter.MaxPrice > 0 {
		where = append(where, fmt.Sprintf("p.price <= :max_%d", idx))
		args[fmt.Sprintf("max_%d", idx)] = filter.MaxPrice
		idx++
	}
	if filter.ActiveOnly {
		where = append(where, "p.is_active = true")
	}

	whereClause := strings.Join(where, " AND ")

	var total int
	countQuery := "SELECT COUNT(*) FROM products p WHERE " + whereClause
	namedCount, err := r.db.PrepareNamed(countQuery)
	if err != nil {
		return nil, 0, err
	}
	err = namedCount.GetContext(ctx, &total, args)
	if err != nil {
		return nil, 0, err
	}

	orderClause := "p.created_at DESC"
	switch filter.SortBy {
	case "price":
		orderClause = "p.price " + strings.ToUpper(filter.SortOrder)
		if orderClause != "p.price ASC" && orderClause != "p.price DESC" {
			orderClause = "p.price ASC"
		}
	case "name":
		orderClause = "p.name ASC"
	case "newest":
		orderClause = "p.created_at DESC"
	}

	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 || filter.Limit > 100 {
		filter.Limit = 20
	}
	offset := (filter.Page - 1) * filter.Limit

	args["lim"] = filter.Limit
	args["off"] = offset

	query := fmt.Sprintf(`SELECT p.*, c.name as category_name 
		FROM products p LEFT JOIN categories c ON p.category_id = c.id 
		WHERE %s ORDER BY %s LIMIT :lim OFFSET :off`, whereClause, orderClause)

	namedQuery, err := r.db.PrepareNamed(query)
	if err != nil {
		return nil, 0, err
	}

	var products []domain.Product
	err = namedQuery.SelectContext(ctx, &products, args)
	if err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

func (r *productRepo) Delete(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM products WHERE id = $1", id)
	return err
}

func (r *productRepo) UpdateStock(ctx context.Context, id string, quantity int) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2 AND stock >= $1", quantity, id)
	return err
}

func (r *productRepo) UpdateStatus(ctx context.Context, id string, status domain.ProductStatus) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE products SET status = $1, updated_at = NOW() WHERE id = $2", status, id)
	return err
}
