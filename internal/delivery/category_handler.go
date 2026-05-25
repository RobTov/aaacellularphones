package delivery

import (
	"net/http"
	"strconv"

	"github.com/aaacellularphones/backend/internal/domain"
	"github.com/aaacellularphones/backend/internal/middleware"
	"github.com/aaacellularphones/backend/internal/usecase"
	"github.com/aaacellularphones/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type CategoryHandler struct {
	uc *usecase.CategoryUseCase
}

func NewCategoryHandler(uc *usecase.CategoryUseCase) *CategoryHandler {
	return &CategoryHandler{uc: uc}
}

func (h *CategoryHandler) Create(c *gin.Context) {
	var cat domain.Category
	if err := c.ShouldBindJSON(&cat); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	if err := h.uc.Create(c.Request.Context(), &cat); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(c, http.StatusCreated, cat)
}

func (h *CategoryHandler) GetByID(c *gin.Context) {
	cat, err := h.uc.GetByID(c.Request.Context(), c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusNotFound, "category not found")
		return
	}
	response.JSON(c, http.StatusOK, cat)
}

func (h *CategoryHandler) GetBySlug(c *gin.Context) {
	cat, err := h.uc.GetBySlug(c.Request.Context(), c.Param("slug"))
	if err != nil {
		response.Error(c, http.StatusNotFound, "category not found")
		return
	}
	response.JSON(c, http.StatusOK, cat)
}

func (h *CategoryHandler) Update(c *gin.Context) {
	var cat domain.Category
	if err := c.ShouldBindJSON(&cat); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	cat.ID = c.Param("id")
	if err := h.uc.Update(c.Request.Context(), &cat); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(c, http.StatusOK, cat)
}

func (h *CategoryHandler) List(c *gin.Context) {
	cats, err := h.uc.List(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to list categories")
		return
	}
	response.JSON(c, http.StatusOK, cats)
}

func (h *CategoryHandler) Delete(c *gin.Context) {
	if err := h.uc.Delete(c.Request.Context(), c.Param("id")); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(c, http.StatusOK, gin.H{"message": "category deleted"})
}

// ---------- Product Handler ----------

type ProductHandler struct {
	uc *usecase.ProductUseCase
}

func NewProductHandler(uc *usecase.ProductUseCase) *ProductHandler {
	return &ProductHandler{uc: uc}
}

func (h *ProductHandler) Create(c *gin.Context) {
	var p domain.Product
	if err := c.ShouldBindJSON(&p); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	if err := h.uc.Create(c.Request.Context(), &p); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(c, http.StatusCreated, p)
}

func (h *ProductHandler) GetByID(c *gin.Context) {
	p, err := h.uc.GetByID(c.Request.Context(), c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusNotFound, "product not found")
		return
	}
	response.JSON(c, http.StatusOK, p)
}

func (h *ProductHandler) GetBySlug(c *gin.Context) {
	p, err := h.uc.GetBySlug(c.Request.Context(), c.Param("slug"))
	if err != nil {
		response.Error(c, http.StatusNotFound, "product not found")
		return
	}
	response.JSON(c, http.StatusOK, p)
}

func (h *ProductHandler) Update(c *gin.Context) {
	var p domain.Product
	if err := c.ShouldBindJSON(&p); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	p.ID = c.Param("id")
	if err := h.uc.Update(c.Request.Context(), &p); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(c, http.StatusOK, p)
}

func (h *ProductHandler) List(c *gin.Context) {
	filter := domain.ProductFilter{
		CategoryID: c.Query("category_id"),
		Search:     c.Query("search"),
		MinPrice:   parseQueryFloat(c.Query("min_price"), 0),
		MaxPrice:   parseQueryFloat(c.Query("max_price"), 0),
		SortBy:     c.Query("sort_by"),
		SortOrder:  c.Query("sort_order"),
		Page:       parseQueryInt(c.Query("page"), 1),
		Limit:      parseQueryInt(c.Query("limit"), 20),
	}

	role := middleware.GetRole(c)
	var products []domain.Product
	var total int
	var err error

	if role == "admin" {
		products, total, err = h.uc.ListAdmin(c.Request.Context(), filter)
	} else {
		products, total, err = h.uc.List(c.Request.Context(), filter)
	}

	if err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to list products")
		return
	}

	response.Paginated(c, products, filter.Page, filter.Limit, total)
}

func (h *ProductHandler) Delete(c *gin.Context) {
	if err := h.uc.Delete(c.Request.Context(), c.Param("id")); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(c, http.StatusOK, gin.H{"message": "product deleted"})
}

// ---------- Review Handler ----------

type ReviewHandler struct {
	uc *usecase.ReviewUseCase
}

func NewReviewHandler(uc *usecase.ReviewUseCase) *ReviewHandler {
	return &ReviewHandler{uc: uc}
}

func (h *ReviewHandler) Create(c *gin.Context) {
	userID := middleware.GetUserID(c)
	var review domain.Review
	if err := c.ShouldBindJSON(&review); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	review.UserID = userID
	if err := h.uc.Create(c.Request.Context(), &review); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(c, http.StatusCreated, review)
}

func (h *ReviewHandler) GetByProduct(c *gin.Context) {
	productID := c.Param("productId")
	page := parseQueryInt(c.Query("page"), 1)
	limit := parseQueryInt(c.Query("limit"), 20)

	reviews, total, err := h.uc.GetByProduct(c.Request.Context(), productID, page, limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to get reviews")
		return
	}
	response.Paginated(c, reviews, page, limit, total)
}

func (h *ReviewHandler) Approve(c *gin.Context) {
	id := c.Param("id")
	review, err := h.uc.GetByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "review not found")
		return
	}
	review.IsApproved = true
	if err := h.uc.Update(c.Request.Context(), review); err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to approve review")
		return
	}
	response.JSON(c, http.StatusOK, review)
}

func (h *ReviewHandler) Delete(c *gin.Context) {
	if err := h.uc.Delete(c.Request.Context(), c.Param("id")); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(c, http.StatusOK, gin.H{"message": "review deleted"})
}

// ---------- Helpers ----------

func parseQueryInt(s string, defaultVal int) int {
	if s == "" {
		return defaultVal
	}
	v, err := strconv.Atoi(s)
	if err != nil {
		return defaultVal
	}
	return v
}

func parseQueryFloat(s string, defaultVal float64) float64 {
	if s == "" {
		return defaultVal
	}
	v, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return defaultVal
	}
	return v
}
