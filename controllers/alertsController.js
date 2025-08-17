// controllers/alertsController.js
const pool = require('../db'); // ✅ Fixed: should be '../db', not '../db/index'

/**
 * GET /api/companies/:company_id/alerts/low-stock
 * Returns low-stock alerts with supplier info for reordering
 */
const getLowStockAlerts = async (req, res) => {
  const companyId = parseInt(req.params.company_id);

  try {
    // 1. Check if company exists
    const companyResult = await pool.query(
      'SELECT 1 FROM companies WHERE id = $1', [companyId]
    );
    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // 2. Get all warehouses for this company
    const warehousesResult = await pool.query(
      'SELECT id, name FROM warehouses WHERE company_id = $1', [companyId]
    );
    if (warehousesResult.rows.length === 0) {
      return res.json({ alerts: [], total_alerts: 0 });
    }

    const warehouseIds = warehousesResult.rows.map(w => w.id);
    const alerts = [];

    // 3. Find products with low stock
    const lowStockQuery = `
      SELECT 
        p.id AS product_id,
        p.name AS product_name,
        p.sku,
        p.stock_threshold,
        i.warehouse_id,
        w.name AS warehouse_name,
        i.quantity AS current_stock
      FROM inventory i
      JOIN products p ON p.id = i.product_id
      JOIN warehouses w ON w.id = i.warehouse_id
      WHERE i.warehouse_id = ANY($1)
        AND i.quantity < p.stock_threshold
    `;
    const lowStockResult = await pool.query(lowStockQuery, [warehouseIds]);

    // 4. For each low-stock item, check recent sales & get supplier
    for (const row of lowStockResult.rows) {
      // Only alert if product had a sale in last 30 days
      const saleCheck = await pool.query(
        `SELECT 1 FROM inventory_logs 
         WHERE product_id = $1 AND warehouse_id = $2 
           AND reason = 'sale' 
           AND created_at >= NOW() - INTERVAL '30 days'
         LIMIT 1`,
        [row.product_id, row.warehouse_id]
      );
      if (saleCheck.rows.length === 0) continue; // Skip inactive products

      // Estimate days until stockout (simplified)
      const avgDailySales = 2;
      const daysUntilStockout = Math.floor(row.current_stock / avgDailySales); // ✅ declared as camelCase

      // Get supplier info
      const supplierResult = await pool.query(`
        SELECT s.id, s.name, s.contact_info AS contact_email
        FROM supplier_products sp
        JOIN suppliers s ON s.id = sp.supplier_id
        WHERE sp.product_id = $1
        LIMIT 1
      `, [row.product_id]);

      const supplier = supplierResult.rows[0] || null;

      alerts.push({
        product_id: row.product_id,
        product_name: row.product_name,
        sku: row.sku,
        warehouse_id: row.warehouse_id,
        warehouse_name: row.warehouse_name,
        current_stock: row.current_stock,
        threshold: row.stock_threshold,
        days_until_stockout: daysUntilStockout, // ✅ Fixed: use variable correctly
        supplier: supplier ? {
          id: supplier.id,
          name: supplier.name,
          contact_email: supplier.contact_email || null
        } : null
      });
    }

    // 5. Return final response
    return res.json({
      alerts,
      total_alerts: alerts.length
    });

  } catch (error) {
    console.error('Error fetching low-stock alerts:', error);
    return res.status(500).json({
      error: 'An internal server error occurred.'
    });
  }
};

module.exports = { getLowStockAlerts };