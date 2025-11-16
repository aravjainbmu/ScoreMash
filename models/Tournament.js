const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['Live', 'Upcoming', 'Past'] },
  description: String,
  dates: String,
  format: String,
  locations: String,
  teams: Number,
  winner: String,
  year: Number,
  matches: [{
    id: String,
    team1: String,
    team2: String,
    date: String,
    venue: String,
    status: String,
    result: String
  }],
  pointsTable: [{
    team: String,
    played: Number,
    won: Number,
    lost: Number,
    tied: Number,
    points: Number,
    nrr: Number
  }]
});

module.exports = mongoose.model('Tournament', tournamentSchema);

