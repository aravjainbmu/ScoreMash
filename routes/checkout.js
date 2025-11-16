const express = require('express');
const router = express.Router();

const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// Middleware to require user login
function requireUser(req, res, next) {
  if (!req.session || !req.session.isLoggedIn) {
    return res.redirect('/auth/signin');
  }
  if (req.session.user.isAdmin) {
    return res.status(403).json({ success: false, error: 'Admins cannot checkout' });
  }
  next();
}

// Load cart and product details
async function loadOrderItems(cart) {
  const items = [];

  for (const item of cart) {
    const product = await Product.findOne({ id: item.productId });
    if (!product) continue;

    items.push({
      id: item.productId,
      name: product.name,
      price: product.price,
      image: product.image || '🏏',
      quantity: item.quantity || 1
    })
  }

  return items;
}

// Step 1: Shipping Information
router.get('/', requireUser, async (req, res) => {
  try {
    // Get cart from database
    let cart = [];
    const user = await User.findById(req.session.user.id);

    if (user && user.cart) {
      cart = user.cart;
      req.session.cart = cart;
    } else if (req.session.cart) {
      cart = req.session.cart;
    }
    
    if (cart.length === 0) {
      return res.redirect('/cart');
    }
    
    // Fetch full product details for cart items
    const orderItems = await loadOrderItems(cart);
    if (orderItems.length === 0) return res.redirect('/cart');
    
    res.render('checkout', {
      title: 'ScoreMash - Checkout',
      currentPage: '',
      orderItems: orderItems,
      step: 1,
      user: req.session.user || null
    });

  } catch (error) {
    console.error('Error loading checkout:', error);
    res.redirect('/cart');
  }
});

// Step 1: Process shipping information
router.post('/', requireUser, async (req, res) => {
  try {
    const { firstName, lastName, address, city, state, postalCode, country } = req.body;
    
    const user = await User.findById(req.session.user.id);
    let cart = [];

    if (user && user.cart) {
      cart = user.cart;
    } else if (req.session.cart) {
      cart = req.session.cart;
    }

    const orderItems = await loadOrderItems(cart);
    
    if (!firstName || !lastName || !address || !city || !state || !postalCode || !country) {
      return res.render('checkout', {
        title: 'ScoreMash - Checkout',
        currentPage: '',
        orderItems: orderItems,
        step: 1,
        error: 'Please fill in all shipping fields',
        user: req.session.user || null
      });
    }
    
    // Store shipping info in session
    req.session.shippingInfo = { firstName, lastName, address, city, state, postalCode, country };
    
    res.redirect('/checkout/payment');

  } catch (error) {
    console.error('Error processing shipping:', error);
    res.redirect('/checkout');
  }
});

// Step 2: Payment Information
router.get('/payment', requireUser, async (req, res) => {
  try {
    if (!req.session.shippingInfo) return res.redirect('/checkout');
    
    // Get cart from database
    const user = await User.findById(req.session.user.id);

    let cart = [];
    if (user && user.cart) {
      cart = user.cart;
    } else if (req.session.cart) {
      cart = req.session.cart;
    }

    const orderItems = await loadOrderItems(cart);
    
    res.render('checkout-payment', {
      title: 'ScoreMash - Payment',
      currentPage: '',
      orderItems: orderItems,
      shippingInfo: req.session.shippingInfo,
      step: 2,
      user: req.session.user || null
    });

  } catch (error) {
    console.error('Error loading payment:', error);
    res.redirect('/checkout');
  }
});

