package domain

import "time"

type AdminLog struct {
	ID         string         `json:"id" db:"id"`
	AdminID    string         `json:"admin_id" db:"admin_id"`
	Action     string         `json:"action" db:"action"`
	EntityType string         `json:"entity_type" db:"entity_type"`
	EntityID   *string        `json:"entity_id,omitempty" db:"entity_id"`
	Details    JSONB          `json:"details" db:"details"`
	IPAddress  string         `json:"ip_address" db:"ip_address"`
	CreatedAt  time.Time      `json:"created_at" db:"created_at"`
}
