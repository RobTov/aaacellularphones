package usecase

import (
	"context"
	"encoding/json"
	"errors"
	"log"

	"github.com/aaacellularphones/backend/internal/domain"
	"github.com/aaacellularphones/backend/pkg/hash"
	"github.com/aaacellularphones/backend/pkg/jwt"
	"github.com/stripe/stripe-go/v74"
	"github.com/stripe/stripe-go/v74/checkout/session"
	"github.com/stripe/stripe-go/v74/webhook"
)

// ============================================================
// AUTH USE CASE
// ============================================================

type AuthUseCase struct {
	userRepo domain.UserRepository
	secret   string
	expHours int
}

func NewAuthUseCase(userRepo domain.UserRepository, secret string, expHours int) *AuthUseCase {
	return &AuthUseCase{userRepo: userRepo, secret: secret, expHours: expHours}
}

type RegisterInput struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=6"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token string       `json:"token"`
	User  *domain.User `json:"user"`
}

func (uc *AuthUseCase) Register(ctx context.Context, input RegisterInput) (*AuthResponse, error) {
	existing, _ := uc.userRepo.GetByEmail(ctx, input.Email)
	if existing != nil {
		return nil, errors.New("email already registered")
	}

	passwordHash, err := hash.HashPassword(input.Password)
	if err != nil {
		return nil, err
	}

	user := &domain.User{
		Email:        input.Email,
		PasswordHash: passwordHash,
		FirstName:    input.FirstName,
		LastName:     input.LastName,
		Role:         domain.RoleUser,
		IsActive:     true,
	}

	if err := uc.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	token, err := jwt.GenerateToken(user.ID, user.Email, string(user.Role), uc.secret, uc.expHours)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{Token: token, User: user}, nil
}

