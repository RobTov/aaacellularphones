package domain

import (
	"context"
	"errors"
)

var ErrInsufficientStock = errors.New("insufficient stock")

type UserRepository interface {
	Create(ctx context.Context, user *User) error
	GetByID(ctx context.Context, id string) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	Update(ctx context.Context, user *User) error
	List(ctx context.Context, offset, limit int) ([]User, int, error)
	Delete(ctx context.Context, id string) error
}

type CategoryRepository interface {
	Create(ctx context.Context, cat *Category) error
	GetByID(ctx context.Context, id string) (*Category, error)
	GetBySlug(ctx context.Context, slug string) (*Category, error)
	Update(ctx context.Context, cat *Category) error
	List(ctx context.Context) ([]Category, error)
	Delete(ctx context.Context, id string) error
}

type ProductRepository interface {
	Create(ctx context.Context, p *Product) error
	GetByID(ctx context.Context, id string) (*Product, error)
	GetBySlug(ctx context.Context, slug string) (*Product, error)
	Update(ctx context.Context, p *Product) error
	List(ctx context.Context, filter ProductFilter) ([]Product, int, error)
	Delete(ctx context.Context, id string) error
	UpdateStock(ctx context.Context, id string, quantity int) error
	UpdateStatus(ctx context.Context, id string, status ProductStatus) error
}

type ProductFilter struct {
	CategoryID string
	Search     string
	MinPrice   float64
	MaxPrice   float64
	SortBy     string
	SortOrder  string
	Page       int
	Limit      int
	ActiveOnly bool
}

type OrderRepository interface {
	Create(ctx context.Context, o *Order) error
	GetByID(ctx context.Context, id string) (*Order, error)
	GetByUserID(ctx context.Context, userID string, page, limit int) ([]Order, int, error)
	List(ctx context.Context, page, limit int) ([]Order, int, error)
	UpdateStatus(ctx context.Context, id string, status OrderStatus) error
	AddItem(ctx context.Context, item *OrderItem) error
	GetItems(ctx context.Context, orderID string) ([]OrderItem, error)
	CreateWithItems(ctx context.Context, o *Order, items []OrderItem) error
}

type PaymentRepository interface {
	Create(ctx context.Context, p *Payment) error
	GetByID(ctx context.Context, id string) (*Payment, error)
	GetByOrderID(ctx context.Context, orderID string) (*Payment, error)
	GetBySessionID(ctx context.Context, sessionID string) (*Payment, error)
	UpdateStatus(ctx context.Context, id string, status PaymentStatus) error
	UpdateSession(ctx context.Context, id, sessionID, intentID string) error
}

type ReviewRepository interface {
	Create(ctx context.Context, r *Review) error
	GetByID(ctx context.Context, id string) (*Review, error)
	GetByProductID(ctx context.Context, productID string, page, limit int) ([]Review, int, error)
	GetByUserID(ctx context.Context, userID string, page, limit int) ([]Review, int, error)
	Update(ctx context.Context, r *Review) error
	Delete(ctx context.Context, id string) error
	GetAverageRating(ctx context.Context, productID string) (float64, int, error)
}

type AdminLogRepository interface {
	Create(ctx context.Context, log *AdminLog) error
	List(ctx context.Context, page, limit int) ([]AdminLog, int, error)
}

type LogRepository interface {
	List(ctx context.Context, page, limit int) ([]Log, int, error)
}
