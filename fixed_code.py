from flask import request, jsonify
from app import app, db
from models import Product, Inventory
@app.route('/api/products', methods=['POST'])
def create_product():
    data = request.get_json()

    # 1. Validate required fields
    if not data:
        return jsonify({"error": "No data provided"}), 400

    required_fields = ['name', 'sku', 'price', 'warehouse_id', 'initial_quantity']
    for field in required_fields:
        if field not in data: 
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # 2. Check if SKU is unique
    if Product.query.filter_by(sku=data['sku']).first():
        return jsonify({"error": "A product with this SKU already exists."}), 409

    # 3. Use transaction for consistency
    try:
        product = Product(
            name=data['name'],
            sku=data['sku'],
            price=float(data['price'])
        )
        db.session.add(product)
        db.session.flush()

        inventory = Inventory(
            product_id=product.id,
            warehouse_id=data['warehouse_id'],
            quantity=int(data['initial_quantity'])
        )
        db.session.add(inventory)
        db.session.commit()

        return jsonify({
            "message": "Product created successfully",
            "product_id": product.id
        }), 201

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error creating product: {e}")
        return jsonify({"error": "Internal server error"}), 500