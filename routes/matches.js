const express = require('express');
const router = express.Router();
const Match = require('../models/Match');

router.get('/', async (req, res) => {
  try {
    const liveMatches = await Match.find({ status: 'live' }).sort({ date: -1 });
    const upcomingMatches = await Match.find({ status: 'upcoming' }).sort({ date: 1 });
    const finishedMatches = await Match.find({ status: 'finished' }).sort({ date: -1 });
    
    res.render('matches', {
      title: 'ScoreMash - Live Matches',
      currentPage: 'matches',
      liveMatches: liveMatches,
      upcomingMatches: upcomingMatches,
      finishedMatches: finishedMatches,
      user: req.session.user || null
    });

  } catch (error) {
    console.error('Error fetching matches:', error);
    res.render('matches', {
      title: 'ScoreMash - Live Matches',
      currentPage: 'matches',
      liveMatches: [],
      upcomingMatches: [],
      finishedMatches: [],
      user: req.session.user || null
    });
  }
});

router.get('/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    const match = await Match.findOne({ id: matchId });
    
    if (!match) {
      return res.status(404).render('error', { 
        title: 'ScoreMash - Error',
        currentPage: '',
        error: 'Match not found',
        user: req.session.user || null
      });
    }
    
    res.render('match', {
      title: `ScoreMash - ${match.team1.name} vs ${match.team2.name}`,
      currentPage: 'matches',
      match: match,
      user: req.session.user || null
    });
    
  } catch (error) {
    console.error('Error fetching match:', error);

    res.status(500).render('error', { 
      title: 'ScoreMash - Error',
      currentPage: '',
      error: 'Error loading match',
      user: req.session.user || null
    });
  }
});

module.exports = router;

