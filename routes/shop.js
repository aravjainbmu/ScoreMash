const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');

// Get products from MongoDB
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });

    const categories = [...new Set(products.map(p => p.category))];
    const brands = [...new Set(products.map(p => p.brand))];
    
    res.render('shop', {
      title: 'ScoreMash - Cricket Shop',
      currentPage: 'shop',
      products: products || [],
      categories: categories,
      brands: brands,
      user: req.session.user || null
    });

  } catch (error) {
    console.error('Error fetching products:', error);

    res.render('shop', {
      title: 'ScoreMash - Cricket Shop',
      currentPage: 'shop',
      products: [],
      categories: [],
      brands: [],
      user: req.session.user || null
    });
  }
});

// Add review route
router.post('/:productId/review', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, error: 'Please login to add a review' });
    }
    
    const { productId } = req.params;
    const { rating, comment } = req.body;
    
    if (!rating || !comment) {
      return res.status(400).json({ success: false, error: 'Rating and comment are required' });
    }
    
    const ratingNum = parseInt(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }
    
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const reviewData = {
      userId: req.session.user.id,
      userName: user.name || user.email,
      rating: ratingNum,
      comment: comment.trim(),
      createdAt: new Date()
    };

    // Check if user already reviewed
    const existingReviewIndex = product.userReviews.findIndex(
      r => r.userId.toString() === req.session.user.id.toString()
    );
    
    if (existingReviewIndex >= 0) {
      // Update existing review
      product.userReviews[existingReviewIndex] = reviewData;
    } else {
      // Add new review
      product.userReviews.push(reviewData);
    }
    
    product.updateRating();
    await product.save();
    
    res.json({ 
      success: true, 
      message: existingReviewIndex >= 0 ? 'Review updated successfully' : 'Review added successfully',
      review: reviewData
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ success: false, error: 'Error adding review' });
  }
});

router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOne({ id: productId });
    
    if (!product) {
      return res.status(404).render('error', { 
        title: 'ScoreMash - Error',
        currentPage: '',
        error: 'Product not found',
        user: req.session || null
      });
    }
    
    let averageRating = product.rating || 0;
    let reviewCount = product.reviews || 0;
    
    if (product.userReviews && product.userReviews.length > 0) {
      const sum = product.userReviews.reduce((acc, review) => acc + review.rating, 0);
      averageRating = parseFloat((sum / product.userReviews.length).toFixed(1));
      reviewCount = product.userReviews.length;
    }
    
    // Check if user has already reviewed this product
    let userReview = null;
    if (req.session && req.session.user) {
      userReview = product.userReviews.find(r => r.userId.toString() === req.session.user.id.toString());
    }
    
    res.render('product-detail', {
      title: `ScoreMash - ${product.name}`,
      currentPage: 'shop',
      product: product,
      averageRating: averageRating,
      reviewCount: reviewCount,
      userReview: userReview,
      user: req.session.user || null
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).render('error', { 
      title: 'ScoreMash - Error',
      currentPage: '',
      error: 'Error loading product',
      user: req.session.user || null
    });
  }
});

module.exports = router;