func (uc *AuthUseCase) Login(ctx context.Context, input LoginInput) (*AuthResponse, error) {
	user, err := uc.userRepo.GetByEmail(ctx, input.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	if !user.IsActive {
		return nil, errors.New("account is disabled")
	}

	if !hash.CheckPassword(input.Password, user.PasswordHash) {
		return nil, errors.New("invalid email or password")
	}

	token, err := jwt.GenerateToken(user.ID, user.Email, string(user.Role), uc.secret, uc.expHours)
	if err != nil {
		return nil, err
	}

	user.PasswordHash = ""
	return &AuthResponse{Token: token, User: user}, nil
}

func (uc *AuthUseCase) ValidateToken(tokenString string) (*jwt.Claims, error) {
	return jwt.ValidateToken(tokenString, uc.secret)
}

// ============================================================
// USER USE CASE
// ============================================================

type UserUseCase struct {
	userRepo domain.UserRepository
}

func NewUserUseCase(userRepo domain.UserRepository) *UserUseCase {
	return &UserUseCase{userRepo: userRepo}
}

func (uc *UserUseCase) GetProfile(ctx context.Context, id string) (*domain.User, error) {
	user, err := uc.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	user.PasswordHash = ""
	return user, nil
}

func (uc *UserUseCase) UpdateProfile(ctx context.Context, user *domain.User) error {
	return uc.userRepo.Update(ctx, user)
}

func (uc *UserUseCase) ListUsers(ctx context.Context, page, limit int) ([]domain.User, int, error) {
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit
	return uc.userRepo.List(ctx, offset, limit)
}

func (uc *UserUseCase) DeleteUser(ctx context.Context, id string) error {
	return uc.userRepo.Delete(ctx, id)
}

// ============================================================
// CATEGORY USE CASE
// ============================================================

type CategoryUseCase struct {
	repo domain.CategoryRepository
}

func NewCategoryUseCase(repo domain.CategoryRepository) *CategoryUseCase {
	return &CategoryUseCase{repo: repo}
}

func (uc *CategoryUseCase) Create(ctx context.Context, cat *domain.Category) error {
	return uc.repo.Create(ctx, cat)
}

func (uc *CategoryUseCase) GetByID(ctx context.Context, id string) (*domain.Category, error) {
	return uc.repo.GetByID(ctx, id)
}

func (uc *CategoryUseCase) GetBySlug(ctx context.Context, slug string) (*domain.Category, error) {
	return uc.repo.GetBySlug(ctx, slug)
}

func (uc *CategoryUseCase) Update(ctx context.Context, cat *domain.Category) error {
	return uc.repo.Update(ctx, cat)
}

func (uc *CategoryUseCase) List(ctx context.Context) ([]domain.Category, error) {
	cats, err := uc.repo.List(ctx)
	if err != nil {
		return nil, err
	}
	return buildCategoryTree(cats), nil
}

func (uc *CategoryUseCase) Delete(ctx context.Context, id string) error {
	return uc.repo.Delete(ctx, id)
}

func buildCategoryTree(cats []domain.Category) []domain.Category {
	catMap := make(map[string]*domain.Category)
	var roots []domain.Category

	for i := range cats {
		cats[i].Children = []domain.Category{}
		catMap[cats[i].ID] = &cats[i]
	}

	for i := range cats {
		if cats[i].ParentID != nil {
			if parent, ok := catMap[*cats[i].ParentID]; ok {
				parent.Children = append(parent.Children, cats[i])
			}
		} else {
			roots = append(roots, cats[i])
		}
	}

	return roots
}

// ============================================================
// PRODUCT USE CASE
// ============================================================

type ProductUseCase struct {
	repo domain.ProductRepository
}

func NewProductUseCase(repo domain.ProductRepository) *ProductUseCase {
	return &ProductUseCase{repo: repo}
}

const defaultPage = 1
const defaultLimit = 20

func (uc *ProductUseCase) Create(ctx context.Context, p *domain.Product) error {
	return uc.repo.Create(ctx, p)
}

func (uc *ProductUseCase) GetByID(ctx context.Context, id string) (*domain.Product, error) {
	return uc.repo.GetByID(ctx, id)
}

func (uc *ProductUseCase) GetBySlug(ctx context.Context, slug string) (*domain.Product, error) {
	return uc.repo.GetBySlug(ctx, slug)
}

func (uc *ProductUseCase) Update(ctx context.Context, p *domain.Product) error {
	return uc.repo.Update(ctx, p)
}

func (uc *ProductUseCase) List(ctx context.Context, filter domain.ProductFilter) ([]domain.Product, int, error) {
	if filter.Page < 1 {
		filter.Page = defaultPage
	}
	if filter.Limit < 1 || filter.Limit > 100 {
		filter.Limit = defaultLimit
	}
	filter.ActiveOnly = true
	return uc.repo.List(ctx, filter)
}

func (uc *ProductUseCase) ListAdmin(ctx context.Context, filter domain.ProductFilter) ([]domain.Product, int, error) {
	if filter.Page < 1 {
		filter.Page = defaultPage
	}
	if filter.Limit < 1 || filter.Limit > 100 {
		filter.Limit = defaultLimit
	}
	return uc.repo.List(ctx, filter)
}

func (uc *ProductUseCase) Delete(ctx context.Context, id string) error {
	return uc.repo.Delete(ctx, id)
}

// ============================================================
// REVIEW USE CASE
// ============================================================

type ReviewUseCase struct {
	repo domain.ReviewRepository
}

func NewReviewUseCase(repo domain.ReviewRepository) *ReviewUseCase {
	return &ReviewUseCase{repo: repo}
}

func (uc *ReviewUseCase) Create(ctx context.Context, r *domain.Review) error {
	return uc.repo.Create(ctx, r)
}

func (uc *ReviewUseCase) GetByID(ctx context.Context, id string) (*domain.Review, error) {
	return uc.repo.GetByID(ctx, id)
}

func (uc *ReviewUseCase) GetByProduct(ctx context.Context, productID string, page, limit int) ([]domain.Review, int, error) {
	if page < 1 {
		page = defaultPage
	}
	if limit < 1 || limit > 100 {
		limit = defaultLimit
	}
	return uc.repo.GetByProductID(ctx, productID, page, limit)
}

func (uc *ReviewUseCase) Update(ctx context.Context, r *domain.Review) error {
	return uc.repo.Update(ctx, r)
}

func (uc *ReviewUseCase) Delete(ctx context.Context, id string) error {
	return uc.repo.Delete(ctx, id)
}

func (uc *ReviewUseCase) GetAverageRating(ctx context.Context, productID string) (float64, int, error) {
	return uc.repo.GetAverageRating(ctx, productID)
}

// ============================================================
// ORDER USE CASE
// ============================================================

type OrderUseCase struct {
	orderRepo   domain.OrderRepository
	productRepo domain.ProductRepository
	paymentRepo domain.PaymentRepository
}

func NewOrderUseCase(
	orderRepo domain.OrderRepository,
	productRepo domain.ProductRepository,
	paymentRepo domain.PaymentRepository,
) *OrderUseCase {
	return &OrderUseCase{
		orderRepo:   orderRepo,
		productRepo: productRepo,
		paymentRepo: paymentRepo,
	}
}

type CreateOrderInput struct {
	Items           []OrderItemInput `json:"items" binding:"required,min=1"`
	ShippingAddress map[string]any   `json:"shipping_address"`
	BillingAddress  map[string]any   `json:"billing_address"`
}

type OrderItemInput struct {
	ProductID string `json:"product_id" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required,min=1"`
}

func (uc *OrderUseCase) Create(ctx context.Context, userID string, input CreateOrderInput) (*domain.Order, error) {
	totalAmount := 0.0
	var items []domain.OrderItem

	for _, item := range input.Items {
		product, err := uc.productRepo.GetByID(ctx, item.ProductID)
		if err != nil {
			return nil, errors.New("product not found: " + item.ProductID)
		}
		if product.Stock < item.Quantity {
			return nil, errors.New("insufficient stock for: " + product.Name)
		}
		total := product.Price * float64(item.Quantity)
		totalAmount += total
		productImage := ""
		if len(product.Images) > 0 {
			productImage = product.Images[0]
		}
		items = append(items, domain.OrderItem{
			ProductID:    product.ID,
			ProductName:  product.Name,
			ProductImage: productImage,
			Quantity:     item.Quantity,
			UnitPrice:    product.Price,
			TotalPrice:   total,
		})
	}

	order := &domain.Order{
		UserID:          userID,
		Status:          domain.OrderPending,
		TotalAmount:     totalAmount,
		ShippingAddress: domain.JSONB(input.ShippingAddress),
		BillingAddress:  domain.JSONB(input.BillingAddress),
	}

	order.Items = items
	if err := uc.orderRepo.CreateWithItems(ctx, order, items); err != nil {
		return nil, err
	}

	return order, nil
}

func (uc *OrderUseCase) GetByID(ctx context.Context, id string) (*domain.Order, error) {
	order, err := uc.orderRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	items, err := uc.orderRepo.GetItems(ctx, id)
	if err != nil {
		return nil, err
	}
	order.Items = items

	payment, _ := uc.paymentRepo.GetByOrderID(ctx, id)
	order.Payment = payment

	return order, nil
}

func (uc *OrderUseCase) GetUserOrders(ctx context.Context, userID string, page, limit int) ([]domain.Order, int, error) {
	if page < 1 {
		page = defaultPage
	}
	if limit < 1 || limit > 100 {
		limit = defaultLimit
	}
	return uc.orderRepo.GetByUserID(ctx, userID, page, limit)
}

func (uc *OrderUseCase) ListAll(ctx context.Context, page, limit int) ([]domain.Order, int, error) {
	if page < 1 {
		page = defaultPage
	}
	if limit < 1 || limit > 100 {
		limit = defaultLimit
	}
	return uc.orderRepo.List(ctx, page, limit)
}

func (uc *OrderUseCase) UpdateStatus(ctx context.Context, id string, status domain.OrderStatus) error {
	return uc.orderRepo.UpdateStatus(ctx, id, status)
}

// ============================================================
// PAYMENT USE CASE
// ============================================================

type PaymentUseCase struct {
	paymentRepo       domain.PaymentRepository
	orderRepo         domain.OrderRepository
	stripeKey         string
	stripeWebhookSecret string
	successURL        string
	cancelURL         string
}

func NewPaymentUseCase(
	paymentRepo domain.PaymentRepository,
	orderRepo domain.OrderRepository,
	stripeKey, webhookSecret, successURL, cancelURL string,
) *PaymentUseCase {
	return &PaymentUseCase{
		paymentRepo:        paymentRepo,
		orderRepo:          orderRepo,
		stripeKey:          stripeKey,
		stripeWebhookSecret: webhookSecret,
		successURL:         successURL,
		cancelURL:          cancelURL,
	}
}

type CreateCheckoutInput struct {
	OrderID string `json:"order_id" binding:"required"`
}

func (uc *PaymentUseCase) CreateCheckoutSession(ctx context.Context, input CreateCheckoutInput) (string, error) {
	order, err := uc.orderRepo.GetByID(ctx, input.OrderID)
	if err != nil {
		return "", errors.New("order not found")
	}
	if order.Status != domain.OrderPending {
		return "", errors.New("order already processed")
	}

	stripe.Key = uc.stripeKey

	items, err := uc.orderRepo.GetItems(ctx, input.OrderID)
	if err != nil {
		return "", err
	}

	var lineItems []*stripe.CheckoutSessionLineItemParams
	for _, item := range items {
		lineItems = append(lineItems, &stripe.CheckoutSessionLineItemParams{
			PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
				Currency: stripe.String("usd"),
				ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
					Name: stripe.String(item.ProductName),
				},
				UnitAmount: stripe.Int64(int64(item.UnitPrice * 100)),
			},
			Quantity: stripe.Int64(int64(item.Quantity)),
		})
	}

	params := &stripe.CheckoutSessionParams{
		Params: stripe.Params{
			Metadata: map[string]string{
				"order_id": input.OrderID,
			},
		},
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL: stripe.String(uc.successURL),
		CancelURL:  stripe.String(uc.cancelURL),
		LineItems:  lineItems,
	}

	s, err := session.New(params)
	if err != nil {
		return "", err
	}

	payment := &domain.Payment{
		OrderID:           input.OrderID,
		StripeSessionID:   s.ID,
		Amount:            order.TotalAmount,
		Currency:          "usd",
		Status:            domain.PaymentPending,
	}
	if err := uc.paymentRepo.Create(ctx, payment); err != nil {
		return "", err
	}

	log.Printf("[STRIPE] Checkout session %s created for order %s", s.ID, input.OrderID)

	return s.URL, nil
}

