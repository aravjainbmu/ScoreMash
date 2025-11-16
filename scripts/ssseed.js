
// This script fills the MongoDB database with dynamic data from data.json
// Note: Teams and Players are stored in JSON file only (static reference data)
// Only Matches, News, Products, and Tournaments are seeded to MongoDB (dynamic data)
const mongoose = require('mongoose');
const fs = require('fs').promises;

// Import only MongoDB models (dynamic data)
const Match = require('../models/Match');
const Product = require('../models/Product');
const News = require('../models/News');
const Tournament = require('../models/Tournament');

// Connect to MongoDB (using same URI as server.js)
mongoose.connect('mongodb+srv://aravjain24cse_db_user:EzIZ98RwczvsieAq@productscluster.1lrktzw.mongodb.net/scoremash', {
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log('MongoDB connected for seeding');
  seedDatabase();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function seedDatabase() {
  try {
    // Read JSON data from file
    const jsonData = await fs.readFile('data/data.json', 'utf8');
    const data = JSON.parse(jsonData);

    // Clear existing MongoDB data (only dynamic data)
    await Match.deleteMany({});
    await Product.deleteMany({});
    await News.deleteMany({});
    await Tournament.deleteMany({});

    console.log('Cleared existing MongoDB data');

    // Helper function to get team roster by name
    function getTeamRoster(teamName) {
      const teams = Object.values(data.teams || {});
      const team = teams.find(t => t.name === teamName);
      return team ? (team.roster || []).map(p => p.name) : [];
    }

    // Helper function to generate batting stats for a player
    function generateBattingStats(playerName, isOut = false) {
      const runs = Math.floor(Math.random() * 120) + 10;
      const balls = Math.floor(runs / 0.7) + Math.floor(Math.random() * 30);
      const fours = Math.floor(runs / 8) + Math.floor(Math.random() * 5);
      const sixes = Math.floor(runs / 20) + Math.floor(Math.random() * 3);
      const strikeRate = ((runs / balls) * 100).toFixed(2);
      return {
        name: playerName,
        runs: runs,
        balls: balls,
        fours: fours,
        sixes: sixes,
        strikeRate: parseFloat(strikeRate),
        out: isOut
      };
    }

    // Helper function to generate bowling stats for a player
    function generateBowlingStats(playerName) {
      const overs = Math.floor(Math.random() * 4) + 1;
      const maidens = Math.floor(Math.random() * 2);
      const runs = Math.floor(Math.random() * 50) + 20;
      const wickets = Math.floor(Math.random() * 4);
      const economy = (runs / overs).toFixed(2);
      return {
        name: playerName,
        overs: overs,
        maidens: maidens,
        runs: runs,
        wickets: wickets,
        economy: parseFloat(economy)
      };
    }

    // Helper function to generate unique commentary for a match
    function generateCommentary(match, team1Lineup, team2Lineup) {
      const commentary = [];
      const team1Name = match.team1.name;
      const team2Name = match.team2.name;
      
      // Match-specific commentary templates based on teams
      const dotBalls = [
        `Dot ball. ${team1Name} batsman defends it back to the bowler.`,
        `Good length delivery from ${team2Name}, played back to the bowler.`,
        `Defended solidly by ${team1Name}, no run.`,
        `Tight bowling from ${team2Name}, dot ball.`
      ];
      
      const singles = [
        `Single taken by ${team1Name}. Pushed to mid-off.`,
        `Quick single to the off side. ${team1Name} rotating the strike.`,
        `Worked away for a single. Good running between the wickets.`,
        `Pushed to cover for a single. ${team1Name} keeping the scoreboard ticking.`
      ];
      
      const boundaries = [
        `FOUR! Beautiful cover drive to the boundary by ${team1Name}!`,
        `FOUR! Pulled away to the mid-wicket boundary. Great shot!`,
        `FOUR! Cut away past point. ${team1Name} finding the gaps.`,
        `FOUR! Driven through the covers. Excellent timing!`,
        `FOUR! Flicked to fine leg. ${team1Name} playing with confidence.`
      ];
      
      const sixes = [
        `SIX! Massive hit over long-on by ${team1Name}!`,
        `SIX! Lofted over the bowler's head! What a shot!`,
        `SIX! Pulled over mid-wicket. ${team1Name} showing their power!`,
        `SIX! Driven over long-off. That's gone all the way!`,
        `SIX! Smashed over deep square leg. ${team1Name} in full flow!`
      ];
      
      const wickets = [
        `OUT! Caught at slip! ${team2Name} gets the breakthrough!`,
        `OUT! Bowled! The stumps are shattered! ${team2Name} strikes!`,
        `OUT! LBW! The finger goes up! ${team2Name} celebrating!`,
        `OUT! Caught at mid-wicket! ${team2Name} gets another one!`,
        `OUT! Stumped by the wicketkeeper! ${team2Name} with a smart dismissal!`
      ];
      
      const other = [
        `Two runs taken. Good running between the wickets by ${team1Name}.`,
        `Three runs! Excellent fielding effort from ${team2Name}.`,
        `Wide ball. Extra run added to ${team1Name}'s total.`,
        `No ball! Free hit coming up for ${team1Name}.`,
        `Byes taken. Good keeping from ${team2Name}.`
      ];

      // Generate 10-15 commentary entries
      const numEntries = Math.floor(Math.random() * 6) + 10;
      let currentOver = Math.floor(Math.random() * 10) + 15; // Start from over 15-24
      let currentBall = 1;
      
      // Use match ID as seed for more consistency
      const matchSeed = match.id.charCodeAt(match.id.length - 1) || 0;

      for (let i = 0; i < numEntries; i++) {
        let text = '';
        const rand = (Math.random() * 100 + matchSeed + i) % 100;
        
        // Weighted random selection for more realistic commentary
        if (rand < 25) {
          // 25% dot balls
          text = dotBalls[Math.floor((rand + i) % dotBalls.length)];
        } else if (rand < 50) {
          // 25% singles
          text = singles[Math.floor((rand + i) % singles.length)];
        } else if (rand < 70) {
          // 20% boundaries
          text = boundaries[Math.floor((rand + i) % boundaries.length)];
        } else if (rand < 85) {
          // 15% sixes
          text = sixes[Math.floor((rand + i) % sixes.length)];
        } else if (rand < 95) {
          // 10% wickets
          text = wickets[Math.floor((rand + i) % wickets.length)];
        } else {
          // 5% other
          text = other[Math.floor((rand + i) % other.length)];
        }
        
        // Add specific player names occasionally (30% chance)
        if (Math.random() > 0.7 && team1Lineup.length > 0) {
          const player = team1Lineup[Math.floor((rand + i) % Math.min(4, team1Lineup.length))];
          text = text.replace(new RegExp(`${team1Name} (batsman|player)`, 'gi'), player);
          text = text.replace(new RegExp(`by ${team1Name}`, 'gi'), `by ${player}`);
        }

        commentary.push({
          over: `${currentOver}.${currentBall}`,
          ball: currentBall,
          text: text
        });

        currentBall++;
        if (currentBall > 6) {
          currentBall = 1;
          currentOver++;
        }
      }

      return commentary;
    }

    // Helper function to populate match with player data
    function populateMatchWithPlayers(match) {
      const team1Roster = getTeamRoster(match.team1.name);
      const team2Roster = getTeamRoster(match.team2.name);

      // Create lineups (first 11 players or all available)
      const team1Lineup = team1Roster.slice(0, Math.min(11, team1Roster.length));
      const team2Lineup = team2Roster.slice(0, Math.min(11, team2Roster.length));

      // Generate batting stats (only for live/finished matches)
      let team1Batting = [];
      let team2Batting = [];
      let team1Bowling = [];
      let team2Bowling = [];
      let fallOfWickets = [];
      let commentary = [];

      if (match.status === 'live' || match.status === 'finished') {

        // Team 1 batting (4-6 players batting)
        const battingCount1 = Math.min(Math.floor(Math.random() * 3) + 4, team1Lineup.length);
        for (let i = 0; i < battingCount1; i++) {
          const isOut = i > 0 && Math.random() > 0.4; // First player usually not out
          team1Batting.push(generateBattingStats(team1Lineup[i], isOut));
          if (isOut && i > 0) {
            fallOfWickets.push({
              wicket: i,
              runs: Math.floor(Math.random() * 150) + 30,
              player: team1Lineup[i]
            });
          }
        }

        // Team 2 bowling (3-5 bowlers)
        const bowlingCount2 = Math.min(Math.floor(Math.random() * 3) + 3, team2Lineup.length);
        for (let i = 0; i < bowlingCount2; i++) {
          team2Bowling.push(generateBowlingStats(team2Lineup[i]));
        }

        // Team 2 batting (4-6 players batting)
        const battingCount2 = Math.min(Math.floor(Math.random() * 3) + 4, team2Lineup.length);
        for (let i = 0; i < battingCount2; i++) {
          const isOut = i > 0 && Math.random() > 0.4;
          team2Batting.push(generateBattingStats(team2Lineup[i], isOut));
          if (isOut && i > 0) {
            fallOfWickets.push({
              wicket: team1Batting.length + i,
              runs: Math.floor(Math.random() * 150) + 30,
              player: team2Lineup[i]
            });
          }
        }

        // Team 1 bowling (3-5 bowlers)
        const bowlingCount1 = Math.min(Math.floor(Math.random() * 3) + 3, team1Lineup.length);
        for (let i = 0; i < bowlingCount1; i++) {
          team1Bowling.push(generateBowlingStats(team1Lineup[i]));
        }

        // Generate commentary only for live/finished matches
        commentary = generateCommentary(match, team1Lineup, team2Lineup);
      }

      return {
        ...match,
        team1Lineup: team1Lineup,
        team2Lineup: team2Lineup,
        team1Batting: team1Batting,
        team2Batting: team2Batting,
        team1Bowling: team1Bowling,
        team2Bowling: team2Bowling,
        fallOfWickets: fallOfWickets,
        commentary: commentary
      };
    }

    // Seed Matches (convert from JSON structure to MongoDB documents)
    const rawMatches = [
      ...(data.matches.live || []).map(m => ({ ...m, status: 'live' })),
      ...(data.matches.upcoming || []).map(m => ({ ...m, status: 'upcoming' })),
      ...(data.matches.finished || []).map(m => ({ ...m, status: 'finished' }))
    ];
    
    const matches = rawMatches.map(m => populateMatchWithPlayers(m));
    
    if (matches.length > 0) {
      await Match.insertMany(matches);
      console.log(`Seeded ${matches.length} matches with player data`);
    }

    // Seed Products (remove hardcoded rating and reviews fields)
    if (data.products && data.products.length > 0) {
      const productsToSeed = data.products.map(product => {
        const { rating, reviews, ...productWithoutFakeReviews } = product;
        return {
          ...productWithoutFakeReviews,
          rating: 0,
          reviews: 0,
          userReviews: []
        };
      });
      await Product.insertMany(productsToSeed);
      console.log(`Seeded ${productsToSeed.length} products (removed fake reviews)`);
    }

    // Seed News
    const newsItems = [];
    if (data.news && data.news.featured) {
      newsItems.push({ ...data.news.featured, id: 'featured-news', type: 'featured' });
    }
    if (data.news && data.news.articles) {
      newsItems.push(...data.news.articles.map((article, index) => ({
        ...article,
        type: 'article'
      })));
    }
    if (data.news && data.news.breaking) {
      newsItems.push(...data.news.breaking.map((breaking, index) => ({
        id: `breaking-${index}`,
        title: breaking.title,
        date: breaking.time,
        type: 'breaking'
      })));
    }
    if (newsItems.length > 0) {
      await News.insertMany(newsItems);
      console.log(`Seeded ${newsItems.length} news items`);
    }

    // Seed Tournaments
    const tournaments = [];
    if (data.tournaments && data.tournaments.active) {
      tournaments.push(...data.tournaments.active.map(t => ({ ...t, status: t.status || 'Live' })));
    }
    if (data.tournaments && data.tournaments.past) {
      tournaments.push(...data.tournaments.past.map(t => ({ ...t, status: 'Past' })));
    }
    if (tournaments.length > 0) {
      await Tournament.insertMany(tournaments);
      console.log(`Seeded ${tournaments.length} tournaments`);
    }

    console.log('\nDatabase seeded successfully!');
    console.log('Note: Teams and Players are stored in data.json (not in MongoDB)');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

