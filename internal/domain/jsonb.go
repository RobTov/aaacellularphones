package domain

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

type JSONB map[string]any

func (j JSONB) Value() (driver.Value, error) {
	if j == nil {
		return []byte("{}"), nil
	}
	return json.Marshal(j)
}

func (j *JSONB) Scan(src any) error {
	if src == nil {
		*j = nil
		return nil
	}
	var source []byte
	switch v := src.(type) {
	case []byte:
		source = v
	case string:
		source = []byte(v)
	default:
		return errors.New("unsupported type for JSONB")
	}
	return json.Unmarshal(source, j)
}
