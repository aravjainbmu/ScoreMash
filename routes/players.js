const express = require('express');
const router = express.Router();
// const fs = require('fs').promises;
const path = require('path');

const DATA_URL = "http://localhost:3000/data/data.json";

router.get('/', async (req, res) => {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error("Failed to fetch player data");
    const data = await response.json();
    const players = data.players || [];
    
    res.render('players', {
      title: 'ScoreMash - Player Statistics',
      currentPage: 'players',
      players: players,
      user: req.session.user || null
    });

  } catch (error) {
    console.error('Error loading players:', error);

    res.render('players', {
      title: 'ScoreMash - Player Statistics',
      currentPage: 'players',
      players: [],
      user: req.session.user || null
    });
  }
});

// Get specific player details
router.get('/:playerId', async (req, res) => {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error("Failed to fetch player data");
    const data = await response.json();
    const { playerId } = req.params;
    
    let player = data.players.find(p => p.id === playerId);
    
    // // If not found by ID, try to find by name
    // if (!player) {
    //   // Convert playerId to search format
    //   const searchName = playerId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    //   player = data.players.find(p => 
    //     p.name.toLowerCase() === searchName.toLowerCase() ||
    //     p.name.toLowerCase() === playerId.replace(/-/g, ' ').toLowerCase()
    //   );
      
    //   // If still not found, try partial match
    //   if (!player) {
    //     player = data.players.find(p => {
    //       const playerNameLower = p.name.toLowerCase();
    //       const searchLower = playerId.replace(/-/g, ' ').toLowerCase();
    //       return playerNameLower.includes(searchLower) || searchLower.includes(playerNameLower);
    //     });
    //   }
    // }
    
    if (!player) {
      return res.status(404).render('error', { 
        title: 'ScoreMash - Error',
        currentPage: '',
        error: 'Player not found',
        user: req.session.user || null
      });
    }
    
    res.render('player-detail', {
      title: `ScoreMash - ${player.name}`,
      currentPage: 'players',
      player: player,
      user: req.session.user || null
    });

  } catch (error) {
    console.error('Error loading player:', error);

    res.status(500).render('error', { 
      title: 'ScoreMash - Error',
      currentPage: '',
      error: 'Error loading player data',
      user: req.session.user || null
    });
  }
});

module.exports = router;

