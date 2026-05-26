package domain

import (
	"time"

	"github.com/lib/pq"
)

type ProductStatus string

const (
	ProductActive      ProductStatus = "active"
	ProductOutOfStock  ProductStatus = "out_of_stock"
	ProductDiscontinued ProductStatus = "discontinued"
)

type Product struct {
	ID          string        `json:"id" db:"id"`
	Name        string        `json:"name" db:"name"`
	Slug        string        `json:"slug" db:"slug"`
	Description string        `json:"description" db:"description"`
	Price       float64       `json:"price" db:"price"`
	ComparePrice *float64     `json:"compare_price,omitempty" db:"compare_price"`
	Stock       int           `json:"stock" db:"stock"`
	Status      ProductStatus `json:"status" db:"status"`
	Images      pq.StringArray `json:"images" db:"images"`
	CategoryID  string        `json:"category_id" db:"category_id"`
	IsActive    bool          `json:"is_active" db:"is_active"`
	CreatedAt   time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at" db:"updated_at"`

	CategoryName string `json:"category_name,omitempty" db:"category_name"`
}
