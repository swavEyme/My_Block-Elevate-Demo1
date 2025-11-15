const express = require('express');
const { pgPool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { trackActivity } = require('../services/activityService');

const router = express.Router();

// GET /api/shop/products
router.get('/products', authenticateToken, async (req, res, next) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query;

    // TODO: Integrate with e-commerce APIs
    // Example: Shopify API, WooCommerce API, Stripe Products API
    
    let query = `
      SELECT product_id, name, description, price, category, image_url, stock_quantity
      FROM products 
      WHERE active = true
    `;
    const params = [];

    if (category) {
      query += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    // This table would need to be created in your schema
    // const result = await pgPool.query(query, params);
    
    // Mock response for now
    const mockProducts = [
      {
        product_id: 1,
        name: "Wellness Journal",
        description: "Daily mindfulness and gratitude journal",
        price: 24.99,
        category: "wellness",
        image_url: "/images/wellness-journal.jpg",
        stock_quantity: 50
      },
      {
        product_id: 2,
        name: "Meditation Cushion",
        description: "Comfortable meditation cushion for daily practice",
        price: 49.99,
        category: "meditation",
        image_url: "/images/meditation-cushion.jpg",
        stock_quantity: 25
      }
    ];

    await trackActivity(req.user.user_id, 'SHOP_PRODUCTS_VIEWED', {
      category,
      product_count: mockProducts.length
    });

    res.json(mockProducts);
  } catch (error) {
    next(error);
  }
});

// GET /api/shop/orders
router.get('/orders', authenticateToken, async (req, res, next) => {
  try {
    const query = `
      SELECT order_id, total_amount, status, created_at
      FROM orders 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    
    // This table would need to be created in your schema
    // const result = await pgPool.query(query, [req.user.user_id]);
    
    // Mock response for now
    const mockOrders = [
      {
        order_id: 1,
        total_amount: 74.98,
        status: "delivered",
        created_at: "2024-01-10T14:30:00Z"
      }
    ];

    res.json(mockOrders);
  } catch (error) {
    next(error);
  }
});

// POST /api/shop/orders
router.post('/orders', authenticateToken, async (req, res, next) => {
  try {
    const { items, shipping_address, payment_method } = req.body;

    // TODO: Integrate with payment processing APIs
    // Example: Stripe API, PayPal API, Square API
    
    // TODO: Integrate with shipping APIs
    // Example: ShipStation API, FedEx API, UPS API
    
    const total_amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    await trackActivity(req.user.user_id, 'ORDER_PLACED', {
      total_amount,
      item_count: items.length,
      payment_method
    });

    res.status(201).json({
      message: 'Order placed successfully',
      order_id: Date.now(), // Mock ID
      total_amount
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/shop/inventory (admin/manager only)
router.get('/inventory', authenticateToken, requireRole(['SuperAdmin', 'PlatformEditor']), async (req, res, next) => {
  try {
    // TODO: Integrate with inventory management APIs
    // Example: TradeGecko API, Cin7 API, Zoho Inventory API
    
    const mockInventory = [
      {
        product_id: 1,
        name: "Wellness Journal",
        stock_quantity: 50,
        reorder_level: 10,
        supplier: "Wellness Co."
      },
      {
        product_id: 2,
        name: "Meditation Cushion",
        stock_quantity: 25,
        reorder_level: 5,
        supplier: "Meditation Supplies Inc."
      }
    ];

    res.json(mockInventory);
  } catch (error) {
    next(error);
  }
});

// PUT /api/shop/products/:id (admin/manager only)
router.put('/products/:id', authenticateToken, requireRole(['SuperAdmin', 'PlatformEditor']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock_quantity } = req.body;

    // TODO: Update product in e-commerce platform
    // TODO: Sync with external inventory systems
    
    await trackActivity(req.user.user_id, 'PRODUCT_UPDATED', {
      product_id: id,
      changes: { name, description, price, stock_quantity }
    });

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;