package domain

import "time"

type Category struct {
	ID          string     `json:"id" db:"id"`
	Name        string     `json:"name" db:"name"`
	Slug        string     `json:"slug" db:"slug"`
	Description string     `json:"description" db:"description"`
	ImageURL    string     `json:"image_url" db:"image_url"`
	ParentID    *string    `json:"parent_id,omitempty" db:"parent_id"`
	SortOrder   int        `json:"sort_order" db:"sort_order"`
	IsActive    bool       `json:"is_active" db:"is_active"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
	Children    []Category `json:"children,omitempty"`
}
