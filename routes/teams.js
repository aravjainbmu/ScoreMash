const express = require('express');
const router = express.Router();

const DATA_URL = 'http://localhost:3000/data/data.json';

// Helper function to load data
async function loadData() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);
  const data = await response.json();
  return data;
}

// Get all teams from JSON
router.get('/', async (req, res) => {
  try {
    const data = await loadData();
    const teams = Object.values(data.teams || {});
    
    res.render('teams', {
      title: 'ScoreMash - Team Overview',
      currentPage: 'teams',
      teams: teams,
      selectedTeam: null,
      user: req.session.user || null
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.render('teams', {
      title: 'ScoreMash - Team Overview',
      currentPage: 'teams',
      teams: [],
      selectedTeam: null,
      user: req.session.user || null
    });
  }
});

// Get specific team from JSON
router.get('/:teamId', async (req, res) => {
  try {
    const data = await loadData();
    const { teamId } = req.params;
    const team = data.teams && data.teams[teamId];
    
    if (!team) {
      return res.status(404).render('error', { 
        title: 'ScoreMash - Error',
        currentPage: '',
        error: 'Team not found',
        user: req.session.user || null
      });
    }
    
    // Get all teams for selection
    const allTeams = Object.values(data.teams || {});
    
    res.render('teams', {
      title: `ScoreMash - ${team.name}`,
      currentPage: 'teams',
      teams: allTeams,
      selectedTeam: team,
      user: req.session.user || null
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).render('error', { 
      title: 'ScoreMash - Error',
      currentPage: '',
      error: 'Error loading team data',
      user: req.session.user || null
    });
  }
});

module.exports = router;

