const mongoose = require('mongoose');

const teamScoreSchema = new mongoose.Schema({
  name: String,
  flag: String,
  score: String
});

const battingStatsSchema = new mongoose.Schema({
  name: String,
  runs: Number,
  balls: Number,
  fours: Number,
  sixes: Number,
  strikeRate: Number,
  out: { type: Boolean, default: false }
});

const bowlingStatsSchema = new mongoose.Schema({
  name: String,
  overs: Number,
  maidens: Number,
  runs: Number,
  wickets: Number,
  economy: Number
});

const fallOfWicketSchema = new mongoose.Schema({
  wicket: Number,
  runs: Number,
  player: String
});

const commentarySchema = new mongoose.Schema({
  over: String,
  ball: Number,
  text: String
});

const matchSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  team1: teamScoreSchema,
  team2: teamScoreSchema,
  status: { type: String, enum: ['live', 'upcoming', 'finished'], required: true },
  overs: String,
  runRate: String,
  wickets: Number,
  statusText: String,
  venue: String,
  date: String,
  matchType: { type: String, enum: ['live', 'upcoming', 'finished'] },
  // Player data
  team1Batting: [battingStatsSchema],
  team2Batting: [battingStatsSchema],
  team1Bowling: [bowlingStatsSchema],
  team2Bowling: [bowlingStatsSchema],
  team1Lineup: [String],
  team2Lineup: [String],
  fallOfWickets: [fallOfWicketSchema],
  commentary: [commentarySchema]
});

module.exports = mongoose.model('Match', matchSchema);

