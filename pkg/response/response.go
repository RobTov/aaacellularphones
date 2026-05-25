package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type APIResponse struct {
	Success bool        `json:"success"`
	Data    any         `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Meta    *Pagination `json:"meta,omitempty"`
}

type Pagination struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	TotalItems int `json:"total_items"`
	TotalPages int `json:"total_pages"`
}

func JSON(c *gin.Context, status int, data any) {
	c.JSON(status, APIResponse{
		Success: true,
		Data:    data,
	})
}

func Error(c *gin.Context, status int, message string) {
	c.JSON(status, APIResponse{
		Success: false,
		Error:   message,
	})
}

func Paginated(c *gin.Context, data any, page, limit, total int) {
	totalPages := total / limit
	if total%limit > 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    data,
		Meta: &Pagination{
			Page:       page,
			Limit:      limit,
			TotalItems: total,
			TotalPages: totalPages,
		},
	})
}
