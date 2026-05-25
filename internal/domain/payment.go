package domain

import "time"

type PaymentStatus string

const (
	PaymentPending   PaymentStatus = "pending"
	PaymentCompleted PaymentStatus = "completed"
	PaymentFailed    PaymentStatus = "failed"
	PaymentRefunded  PaymentStatus = "refunded"
)

type Payment struct {
	ID                   string        `json:"id" db:"id"`
	OrderID              string        `json:"order_id" db:"order_id"`
	StripeSessionID      string        `json:"stripe_session_id" db:"stripe_session_id"`
	StripePaymentIntentID string       `json:"stripe_payment_intent_id" db:"stripe_payment_intent_id"`
	Amount               float64       `json:"amount" db:"amount"`
	Currency             string        `json:"currency" db:"currency"`
	Status               PaymentStatus `json:"status" db:"status"`
	CreatedAt            time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt            time.Time     `json:"updated_at" db:"updated_at"`
}
