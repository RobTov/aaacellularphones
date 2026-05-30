# AAACellularPhones

## Overview

E-commerce marketplace for a physical cell phone store in Arlington, TX. Backend in Go (Gin + sqlx + PostgreSQL), frontend in Angular (standalone components, Vite). Includes admin panel for managing products, categories, orders, users, reviews, and logs.

## Key Features

- **User authentication** — Register and login with bcrypt password hashing, JWT token-based sessions, role-based access (customer / admin)
- **Product catalog** — Browse products with filters: category, price range, text search; sortable by price, name, date; paginated results
- **Product detail** — Full product view with images, specifications, pricing (regular vs. compare-at), stock status
- **Shopping cart** — Add/remove items, persists per authenticated user
- **Checkout & payments** — Stripe Checkout integration, webhook for payment confirmation
- **Order management** — Customers view order history and detail; admins update order status
- **Product reviews & ratings** — Customers leave reviews; admins approve/moderate and delete
- **Admin dashboard** — Overview analytics panel
- **Admin product management** — Full CRUD, image upload, product activation toggle
- **Admin category management** — Full CRUD with slug-based routing
- **Admin user management** — List, search, and delete users
- **Admin order management** — List all orders, update order status
- **Admin payment management** — View payment records
- **Admin review moderation** — Approve or remove reviews
- **Admin audit logs** — Full activity log with entity/action/user tracking via DB triggers
- **Image upload** — Admin product image uploads served from `/uploads`
- **Responsive UI** — Angular frontend with Tailwind CSS, mobile-friendly

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Angular     │────▶│  Go Backend  │────▶│ PostgreSQL │
│  :4200       │     │  :8080       │     │  :5433     │
└─────────────┘     └──────┬───────┘     └────────────┘
                           │
                    ┌──────▼───────┐
                    │  Stripe      │
                    │  Checkout    │
                    └──────────────┘
```

## Stack

- **Backend**: Go 1.23, Gin, sqlx, lib/pq, stripe-go v74
- **Frontend**: Angular 19, Vite, Tailwind CSS (via CDN), ngx-toastr
- **Database**: PostgreSQL 16 (Docker)
- **Payments**: Stripe Checkout Sessions + Webhooks

## Stripe Payment Flow (Development)

### Implementation

1. **Checkout Session Creation** (`POST /api/v1/payments/checkout`)
   - Authenticated endpoint (requires JWT)
   - Accepts `{ "order_id": "uuid" }`
   - Looks up the order, validates ownership, creates Stripe `CheckoutSession` with line items
   - Returns `{ "url": "https://checkout.stripe.com/..." }`
   - Uses `STRIPE_SECRET_KEY` from `.env`
   - File: `internal/usecase/usecase.go` — `CreateCheckoutSession()`, `lineItemsFromOrder()`

2. **Frontend Redirect**
   - Cart component calls checkout endpoint, then does `window.location.href = res.url`
   - File: `web/src/app/features/cart/cart.component.ts`

3. **Webhook Handling** (`POST /api/v1/webhooks/stripe`)
   - Public endpoint (no JWT), verified via Stripe signature
   - Event type: `checkout.session.completed`
   - On completion: updates order status to `paid`, records payment in `payments` table
   - Uses `STRIPE_WEBHOOK_SECRET` from `.env`
   - Files: `internal/delivery/order_handler.go` — `HandleWebhook()`, `internal/delivery/router.go` — route registration

### Configuration

Keys loaded from `.env` via auto-loader in `config.init()`:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=http://localhost:4200/orders/success
STRIPE_CANCEL_URL=http://localhost:4200/cart
```

### Bug Fixes Applied

