package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port   string
	GinMode string

	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string

	JWTSecret         string
	JWTExpirationHours int

	StripeSecretKey      string
	StripeWebhookSecret  string
	StripeSuccessURL     string
	StripeCancelURL      string

	CDNURL string

	CORSOrigins string
}

func Load() *Config {
	return &Config{
		Port:   getEnv("PORT", "8080"),
		GinMode: getEnv("GIN_MODE", "release"),

		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5433"),
		DBUser:     getEnv("DB_USER", "marketplace_user"),
		DBPassword: getEnv("DB_PASSWORD", "marketplace_pass"),
		DBName:     getEnv("DB_NAME", "marketplace"),
		DBSSLMode:  getEnv("DB_SSLMODE", "disable"),

		JWTSecret:          getEnv("JWT_SECRET", "super-secret-key-change-in-production"),
		JWTExpirationHours: getEnvInt("JWT_EXPIRATION_HOURS", 72),

		StripeSecretKey:     getEnv("STRIPE_SECRET_KEY", ""),
		StripeWebhookSecret: getEnv("STRIPE_WEBHOOK_SECRET", ""),
		StripeSuccessURL:    getEnv("STRIPE_SUCCESS_URL", "http://localhost:4200/orders/success"),
		StripeCancelURL:     getEnv("STRIPE_CANCEL_URL", "http://localhost:4200/cart"),

		CDNURL: getEnv("CDN_URL", ""),

		CORSOrigins: getEnv("CORS_ORIGINS", "http://localhost:4200,http://127.0.0.1:4200"),
	}
}

func (c *Config) DSN() string {
	return "host=" + c.DBHost +
		" port=" + c.DBPort +
		" user=" + c.DBUser +
		" password=" + c.DBPassword +
		" dbname=" + c.DBName +
		" sslmode=" + c.DBSSLMode
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return fallback
}
