.PHONY: all backend frontend db dev build test lint clean

# ─── Default ──────────────────────────────────────────────────────────────────
all: backend

# ─── Backend (Go) ─────────────────────────────────────────────────────────────
backend:
	go run ./cmd/server

backend-build:
	go build -o bin/server ./cmd/server

backend-test:
	go test ./...

backend-vet:
	go vet ./...

backend-lint:
	go vet ./...

# ─── Frontend (Angular) ───────────────────────────────────────────────────────
frontend:
	cd web && npm start

frontend-build:
	cd web && npm run build

frontend-install:
	cd web && npm install

# ─── Database ─────────────────────────────────────────────────────────────────
db-up:
	docker-compose up -d

db-down:
	docker-compose down

db-reset:
	docker-compose down -v
	docker-compose up -d

db-logs:
	docker-compose logs -f postgres

# ─── Development (backend + frontend concurrently) ────────────────────────────
dev:
	@echo "Start backend and frontend in separate terminals:"
	@echo "  make backend  (http://localhost:8080)"
	@echo "  make frontend (http://localhost:4200)"

# ─── Docker ───────────────────────────────────────────────────────────────────
docker-build:
	docker build -t marketplace-api .

docker-run:
	docker run -p 8080:8080 --env-file .env marketplace-api

# ─── Build all ────────────────────────────────────────────────────────────────
build: backend-build frontend-build

# ─── Tests ────────────────────────────────────────────────────────────────────
test: backend-test

# ─── Lint ─────────────────────────────────────────────────────────────────────
lint: backend-vet

# ─── Clean ────────────────────────────────────────────────────────────────────
clean:
	rm -rf bin/
	rm -rf web/dist/
	rm -rf web/node_modules/
