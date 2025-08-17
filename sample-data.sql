-- Insert test data (safe to run multiple times)

-- Company: Bynry Retail
INSERT INTO companies (id, name) 
VALUES (1, 'Bynry Retail') 
ON CONFLICT (id) DO NOTHING;

-- Warehouse: Main Warehouse (linked to company 1)
INSERT INTO warehouses (id, company_id, name, location) 
VALUES (456, 1, 'Main Warehouse', 'Delhi') 
ON CONFLICT (id) DO NOTHING;

-- Product: Widget A with stock threshold
INSERT INTO products (id, sku, name, description, is_bundle, stock_threshold) 
VALUES (123, 'WID-001', 'Widget A', 'A sample test product', false, 20) 
ON CONFLICT (id) DO NOTHING;

-- Inventory: 5 units in warehouse 456
INSERT INTO inventory (product_id, warehouse_id, quantity) 
VALUES (123, 456, 5) 
ON CONFLICT (product_id, warehouse_id) 
DO UPDATE SET quantity = EXCLUDED.quantity;

-- Inventory Log: Recent sale (required for low-stock alert)
INSERT INTO inventory_logs (product_id, warehouse_id, quantity_change, reason, created_at) 
VALUES (123, 456, -3, 'sale', NOW()) 
ON CONFLICT DO NOTHING;

-- Supplier: Supplier Corp
INSERT INTO suppliers (id, name, contact_info) 
VALUES (789, 'Supplier Corp', 'orders@supplier.com') 
ON CONFLICT (id) DO NOTHING;

-- Supplier Products: Link supplier to product with cost
INSERT INTO supplier_products (supplier_id, product_id, cost_price) 
VALUES (789, 123, 9.99) 
ON CONFLICT (supplier_id, product_id) DO NOTHING;