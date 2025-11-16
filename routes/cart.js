const express = require('express');
const router = express.Router();

const Product = require('../models/Product');
const User = require('../models/User');

// Check if user is logged
function requireUser(req, res, next) {
  if (!req.session || !req.session.isLoggedIn) {
    return res.status(401).json({ success: false, error: 'Please login to add items to cart' });
  }
  if (req.session.user.isAdmin) {
    return res.status(403).json({ success: false, error: 'Admins cannot add items to cart' });
  }
  next();
}


// Get cart items (accessible to everyone, but only logged-in non-admin users can add items)
router.get('/', async (req, res) => {
  try {
    let cart = [];
    
    // Get cart from database if user is logged in
    if (req.session.isLoggedIn && !req.session.user.isAdmin) {
      const user = await User.findById(req.session.user.id);

      if (user && user.cart) {
        cart = user.cart;
        req.session.cart = cart;
      } else if (req.session.cart) {
        cart = req.session.cart;

        if (user) {
          user.cart = cart;
          await user.save();
        }
      }
    }
    
    // Fetch full product details for cart items
    const cartItems = [];
    for (const item of cart) {
      const product = await Product.findOne({ id: item.productId });
      
      if (!product) continue;
      
      cartItems.push({
        id: item.productId,
        name: product.name,
        price: product.price,
        image: product.image || '🏏',
        quantity: item.quantity || 1,
        stock: product.stock || 0
      });
    }
    
    res.render('cart', {
      title: 'ScoreMash - Shopping Cart',
      currentPage: '',
      cartItems: cartItems,
      user: req.session.user || null
    });

  } catch (error) {
    console.error('Error loading cart:', error);

    res.render('cart', {
      title: 'ScoreMash - Shopping Cart',
      currentPage: '',
      cartItems: [],
      user: req.session.user || null
    });
  }
});

// Add item to cart
router.post('/add', requireUser, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ success: false, error: 'Product ID is required' });
    }
    
    // Verify product exists
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    const requestedQuantity = parseInt(quantity) || 1;
    const availableStock = product.stock || 0;
    
    // Get user from database
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Initialize cart if it doesn't exist
    if (!user.cart) user.cart = [];
    
    // Check if product is already in cart
    const existingItemIndex = user.cart.findIndex(item => item.productId === productId);
    
    let newQuantity = requestedQuantity;
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      newQuantity += user.cart[existingItemIndex].quantity;
    } 
    
    // Check stock availability
    if (newQuantity > availableStock) {
      return res.status(400).json({ 
        success: false, 
        error: `Only ${availableStock} item(s) available in stock. You already have ${existingItemIndex >= 0 ? user.cart[existingItemIndex].quantity : 0} in your cart.` 
      });
    }
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      user.cart[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      user.cart.push({
        productId: productId,
        quantity: newQuantity
      });
    }
    
    // Save to database
    await user.save();
    req.session.cart = user.cart;

    res.json({ success: true, message: 'Product added to cart' });

  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, error: 'Error adding product to cart' });
  }
});

// Update cart item quantity
router.post('/update', requireUser, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || quantity === undefined) {
      return res.status(400).json({ success: false, error: 'Product ID and quantity are required' });
    }
    
    // Get user from database
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    if (!user.cart || user.cart.length === 0) {
      return res.status(404).json({ success: false, error: 'Cart is empty' });
    }
    
    const itemIndex = user.cart.findIndex(item => item.productId === productId);
    if (itemIndex < 0) {
      return res.status(404).json({ success: false, error: 'Item not found in cart' });
    }

    const newQuantity = parseInt(quantity);
    
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      user.cart.splice(itemIndex, 1);
      await user.save();
      req.session.cart = user.cart;
      return res.json({ success: true, message: 'Item removed from cart' });
    }
    
    // Check stock availability
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    const availableStock = product.stock || 0;
    if (newQuantity > availableStock) {
      return res.status(400).json({ 
        success: false, 
        error: `Only ${availableStock} item(s) available in stock` 
      });
    }
    
    user.cart[itemIndex].quantity = newQuantity;
    await user.save();
    req.session.cart = user.cart;

    res.json({ success: true, message: 'Cart updated' });
    
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ success: false, error: 'Error updating cart' });
  }
});

// Remove item from cart
router.post('/remove', requireUser, async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ success: false, error: 'Product ID is required' });
    }
    
    // Get user from database
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    if (!user.cart || user.cart.length === 0) {
      return res.status(404).json({ success: false, error: 'Cart is empty' });
    }
    
    const itemIndex = user.cart.findIndex(item => item.productId === productId);
    
    if (itemIndex < 0) {
      return res.status(404).json({ success: false, error: 'Item not found in cart' });
    }

    user.cart.splice(itemIndex, 1);
    await user.save();
    req.session.cart = user.cart;

    res.json({ success: true, message: 'Item removed from cart' });
    
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, error: 'Error removing item from cart' });
  }
});

// Get cart count 
router.get('/count', async (req, res) => {
  try {
    if (!req.session || !req.session.isLoggedIn || req.session.user.isAdmin) {
      return res.json({ count: 0 });
    }
    
    // Get cart from database
    const user = await User.findById(req.session.user.id);
    const cart = (user && user.cart) ? user.cart : (req.session.cart || []);
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    res.json({ count: count });

  } catch (error) {
    console.error('Error getting cart count:', error);
    res.json({ count: 0 });
  }
});

module.exports = router;