func (uc *PaymentUseCase) HandleWebhook(ctx context.Context, payload []byte, sigHeader string) error {
	event, err := webhook.ConstructEvent(payload, sigHeader, uc.stripeWebhookSecret)
	if err != nil {
		return errors.New("webhook signature verification failed")
	}

	switch event.Type {
	case "checkout.session.completed":
		var s stripe.CheckoutSession
		if err := json.Unmarshal(event.Data.Raw, &s); err != nil {
			return err
		}
		return uc.handleSessionCompleted(ctx, &s)
	}

	return nil
}

func (uc *PaymentUseCase) handleSessionCompleted(ctx context.Context, s *stripe.CheckoutSession) error {
	orderID, ok := s.Metadata["order_id"]
	if !ok {
		return errors.New("no order_id in session metadata")
	}

	payment, err := uc.paymentRepo.GetByOrderID(ctx, orderID)
	if err != nil {
		return err
	}

	if payment.Status == domain.PaymentCompleted {
		return nil
	}

	if err := uc.paymentRepo.UpdateSession(ctx, payment.ID, s.ID, s.PaymentIntent.ID); err != nil {
		return err
	}
	if err := uc.paymentRepo.UpdateStatus(ctx, payment.ID, domain.PaymentCompleted); err != nil {
		return err
	}
	if err := uc.orderRepo.UpdateStatus(ctx, orderID, domain.OrderConfirmed); err != nil {
		return err
	}

	return nil
}

// ============================================================
// LOG USE CASE (immutable audit logs, read-only for admins)
// ============================================================

type LogUseCase struct {
	repo domain.LogRepository
}

func NewLogUseCase(repo domain.LogRepository) *LogUseCase {
	return &LogUseCase{repo: repo}
}

func (uc *LogUseCase) List(ctx context.Context, page, limit int) ([]domain.Log, int, error) {
	if page < 1 {
		page = defaultPage
	}
	if limit < 1 || limit > 100 {
		limit = defaultLimit
	}
	return uc.repo.List(ctx, page, limit)
}
