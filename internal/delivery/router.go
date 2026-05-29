package delivery

import (
	"github.com/aaacellularphones/backend/internal/middleware"
	"github.com/aaacellularphones/backend/internal/usecase"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	Auth     *AuthHandler
	User     *UserHandler
	Category *CategoryHandler
	Product  *ProductHandler
	Order    *OrderHandler
	Payment  *PaymentHandler
	Review   *ReviewHandler
	Log      *LogHandler
}

func NewHandler(
	auth *usecase.AuthUseCase,
	user *usecase.UserUseCase,
	category *usecase.CategoryUseCase,
	product *usecase.ProductUseCase,
	order *usecase.OrderUseCase,
	payment *usecase.PaymentUseCase,
	review *usecase.ReviewUseCase,
	log *usecase.LogUseCase,
) *Handler {
	return &Handler{
		Auth:     NewAuthHandler(auth),
		User:     NewUserHandler(user),
		Category: NewCategoryHandler(category),
		Product:  NewProductHandler(product),
		Order:    NewOrderHandler(order),
		Payment:  NewPaymentHandler(payment),
		Review:   NewReviewHandler(review),
		Log:      NewLogHandler(log),
	}
}

func SetupRoutes(r *gin.Engine, h *Handler, authMW *middleware.AuthMiddleware, origins string) {
		r.Use(middleware.CORS(origins))

	r.Static("/uploads", "./uploads")

	api := r.Group("/api/v1")
	{
		// Health
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok"})
		})

		// Auth (public)
		auth := api.Group("/auth")
		{
			auth.POST("/register", h.Auth.Register)
			auth.POST("/login", h.Auth.Login)
		}

		// Categories (public read, admin write)
		categories := api.Group("/categories")
		{
			categories.GET("", h.Category.List)
			categories.GET("/:id", h.Category.GetByID)
			categories.GET("/slug/:slug", h.Category.GetBySlug)
		}

		// Products (public read)
		products := api.Group("/products")
		{
			products.GET("", h.Product.List)
			products.GET("/:productId", h.Product.GetByID)
			products.GET("/slug/:slug", h.Product.GetBySlug)
		}

		// Reviews (public read)
		reviews := api.Group("/products/:productId/reviews")
		{
			reviews.GET("", h.Review.GetByProduct)
		}

		// Authenticated routes
		authed := api.Group("")
		authed.Use(authMW.Required())
		{
			// User profile
			authed.GET("/me", h.User.GetProfile)
			authed.PUT("/me", h.User.UpdateProfile)

			// Orders
			authed.POST("/orders", h.Order.Create)
			authed.GET("/orders", h.Order.ListMyOrders)
			authed.GET("/orders/:id", h.Order.GetByID)

			// Reviews (authenticated)
			authed.POST("/products/:productId/reviews", h.Review.Create)

			// Payments
			authed.POST("/payments/checkout", h.Payment.CreateCheckoutSession)
		}

		// Admin routes
		admin := api.Group("/admin")
		admin.Use(authMW.AdminOnly())
		{
			admin.GET("/users", h.User.ListUsers)
			admin.DELETE("/users/:id", h.User.DeleteUser)

			admin.POST("/categories", h.Category.Create)
			admin.PUT("/categories/:id", h.Category.Update)
			admin.DELETE("/categories/:id", h.Category.Delete)

			admin.POST("/products", h.Product.Create)
			admin.PUT("/products/:id", h.Product.Update)
			admin.DELETE("/products/:id", h.Product.Delete)
			admin.POST("/upload", h.Product.Upload)

			admin.GET("/orders", h.Order.ListAll)
			admin.PUT("/orders/:id/status", h.Order.UpdateStatus)

			admin.PUT("/reviews/:id/approve", h.Review.Approve)
			admin.DELETE("/reviews/:id", h.Review.Delete)

			admin.GET("/logs", h.Log.List)
		}

		// Stripe webhook (public, no auth) - commented out for development mock
		// api.POST("/webhooks/stripe", h.Payment.HandleWebhook)
	}
}
