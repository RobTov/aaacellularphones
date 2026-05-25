-- ============================================================
-- AUDIT LOGS (immutable, insert-only via triggers)
-- ============================================================
CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    record_id UUID NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_logs_table_action ON logs(table_name, action);
CREATE INDEX idx_logs_record ON logs(record_id);
CREATE INDEX idx_logs_created ON logs(created_at DESC);

-- Revoke UPDATE and DELETE on logs for all roles
REVOKE UPDATE, DELETE ON logs FROM PUBLIC;
REVOKE UPDATE, DELETE ON logs FROM marketplace_user;

-- ============================================================
-- TRIGGER FUNCTION: inserts a row into logs
-- ============================================================
CREATE OR REPLACE FUNCTION log_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    rec_id UUID;
    uid UUID;
BEGIN
    uid := current_setting('app.current_user_id', true)::UUID;

    IF TG_OP = 'INSERT' THEN
        rec_id := NEW.id;
    ELSE
        rec_id := OLD.id;
    END IF;

    INSERT INTO logs (table_name, action, record_id, user_id)
    VALUES (TG_TABLE_NAME, TG_OP, rec_id, uid);

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS on Products, Orders, Users, Payments
-- ============================================================
DROP TRIGGER IF EXISTS trg_products_audit ON products;
CREATE TRIGGER trg_products_audit
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION log_audit_trigger();

DROP TRIGGER IF EXISTS trg_orders_audit ON orders;
CREATE TRIGGER trg_orders_audit
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW EXECUTE FUNCTION log_audit_trigger();

DROP TRIGGER IF EXISTS trg_users_audit ON users;
CREATE TRIGGER trg_users_audit
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION log_audit_trigger();

DROP TRIGGER IF EXISTS trg_payments_audit ON payments;
CREATE TRIGGER trg_payments_audit
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION log_audit_trigger();

-- ============================================================
-- Add status column to products (out-of-stock support)
-- ============================================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'out_of_stock', 'discontinued'));

CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
