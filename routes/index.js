const express = require('express');
const router = express.Router();
const Match = require('../models/Match');

// Home page
router.get('/', async (req, res) => {
  try {
    const liveMatches = await Match.find({ status: 'live' }).sort({ date: -1 }).limit(5);
    const upcomingMatches = await Match.find({ status: 'upcoming' }).sort({ date: 1 }).limit(2);
    const finishedMatches = await Match.find({ status: 'finished' }).sort({ date: -1 }).limit(1);
    
    const featuredMatch = liveMatches.length > 0 ? liveMatches[0] : null;
    const otherMatches = [
      ...liveMatches.slice(1),
      ...upcomingMatches,
      ...finishedMatches
    ];
    
    res.render('index', {
      title: 'ScoreMash - Home',
      currentPage: 'index',
      featuredMatch: featuredMatch,
      otherMatches: otherMatches,
      user: req.session.user || null
    });

  } catch (error) {
    console.error('Error loading index:', error);
    
    res.render('index', {
      title: 'ScoreMash - Home',
      currentPage: 'index',
      featuredMatch: null,
      otherMatches: [],
      user: req.session.user || null
    });
  }
});

module.exports = router;

