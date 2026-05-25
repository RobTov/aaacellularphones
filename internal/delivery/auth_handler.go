package delivery

import (
	"net/http"

	"github.com/aaacellularphones/backend/internal/middleware"
	"github.com/aaacellularphones/backend/internal/usecase"
	"github.com/aaacellularphones/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authUsecase *usecase.AuthUseCase
}

// ---------- User Handler ----------

type UserHandler struct {
	userUsecase *usecase.UserUseCase
}

func NewUserHandler(userUsecase *usecase.UserUseCase) *UserHandler {
	return &UserHandler{userUsecase: userUsecase}
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	userID := middleware.GetUserID(c)
	user, err := h.userUsecase.GetProfile(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "user not found")
		return
	}
	response.JSON(c, http.StatusOK, user)
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID := middleware.GetUserID(c)
	var input struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	user, err := h.userUsecase.GetProfile(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "user not found")
		return
	}

	user.FirstName = input.FirstName
	user.LastName = input.LastName

	if err := h.userUsecase.UpdateProfile(c.Request.Context(), user); err != nil {
		response.Error(c, http.StatusInternalServerError, "update failed")
		return
	}

	response.JSON(c, http.StatusOK, user)
}

func (h *UserHandler) ListUsers(c *gin.Context) {
	page := parseQueryInt(c.Query("page"), 1)
	limit := parseQueryInt(c.Query("limit"), 20)

	users, total, err := h.userUsecase.ListUsers(c.Request.Context(), page, limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to list users")
		return
	}

	response.Paginated(c, users, page, limit, total)
}

func (h *UserHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")
	if err := h.userUsecase.DeleteUser(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "delete failed")
		return
	}
	response.JSON(c, http.StatusOK, gin.H{"message": "user deleted"})
}

func NewAuthHandler(authUsecase *usecase.AuthUseCase) *AuthHandler {
	return &AuthHandler{authUsecase: authUsecase}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var input usecase.RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	result, err := h.authUsecase.Register(c.Request.Context(), input)
	if err != nil {
		response.Error(c, http.StatusConflict, err.Error())
		return
	}

	response.JSON(c, http.StatusCreated, result)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var input usecase.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	result, err := h.authUsecase.Login(c.Request.Context(), input)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	response.JSON(c, http.StatusOK, result)
}