- **Audit triggers crashing on table mutations**: The trigger function `log_audit_trigger()` reads `app.current_user_id` via `current_setting`, which returns empty string `''` when unset. Casting to `UUID` fails. Fixed with `NULLIF(current_setting('app.current_user_id', true), '')::UUID`. File: `migrations/002_audit_logs.sql`
- **`setAuditUserID` using wrong DB handle**: Was calling `r.db.ExecContext()` (pool) instead of `tx.ExecContext()` (transaction). Fixed by changing parameter type to `sqlx.ExtContext`. File: `internal/repository/postgres/order_repo.go`
- **Order creation panic on empty images**: `product.Images[0]` panics if `Images` is empty. Added length check. File: `internal/usecase/usecase.go` — `createOrder()`
- **Product image URLs not resolving to full URL**: Category/product endpoints returned relative filenames (e.g. `seed_18.jpg`) instead of full URLs. Added `resolveProductImages()` and `requestBaseURL()` helpers in `internal/delivery/category_handler.go:330`.
- **CORS errors (browser blocking API requests)**: The CORS middleware validated `Origin` against a fixed `CORS_ORIGINS` list. If the browser sent Origin not in the list (e.g. `http://127.0.0.1:4200` instead of `http://localhost:4200`), the middleware fell back to `allowed[0]`, causing a mismatch. Fixed by echoing back the request's Origin unconditionally. Also added `Vary: Origin` header and reduced `Max-Age` to 3600s. File: `internal/middleware/cors.go`
- **MaxListenersExceededWarning in Angular dev server**: The `start` script used `NODE_OPTIONS="--require=..." ng serve`, but `--require` is not allowed in `NODE_OPTIONS` in Node.js v22, so the preload script was silently ignored. Fixed by using `node --require=./.increase-listeners.js ./node_modules/@angular/cli/bin/ng.js serve` directly. File: `web/package.json`
- **`PUT/DELETE /admin/products/:id` 500 error**: Route uses `:id` but handlers read `c.Param("productId")`, so `p.ID` was always empty — PostgreSQL rejects empty-string UUID. Fixed: changed to `c.Param("id")` in both `Update` and `Delete`. File: `internal/delivery/category_handler.go:139,184`
- **Updating a product silently deactivates it**: The admin product form didn't include `is_active` or `status`, so `IsActive` defaulted to `false` and the product disappeared from the public list. Fixed: added `is_active: true` and `status: 'active'` controls to the form, patched existing values on edit. Also added `status = :status` to the SQL UPDATE query (was missing). Files: `web/src/app/features/admin/products/products.component.ts`, `internal/repository/postgres/user_repo.go:201`
- **`is_active` missing from INSERT queries (categories + users)**: The CREATE queries for categories and users omitted `is_active` from the column list, so even though the Go code set it, the DB default was always used. Fixed: added `is_active` to both INSERT statements. Files: `internal/repository/postgres/user_repo.go:21,95`
- **`UpdateStatus` returns success on non-existent order**: `RowsAffected` was discarded, so updating status on a bogus order ID returned success. Fixed: check `RowsAffected() == 0` and return error. File: `internal/repository/postgres/order_repo.go:81`
- **`ListUsers` crashes on page=0 or negative page**: No guard against `page < 1`, causing a negative SQL `OFFSET`. Fixed: added `if page < 1 { page = 1 }` guard. File: `internal/usecase/usecase.go:132`

### Known Issues

- **Partial payloads on product/category update**: `NamedExecContext` binds zero-values (e.g. `CategoryID=""`) to `UUID NOT NULL` columns. The admin panel always sends all fields, but direct API calls with partial JSON will silently zero omitted fields.

## Database Seeding

### Seed Command

```bash
make db-seed   # runs go run ./cmd/seed
```

### What It Seeds

`cmd/seed/main.go` clears existing data and inserts:

- **8 Categories**: Phones, Laptops, Gaming Consoles, Tablets, Audio, Smart Home, Cameras, Accessories
- **34 Products** across all categories with realistic data:
  - 8 Phones (iPhone 16 Pro Max, Galaxy S25 Ultra, Pixel 9 Pro, etc.)
  - 6 Laptops (MacBook Pro M4, Dell XPS 15, ThinkPad X1 Carbon, etc.)
  - 5 Gaming Consoles (PS5 Pro, Xbox Series X, Switch 2, Steam Deck OLED, ROG Ally X)
  - 4 Tablets (iPad Pro M4, Galaxy Tab S10 Ultra, Surface Pro 11, iPad Air M3)
  - 4 Audio (AirPods Pro 3, Sony WH-1000XM6, Bose QC Ultra, Galaxy Buds 3 Pro)
  - 3 Smart Home (Apple Watch Ultra 3, Galaxy Watch 7 Ultra, Ring Doorbell Pro 3)
  - 2 Cameras (Sony A7 V, GoPro Hero 13 Black)
  - 2 Accessories (Anker PowerCore 26800mAh, Belkin 3-in-1 MagSafe Charger)

Each product includes:
- Real-world prices, compare prices, stock counts
- 2-3 placeholder images (`seed_*.jpg` in `uploads/`)
- Hardware specifications as JSONB (chip, RAM, storage, display, camera, battery, etc.)

### Image Downloads

23 placeholder images from picsum.photos (`uploads/seed_1.jpg` through `uploads/seed_23.jpg`). Reused round-robin across products.

## Quick Start

### Prerequisites

- Docker + Docker Compose
- Go 1.23+
- Node.js 22+
- Stripe test keys in `.env`

### Running

```bash
# Terminal 1 — Database
docker-compose up -d

# Terminal 2 — Backend (Go)
make backend

# Terminal 3 — Frontend (Angular)
make frontend

# Seed database
make db-seed
```

Then open `http://localhost:4200`.

### Environment Variables (`.env`)

```
PORT=8080
GIN_MODE=release
DB_HOST=localhost
DB_PORT=5433
DB_USER=marketplace_user
DB_PASSWORD=marketplace_pass
DB_NAME=marketplace
DB_SSLMODE=disable
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION_HOURS=72
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=http://localhost:4200/orders/success
STRIPE_CANCEL_URL=http://localhost:4200/cart
CORS_ORIGINS=http://localhost:4200,http://127.0.0.1:4200
```


STRIPE_TEST_CARD: 4242 4242 4242 4242 (any CVV/future date)