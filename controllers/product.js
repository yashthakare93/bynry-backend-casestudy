const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const sequelize = require('../config/database');

const createProduct = async (req, res) => {
  try {
    // 1. Check if required fields exist
    const { name, sku, price, warehouse_id, initial_quantity } = req.body;
    
    if (!name || !sku || !price || !warehouse_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, sku, price, warehouse_id'
      });
    }

    // 2. Check if SKU already exists
    const existingProduct = await Product.findOne({ where: { sku } });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists'
      });
    }

    // 3. Use transaction to save both together
    const result = await sequelize.transaction(async (t) => {
      // Create product
      const product = await Product.create({
        name,
        sku,
        price: parseFloat(price)
      }, { transaction: t });

      // Create inventory
      const inventory = await Inventory.create({
        product_id: product.id,
        warehouse_id: parseInt(warehouse_id),
        quantity: parseInt(initial_quantity) || 0
      }, { transaction: t });

      return { product, inventory };
    });

    // 4. Return success with correct status code
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product_id: result.product.id
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};

module.exports = { createProduct };