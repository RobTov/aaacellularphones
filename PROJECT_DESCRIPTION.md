# AAACellularPhones Marketplace Backend

A production-grade marketplace backend built with **Go** using **Clean Architecture** and **PostgreSQL**.

## Tech Stack

- **Language:** Go 1.23
- **Framework:** Gin (HTTP router)
- **Database:** PostgreSQL 16 (via `lib/pq` + `sqlx`)
- **Auth:** JWT (golang-jwt/v5)
- **Payments:** Stripe (checkout sessions + webhooks)
- **ORM:** sqlx (lightweight SQL toolkit)
- **Deploy:** Docker + Render/Railway

## Project Structure (Clean Architecture)

```
├── cmd/server/main.go          # Entry point
├── internal/
│   ├── config/                 # Environment config
│   ├── domain/                 # Entities + Repository interfaces
│   │   ├── user.go / category.go / product.go
│   │   ├── order.go / order_item.go / payment.go
│   │   ├── review.go / admin_log.go
│   │   └── repository.go       # All repository interfaces
│   ├── repository/postgres/    # PostgreSQL implementations
│   │   ├── user_repo.go        # Users, Categories, Products repos
│   │   └── order_repo.go       # Orders, Payments, Reviews, AdminLogs repos
│   ├── usecase/usecase.go      # Business logic (all use cases)
│   ├── delivery/               # HTTP handlers + router
│   │   ├── auth_handler.go     # Auth + User handlers
│   │   ├── category_handler.go # Category, Product, Review handlers
│   │   ├── order_handler.go    # Order + Payment handlers
│   │   └── router.go           # Route definitions
│   └── middleware/             # Auth (JWT) + CORS middleware
├── pkg/                        # Shared utilities
│   ├── jwt/                    # Token generation/validation
│   ├── hash/                   # bcrypt password hashing
│   └── response/               # Standard API response helpers
├── migrations/001_initial.sql  # DB schema + seed data
├── docker-compose.yml          # PostgreSQL on port 5433
├── Dockerfile                  # Multi-stage build
├── .env.example                # Environment variables template
```

## Database (PostgreSQL)

- **Port:** 5433 (avoids conflict with local pg)
- **Tables:** users, categories, products, orders, order_items, payments, reviews, admin_logs
- **Seed admin:** admin@marketplace.com / Admin123!

### ER Relations

| Relation | Type |
|---|---|
| Users → Orders | One-to-Many |
| Orders → OrderItems | One-to-Many |
| Products → OrderItems | One-to-Many |
| Categories → Products | One-to-Many |
| Orders → Payments | One-to-One |
| Products → Reviews | One-to-Many |
| Users (Admins) → AdminLogs | One-to-Many |

## API Endpoints

### Public
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/categories` | List categories |
| GET | `/api/v1/categories/:id` | Get category by ID |
| GET | `/api/v1/categories/slug/:slug` | Get category by slug |
| GET | `/api/v1/products` | List products (with filters) |
| GET | `/api/v1/products/:id` | Get product |
| GET | `/api/v1/products/slug/:slug` | Get product by slug |
| GET | `/api/v1/products/:productId/reviews` | Get product reviews |
| POST | `/api/v1/webhooks/stripe` | Stripe webhook |

### Authenticated (JWT required)
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/me` | Get profile |
| PUT | `/api/v1/me` | Update profile |
| POST | `/api/v1/orders` | Create order |
| GET | `/api/v1/orders` | My orders |
| GET | `/api/v1/orders/:id` | Get order |
| POST | `/api/v1/products/:productId/reviews` | Create review |
| POST | `/api/v1/payments/checkout` | Create Stripe checkout |

### Admin (JWT + admin role required)
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/admin/users` | List users |
| DELETE | `/api/v1/admin/users/:id` | Delete user |
| POST | `/api/v1/admin/categories` | Create category |
| PUT | `/api/v1/admin/categories/:id` | Update category |
| DELETE | `/api/v1/admin/categories/:id` | Delete category |
| POST | `/api/v1/admin/products` | Create product |
| PUT | `/api/v1/admin/products/:id` | Update product |
| DELETE | `/api/v1/admin/products/:id` | Delete product |
| GET | `/api/v1/admin/orders` | List all orders |
| PUT | `/api/v1/admin/orders/:id/status` | Update order status |
| PUT | `/api/v1/admin/reviews/:id/approve` | Approve review |
| DELETE | `/api/v1/admin/reviews/:id` | Delete review |

## Getting Started

### 1. Start PostgreSQL
```bash
docker-compose up -d
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your Stripe keys
```

### 3. Run the server
```bash
go run ./cmd/server
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Server port |
| `DB_HOST` | `localhost` | Database host |
| `DB_PORT` | `5433` | Database port |
| `DB_USER` | `marketplace_user` | Database user |
| `DB_PASSWORD` | `marketplace_pass` | Database password |
| `DB_NAME` | `marketplace` | Database name |
| `JWT_SECRET` | — | JWT signing secret |
| `JWT_EXPIRATION_HOURS` | `72` | Token lifetime |
| `STRIPE_SECRET_KEY` | — | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | — | Webhook signing secret |
| `STRIPE_SUCCESS_URL` | `http://localhost:4200/orders/success` | Post-payment redirect |
| `STRIPE_CANCEL_URL` | `http://localhost:4200/cart` | Cancel redirect |
| `CDN_URL` | — | Cloudflare CDN base URL |
| `CORS_ORIGINS` | `http://localhost:4200` | Allowed origins |

## Deployment

### Render / Railway
1. Push to GitHub
2. Create a new Web Service from the repo
3. Set the build command: `go build -o server ./cmd/server`
4. Set the start command: `./server`
5. Add environment variables from `.env.example`
6. Attach a PostgreSQL database (Render provides managed PostgreSQL)

### Docker
```bash
docker build -t marketplace-api .
docker run -p 8080:8080 marketplace-api
```

## Key Design Decisions

- **Clean Architecture**: Domain entities are independent of frameworks; repositories are interfaces; use cases contain business logic; delivery layer handles HTTP concerns
- **Transactions**: Order creation updates stock atomically; Stripe webhook confirms payment within same transaction context
- **CDN**: Product images use Cloudflare URLs stored in the `images` array field
- **Stripe**: Checkout sessions created with line items; webhook handled asynchronously with idempotency
- **Security**: Passwords hashed with bcrypt; JWT with HMAC signing; admin endpoints locked via middleware
