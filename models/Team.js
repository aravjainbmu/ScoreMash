const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: String,
  role: String,
  stat: String
});

const matchResultSchema = new mongoose.Schema({
  opponent: String,
  date: String,
  result: String,
  score: String,
  win: Boolean
});

const fixtureSchema = new mongoose.Schema({
  opponent: String,
  venue: String,
  date: String
});

const starPlayerSchema = new mongoose.Schema({
  name: String,
  role: String,
  highlight: String,
  desc: String
});

const teamSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subtitle: String,
  flag: String,
  roster: [playerSchema],
  results: [matchResultSchema],
  fixtures: [fixtureSchema],
  starPlayers: [starPlayerSchema]
});

module.exports = mongoose.model('Team', teamSchema);