// Step 2: Process payment information
router.post('/payment', requireUser, async (req, res) => {
  try {
    const { paymentMethod, cardNumber, cardHolder, expiryDate, cvv } = req.body;
    
    if (!paymentMethod) {
      return res.render('checkout-payment', {
        title: 'ScoreMash - Payment',
        currentPage: '',
        orderItems: [],
        shippingInfo: req.session.shippingInfo,
        step: 2,
        error: 'Please select a payment method',
        user: req.session.user || null
      });
    }
    
    if (paymentMethod === 'card' && (!cardNumber || !cardHolder || !expiryDate || !cvv)) {
      return res.render('checkout-payment', {
        title: 'ScoreMash - Payment',
        currentPage: '',
        orderItems: [],
        shippingInfo: req.session.shippingInfo,
        step: 2,
        error: 'Please fill in all card details',
        user: req.session.user || null
      });
    }
    
    // Store payment info in session
    req.session.paymentInfo = {
      method: paymentMethod,
      cardNumber: cardNumber ? cardNumber.replace(/\s/g, '').slice(-4) : null, //only last 4 digits stored
      cardHolder: cardHolder || null,
      expiryDate: expiryDate || null
    };
    
    res.redirect('/checkout/review');

  } catch (error) {
    console.error('Error processing payment:', error);
    res.redirect('/checkout/payment');
  }
});

// Step 3: Review Order
router.get('/review', requireUser, async (req, res) => {
  try {
    if (!req.session.shippingInfo || !req.session.paymentInfo) return res.redirect('/checkout');
    
    // Get cart from database
    const user = await User.findById(req.session.user.id);

    let cart = [];
    if (user && user.cart) {
      cart = user.cart;
    } else if (req.session.cart) {
      cart = req.session.cart;
    }

    const orderItems = await loadOrderItems(cart);
        
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = 10.00;
    const tax = subtotal * 0.01;
    const total = subtotal + shippingCost + tax;
    
    res.render('checkout-review', {
      title: 'ScoreMash - Review Order',
      currentPage: '',
      orderItems: orderItems,
      shippingInfo: req.session.shippingInfo,
      paymentInfo: req.session.paymentInfo,
      subtotal,
      shippingCost,
      tax,
      total,
      step: 3,
      user: req.session.user || null
    });

  } catch (error) {
    console.error('Error loading review:', error);
    res.redirect('/checkout');
  }
});

// Step 3: Place Order
router.post('/review', requireUser, async (req, res) => {
  try {
    if (!req.session.shippingInfo || !req.session.paymentInfo) return res.redirect('/checkout');
    
    // Get cart from database
    const user = await User.findById(req.session.user.id);
    let cart = [];

    if (user && user.cart) {
      cart = user.cart;
    } else if (req.session.cart) {
      cart = req.session.cart;
    }
    
    if (cart.length === 0) return res.redirect('/cart');
    
    // Fetch full product details and validate stock
    const orderItems = [];
    for (const item of cart) {
      const product = await Product.findOne({ id: item.productId });
      if (!product) continue;

      const qty = item.quantity || 1;

      if ((product.stock || 0) < qty ) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      orderItems.push({
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: qty,
        image: product.image || '🏏'
      });
    }
    
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = 10.00;
    const tax = subtotal * 0.01;
    const total = subtotal + shippingCost + tax;
    
    // Generate order number
    const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Create order
    const order = new Order({
      userId: req.session.user.id,
      orderNumber,
      items: orderItems,
      shipping: req.session.shippingInfo,
      payment: req.session.paymentInfo,
      subtotal,
      shippingCost,
      tax,
      total,
      status: 'pending'
    });
    
    await order.save();
    
    // Update product stock
    for (const item of orderItems) {
      await Product.updateOne(
        { id: item.productId },
        { $inc: { stock: -item.quantity } }
      );
    }
    
    // Clear cart and session
    if (user) {
      user.cart = [];
      await user.save();
    }

    req.session.cart = [];
    delete req.session.shippingInfo;
    delete req.session.paymentInfo;
    
    res.redirect(`/checkout/success?order=${orderNumber}`);

  } catch (error) {
    console.error('Error placing order:', error);
    res.redirect('/checkout/review');
  }
});

// Order Confirmation
router.get('/success', requireUser, async (req, res) => {
  try {
    const orderNumber = req.query.order;
    if (!orderNumber) return res.redirect('/');
    
    const order = await Order.findOne({ 
      orderNumber, 
      userId: req.session.user.id 
    });

    if (!order) return res.redirect('/');
    
    res.render('checkout-success', {
      title: 'ScoreMash - Order Confirmation',
      currentPage: '',
      order,
      user: req.session.user || null
    });

  } catch (error) {
    console.error('Error loading order confirmation:', error);
    res.redirect('/');
  }
});

module.exports = router;

