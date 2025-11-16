const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  category: String,
  title: { type: String, required: true },
  excerpt: String,
  content: String,
  date: String,
  readTime: String,
  image: String,
  type: { type: String, enum: ['featured', 'article', 'breaking'] }
});

module.exports = mongoose.model('News', newsSchema);

