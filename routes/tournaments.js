const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');

router.get('/', async (req, res) => {
  try {
    // Fetch all active tournaments
    const allActiveTournaments = await Tournament.find({ status: { $in: ['Live', 'Upcoming'] } });
    
    // Sort: Live tournaments first, then Upcoming, then by dates
    const activeTournaments = allActiveTournaments.sort((a, b) => {
      if (a.status === 'Live' && b.status === 'Upcoming') return -1;
      if (a.status === 'Upcoming' && b.status === 'Live') return 1;
      return 0;
    });
    
    const pastTournaments = await Tournament.find({ status: 'Past' }).sort({ year: -1 });
    
    // Get selected tournament from query parameter or default to first
    const tournamentId = req.query.tournament;
    let selectedTournament = null;
    
    if (tournamentId) {
      selectedTournament = await Tournament.findOne({ id: tournamentId });
    }
    
    if (!selectedTournament && activeTournaments.length > 0) {
      selectedTournament = activeTournaments[0];
    }
    
    res.render('tournaments', {
      title: 'ScoreMash - Tournaments Overview',
      currentPage: 'tournaments',
      activeTournaments: activeTournaments || [],
      pastTournaments: pastTournaments || [],
      selectedTournament: selectedTournament,
      user: req.session.user || null
    });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.render('tournaments', {
      title: 'ScoreMash - Tournaments Overview',
      currentPage: 'tournaments',
      activeTournaments: [],
      pastTournaments: [],
      selectedTournament: null,
      user: req.session.user || null
    });
  }
});

module.exports = router;

