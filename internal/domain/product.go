package domain

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"github.com/lib/pq"
)

type Specification struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type Specifications []Specification

func (s Specifications) Value() (driver.Value, error) {
	if s == nil {
		return []byte("[]"), nil
	}
	return json.Marshal(s)
}

func (s *Specifications) Scan(src any) error {
	if src == nil {
		*s = nil
		return nil
	}
	var source []byte
	switch v := src.(type) {
	case []byte:
		source = v
	case string:
		source = []byte(v)
	default:
		return errors.New("unsupported type for Specifications")
	}
	return json.Unmarshal(source, s)
}

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

	CategoryName string        `json:"category_name,omitempty" db:"category_name"`
	Specifications Specifications `json:"specifications" db:"specifications"`
}
