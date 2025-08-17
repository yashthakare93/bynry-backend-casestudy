const { Product, Inventory, sequelize } = require('../models');

// Safely creates a new product and its initial inventory.
const createProduct = async (req, res) => {
  try {
    const { name, sku, price, warehouse_id, initial_quantity } = req.body;
    
    // 1. Check for required fields.
    if (!name || !sku || !price || !warehouse_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, sku, price, and warehouse_id are all required.'
      });
    }

    // 2. Check for a duplicate SKU.
    const existingProduct = await Product.findOne({ where: { sku } });
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: `A product with SKU '${sku}' already exists.`
      });
    }

    // 3. Create both records in a transaction (all or nothing).
    const result = await sequelize.transaction(async (t) => {
      const product = await Product.create({
        name, sku, price: parseFloat(price)
      }, { transaction: t });

      const inventory = await Inventory.create({
        product_id: product.id,
        warehouse_id: parseInt(warehouse_id),
        quantity: parseInt(initial_quantity) || 0
      }, { transaction: t });

      return { product, inventory };
    });

    // 4. Success! Send a 201 Created response.
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product_id: result.product.id
    });

  } catch (error) {
    // If anything fails, log the error and send a generic 500 response.
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred.'
    });
  }
};

module.exports = { createProduct };