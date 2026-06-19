const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Create order (checkout)
router.post('/', auth, async (req, res) => {
  try {
    const { paymentMethod = 'Cash on Delivery' } = req.body;
    
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    let totalAmount = 0;
    const orderItems = cart.items.map(item => {
      const price = item.product.price;
      totalAmount += price * item.quantity;
      return {
        product: item.product._id,
        quantity: item.quantity,
        price: price
      };
    });
    
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      paymentMethod
    });
    
    await order.save();
    
    cart.items = [];
    await cart.save();
    
    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;