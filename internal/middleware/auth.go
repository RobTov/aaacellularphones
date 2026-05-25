package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/aaacellularphones/backend/pkg/jwt"
	"github.com/gin-gonic/gin"
)

type ctxKey string

const CtxAuditUserID ctxKey = "audit_user_id"

func AuditUserIDToContext(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, CtxAuditUserID, userID)
}

func AuditUserIDFromContext(ctx context.Context) string {
	id, _ := ctx.Value(CtxAuditUserID).(string)
	return id
}

type AuthMiddleware struct {
	secret string
}

func NewAuthMiddleware(secret string) *AuthMiddleware {
	return &AuthMiddleware{secret: secret}
}

func (m *AuthMiddleware) Required() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := extractToken(c)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"success": false, "error": err.Error()})
			return
		}

		claims, err := jwt.ValidateToken(token, m.secret)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"success": false, "error": "invalid or expired token"})
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)
		c.Request = c.Request.WithContext(AuditUserIDToContext(c.Request.Context(), claims.UserID))
		c.Next()
	}
}

func (m *AuthMiddleware) AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := extractToken(c)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"success": false, "error": err.Error()})
			return
		}

		claims, err := jwt.ValidateToken(token, m.secret)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"success": false, "error": "invalid or expired token"})
			return
		}

		if claims.Role != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"success": false, "error": "admin access required"})
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)
		c.Request = c.Request.WithContext(AuditUserIDToContext(c.Request.Context(), claims.UserID))
		c.Next()
	}
}

func (m *AuthMiddleware) Optional() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := extractToken(c)
		if err == nil {
			claims, err := jwt.ValidateToken(token, m.secret)
			if err == nil {
				c.Set("user_id", claims.UserID)
				c.Set("email", claims.Email)
				c.Set("role", claims.Role)
			}
		}
		c.Next()
	}
}

func extractToken(c *gin.Context) (string, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return "", http.ErrNoLocation
	}

	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return "", http.ErrNoLocation
	}

	return parts[1], nil
}

func GetUserID(c *gin.Context) string {
	return c.GetString("user_id")
}

func GetRole(c *gin.Context) string {
	return c.GetString("role")
}
