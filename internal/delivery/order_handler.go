package delivery

import (
	"io"
	"net/http"

	"github.com/aaacellularphones/backend/internal/domain"
	"github.com/aaacellularphones/backend/internal/middleware"
	"github.com/aaacellularphones/backend/internal/usecase"
	"github.com/aaacellularphones/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type OrderHandler struct {
	uc *usecase.OrderUseCase
}

func NewOrderHandler(uc *usecase.OrderUseCase) *OrderHandler {
	return &OrderHandler{uc: uc}
}

func (h *OrderHandler) Create(c *gin.Context) {
	userID := middleware.GetUserID(c)
	var input usecase.CreateOrderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	order, err := h.uc.Create(c.Request.Context(), userID, input)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(c, http.StatusCreated, order)
}

func (h *OrderHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	role := middleware.GetRole(c)
	userID := middleware.GetUserID(c)

	order, err := h.uc.GetByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "order not found")
		return
	}

	if role != "admin" && order.UserID != userID {
		response.Error(c, http.StatusForbidden, "access denied")
		return
	}

	response.JSON(c, http.StatusOK, order)
}

func (h *OrderHandler) ListMyOrders(c *gin.Context) {
	userID := middleware.GetUserID(c)
	page := parseQueryInt(c.Query("page"), 1)
	limit := parseQueryInt(c.Query("limit"), 20)

	orders, total, err := h.uc.GetUserOrders(c.Request.Context(), userID, page, limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to get orders")
		return
	}

	response.Paginated(c, orders, page, limit, total)
}

func (h *OrderHandler) ListAll(c *gin.Context) {
	page := parseQueryInt(c.Query("page"), 1)
	limit := parseQueryInt(c.Query("limit"), 20)

	orders, total, err := h.uc.ListAll(c.Request.Context(), page, limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to list orders")
		return
	}

	response.Paginated(c, orders, page, limit, total)
}

func (h *OrderHandler) UpdateStatus(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.uc.UpdateStatus(c.Request.Context(), id, domain.OrderStatus(input.Status)); err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to update status")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"message": "status updated"})
}

// ---------- Payment Handler ----------

type PaymentHandler struct {
	uc *usecase.PaymentUseCase
}

func NewPaymentHandler(uc *usecase.PaymentUseCase) *PaymentHandler {
	return &PaymentHandler{uc: uc}
}

func (h *PaymentHandler) CreateCheckoutSession(c *gin.Context) {
	var input usecase.CreateCheckoutInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	url, err := h.uc.CreateCheckoutSession(c.Request.Context(), input)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"url": url})
}

func (h *PaymentHandler) HandleWebhook(c *gin.Context) {
	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "failed to read body")
		return
	}

	sigHeader := c.GetHeader("Stripe-Signature")
	if err := h.uc.HandleWebhook(c.Request.Context(), payload, sigHeader); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{"received": true})
}

// ---------- Log Handler ----------

type LogHandler struct {
	uc *usecase.LogUseCase
}

func NewLogHandler(uc *usecase.LogUseCase) *LogHandler {
	return &LogHandler{uc: uc}
}

func (h *LogHandler) List(c *gin.Context) {
	page := parseQueryInt(c.Query("page"), 1)
	limit := parseQueryInt(c.Query("limit"), 20)

	logs, total, err := h.uc.List(c.Request.Context(), page, limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to list logs")
		return
	}

	response.Paginated(c, logs, page, limit, total)
}
