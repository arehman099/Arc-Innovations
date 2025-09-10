-- 02_seed.sql
INSERT INTO suppliers(name,email) VALUES
('North Supply','north@example.com'),
('Blue Traders','blue@example.com');

INSERT INTO products(sku,name,unit_price,reorder_level,supplier_id) VALUES
('SKU-100','USB-C Cable',9.99,25,1),
('SKU-200','Wireless Mouse',19.50,15,2);

INSERT INTO customers(name,email) VALUES
('Acme SRL','ops@acme.it'), ('Globex','it@globex.com');

-- stock in
INSERT INTO stock_movements(product_id,delta,reason) VALUES
(1,100,'initial'), (2,60,'initial');
