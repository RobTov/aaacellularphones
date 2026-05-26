package domain

import "time"

type OrderStatus string

const (
	OrderPending   OrderStatus = "pending"
	OrderConfirmed OrderStatus = "confirmed"
	OrderProcessing OrderStatus = "processing"
	OrderShipped   OrderStatus = "shipped"
	OrderDelivered OrderStatus = "delivered"
	OrderCancelled OrderStatus = "cancelled"
)

type Order struct {
	ID              string          `json:"id" db:"id"`
	UserID          string          `json:"user_id" db:"user_id"`
	Status          OrderStatus     `json:"status" db:"status"`
	TotalAmount     float64         `json:"total_amount" db:"total_amount"`
	ShippingAddress JSONB            `json:"shipping_address" db:"shipping_address"`
	BillingAddress  JSONB            `json:"billing_address" db:"billing_address"`
	CreatedAt       time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at" db:"updated_at"`

	Items    []OrderItem `json:"items,omitempty" db:"-"`
	Payment  *Payment    `json:"payment,omitempty" db:"-"`
	User     *User       `json:"user,omitempty" db:"user"`
}
