package domain

import "time"

type Review struct {
	ID         string    `json:"id" db:"id"`
	UserID     string    `json:"user_id" db:"user_id"`
	ProductID  string    `json:"product_id" db:"product_id"`
	Rating     int       `json:"rating" db:"rating"`
	Title      string    `json:"title" db:"title"`
	Comment    string    `json:"comment" db:"comment"`
	IsApproved bool      `json:"is_approved" db:"is_approved"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`

	User *User `json:"user,omitempty" db:"-"`
}
