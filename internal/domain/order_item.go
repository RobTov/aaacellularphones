package domain

import "time"

type OrderItem struct {
	ID           string    `json:"id" db:"id"`
	OrderID      string    `json:"order_id" db:"order_id"`
	ProductID    string    `json:"product_id" db:"product_id"`
	ProductName  string    `json:"product_name" db:"product_name"`
	ProductImage string    `json:"product_image" db:"product_image"`
	Quantity     int       `json:"quantity" db:"quantity"`
	UnitPrice    float64   `json:"unit_price" db:"unit_price"`
	TotalPrice   float64   `json:"total_price" db:"total_price"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}
