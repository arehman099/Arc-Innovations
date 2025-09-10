-- 01_schema.sql
CREATE TABLE suppliers (
  supplier_id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120), phone VARCHAR(40)
);

CREATE TABLE products (
  product_id SERIAL PRIMARY KEY,
  sku VARCHAR(40) UNIQUE NOT NULL,
  name VARCHAR(140) NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  reorder_level INT DEFAULT 10 CHECK (reorder_level >= 0),
  supplier_id INT REFERENCES suppliers(supplier_id)
);

CREATE TABLE customers (
  customer_id SERIAL PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  email VARCHAR(140) UNIQUE
);

CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(customer_id),
  order_date TIMESTAMP NOT NULL DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'NEW' CHECK (status IN ('NEW','PAID','SHIPPED','CANCELLED'))
);

CREATE TABLE order_items (
  order_item_id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id INT REFERENCES products(product_id),
  qty INT NOT NULL CHECK (qty > 0),
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE stock_movements (
  movement_id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(product_id),
  delta INT NOT NULL, -- +in / -out
  reason VARCHAR(60) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Current stock is sum of deltas
CREATE VIEW v_stock AS
SELECT p.product_id, p.sku, p.name,
       COALESCE(SUM(sm.delta),0) AS stock
FROM products p
LEFT JOIN stock_movements sm ON sm.product_id=p.product_id
GROUP BY p.product_id;

-- Low-stock report
CREATE VIEW v_low_stock AS
SELECT p.product_id, p.sku, p.name, s.stock, p.reorder_level
FROM products p
JOIN v_stock s USING(product_id)
WHERE s.stock <= p.reorder_level;

-- Simple audit log
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT, row_id TEXT, action TEXT,
  changed_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION audit_orders()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs(table_name,row_id,action)
  VALUES('orders', COALESCE(NEW.order_id,OLD.order_id)::text, TG_OP);
  RETURN COALESCE(NEW, OLD);
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_orders
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW EXECUTE FUNCTION audit_orders();
