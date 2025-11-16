const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Require admin session
const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.isLoggedIn) {
    return res.redirect('/auth/signin');
  }
  if (!req.session.user.isAdmin) {
    return res.redirect('/');
  }
  next();
};

// Apply requireAdmin to all routes
router.use(requireAdmin);

// Admin Dashboard
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.render('admin', {
      title: 'ScoreMash - Admin Dashboard',
      currentPage: '',
      products: products,
      user: req.session.user || null
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);

    res.render('admin', {
      title: 'ScoreMash - Admin Dashboard',
      currentPage: '',
      products: [],
      user: req.session.user || null
    });
  }
});

// New Product Page
router.get('/products/new', (req, res) => {
  res.render('admin-product-new', {
    title: 'ScoreMash - Add New Product',
    currentPage: '',
    error: null,
    user: req.session.user || null
  });
});

// Create Product
router.post('/products/new', async (req, res) => {
  try {
    const { id, name, brand, category, price, image, description, stock } = req.body;
    
    if (!id || !name || !price) {
      return res.render('admin-product-new', {
        title: 'ScoreMash - Add New Product',
        currentPage: '',
        error: 'ID, name, and price are required',
        user: req.session.user || null
      });
    }
    
    const existingProduct = await Product.findOne({ id: id });
    if (existingProduct) {
      return res.render('admin-product-new', {
        title: 'ScoreMash - Add New Product',
        currentPage: '',
        error: 'Product ID already exists',
        user: req.session.user || null
      });
    }
    
    const product = new Product({
      id,
      name,
      brand: brand || '',
      category: category || '',
      price: parseFloat(price),
      image: image || '🏏',
      description: description || '',
      stock: parseInt(stock)
    });
    
    await product.save();
    res.redirect('/admin');
  } catch (error) {
    console.error('Create product error:', error);

    res.render('admin-product-new', {
      title: 'ScoreMash - Add New Product',
      currentPage: '',
      error: 'An error occurred. Please try again.',
      user: req.session.user || null
    });
  }
});

// Edit Product Page
router.get('/products/:productId/edit', async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findOne({ id: productId });
    
    if (!product) {
      return res.redirect('/admin');
    }
    
    res.render('admin-product-edit', {
      title: 'ScoreMash - Edit Product',
      currentPage: '',
      product: product,
      error: null,
      user: req.session.user || null
    });
  } catch (error) {
    console.error('Edit product error:', error);
    res.redirect('/admin');
  }
});

// Update Product
router.post('/products/:productId/edit', async (req, res) => {
  try {
    const productId = req.params.productId;
    const { name, brand, category, price, image, description, stock } = req.body;
    
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.redirect('/admin');
    }
    
    if (!name || !price) {
      return res.render('admin-product-edit', {
        title: 'ScoreMash - Edit Product',
        currentPage: '',
        product: product,
        error: 'Name and price are required',
        user: req.session.user || null
      });
    }
    
    product.name = name;
    product.brand = brand || '';
    product.category = category || '';
    product.price = parseFloat(price);
    product.image = image || '🏏';
    product.description = description || '';
    product.stock = parseInt(stock);
    
    await product.save();
    res.redirect('/admin');

  } catch (error) {

    console.error('Update product error:', error);
    const product = await Product.findOne({ id: req.params.productId });
    
    res.render('admin-product-edit', {
      title: 'ScoreMash - Edit Product',
      currentPage: '',
      product: product,
      error: 'An error occurred. Please try again.',
      user: req.session.user || null
    });
  }
});

// Delete Product
router.post('/products/:productId/delete', async (req, res) => {
  try {
    const productId = req.params.productId;
    await Product.findOneAndDelete({ id: productId });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, error: 'Error deleting product' });
  }
});

module.exports = router;

