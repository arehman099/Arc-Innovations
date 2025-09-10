-- Revenue by month
SELECT DATE_TRUNC('month', o.order_date) AS m,
       SUM(oi.qty*oi.price) AS revenue
FROM orders o JOIN order_items oi USING(order_id)
WHERE o.status IN ('PAID','SHIPPED')
GROUP BY m ORDER BY m;

-- Best sellers
SELECT p.sku, p.name, SUM(oi.qty) AS units
FROM order_items oi JOIN products p USING(product_id)
GROUP BY p.sku,p.name ORDER BY units DESC LIMIT 10;
