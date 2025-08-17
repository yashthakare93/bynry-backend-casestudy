-- Core Tables --

-- A company (like a business) that uses the system
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,          -- Unique number for each company
    name VARCHAR(255) NOT NULL,     -- Name of the company
    created_at TIMESTAMPTZ DEFAULT NOW() -- When it was added
);

-- A place where products are stored (a warehouse)
-- One company can have many warehouses
CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,                      -- Unique number for each warehouse
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE, -- Links to the company
    name VARCHAR(255) NOT NULL,                 -- Name of the warehouse (e.g., "Main Warehouse")
    location TEXT,                              -- Where it is (city or address)
    created_at TIMESTAMPTZ DEFAULT NOW()        -- When it was added
);

-- A product the company sells or tracks
-- Each product has a unique code (SKU)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,                      -- Unique number for each product
    sku VARCHAR(100) UNIQUE NOT NULL,           -- Unique product code
    name VARCHAR(255) NOT NULL,                 -- Product name (e.g., "Phone Charger")
    description TEXT,                           -- Extra info about the product
    is_bundle BOOLEAN DEFAULT false,            -- True if this product is made of other products
    created_at TIMESTAMPTZ DEFAULT NOW()        -- When the product was added
);

-- A supplier who provides products to the company
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,                      -- Unique number for each supplier
    name VARCHAR(255) NOT NULL,                 -- Supplier's name (e.g., "ABC Electronics")
    contact_info TEXT,                          -- Phone or email to reach them
    created_at TIMESTAMPTZ DEFAULT NOW()        -- When they were added
);


-- Join Tables (for relationships) --

-- How many of each product is in each warehouse
CREATE TABLE inventory (
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE, -- Which product
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE, -- Which warehouse
    quantity INTEGER NOT NULL DEFAULT 0,        -- How many are in stock
    PRIMARY KEY (product_id, warehouse_id)      -- One line per product-warehouse pair
);

-- Keeps a log of every time stock goes up or down
-- Helps track sales, restocks, or damage
CREATE TABLE inventory_logs (
    id BIGSERIAL PRIMARY KEY,                   -- Unique log ID
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE SET NULL, -- Which product changed
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE SET NULL, -- Which warehouse
    quantity_change INTEGER NOT NULL,           -- How much was added (+) or removed (-)
    reason VARCHAR(100),                        -- Why: 'sale', 'restock', 'return', 'damage'
    created_at TIMESTAMPTZ DEFAULT NOW()        -- When the change happened
);

-- Links a supplier to the products they sell
-- So we know who to order from and at what price
CREATE TABLE supplier_products (
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE, -- Which supplier
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,   -- Which product
    cost_price DECIMAL(10, 2),                  -- How much it costs to buy from this supplier
    PRIMARY KEY (supplier_id, product_id)       -- One price per supplier-product
);

-- If a product is a bundle (like a gift set), this table says what's inside
-- And how many of each item
CREATE TABLE product_bundles (
    bundle_product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE, -- The bundle itself
    component_product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE, -- Item inside the bundle
    quantity_in_bundle INTEGER NOT NULL,        -- How many of this item go in the bundle
    PRIMARY KEY (bundle_product_id, component_product_id) -- No duplicates
);