const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
  runs: Number,
  wickets: Number,
  average: Number,
  strikeRate: Number,
  centuries: Number,
  economy: Number
});

const playerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  team: String,
  teamFlag: String,
  role: String,
  stats: statSchema,
  careerBatting: [{
    type: String,
    matches: Number,
    innings: Number,
    runs: Number,
    hs: Number,
    avg: Number,
    sr: Number,
    "100s": Number,
    "50s": Number
  }],
  recentBatting: [{
    type: String,
    matches: Number,
    innings: Number,
    runs: Number,
    hs: Number,
    avg: Number,
    sr: Number,
    "100s": Number,
    "50s": Number
  }],
  careerBowling: [{
    type: String,
    matches: Number,
    wickets: Number,
    runs: Number,
    avg: Number,
    economy: Number,
    sr: Number
  }],
  recentBowling: [{
    type: String,
    matches: Number,
    wickets: Number,
    runs: Number,
    avg: Number,
    economy: Number,
    sr: Number
  }]
});

module.exports = mongoose.model('Player', playerSchema);

