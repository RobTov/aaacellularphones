package domain

import "time"

type Log struct {
	ID        string    `json:"id" db:"id"`
	TableName string    `json:"table_name" db:"table_name"`
	Action    string    `json:"action" db:"action"`
	RecordID  string    `json:"record_id" db:"record_id"`
	UserID    *string   `json:"user_id,omitempty" db:"user_id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}
