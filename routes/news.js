const express = require('express');
const router = express.Router();
const News = require('../models/News');

router.get('/', async (req, res) => {
  try {
    const featuredNews = await News.findOne({ type: 'featured' });
    const articles = await News.find({ type: 'article' }).sort({ date: -1 });
    const breakingNews = await News.find({ type: 'breaking' }).sort({ date: -1 });
    
    res.render('news', {
      title: 'ScoreMash - Cricket News',
      currentPage: 'news',
      featuredNews: featuredNews,
      articles: articles,
      breakingNews: breakingNews,
      user: req.session.user || null
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.render('news', {
      title: 'ScoreMash - Cricket News',
      currentPage: 'news',
      featuredNews: null,
      articles: [],
      breakingNews: [],
      user: req.session.user || null
    });
  }
});

module.exports = router;

