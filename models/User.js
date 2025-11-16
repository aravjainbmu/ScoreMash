const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cart: [{
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 }
  }],
  preferences: {
    theme: { type: String, default: 'light', enum: ['light', 'dark', 'auto'] },
    language: { type: String, default: 'en', enum: ['en', 'hi', 'es'] },
    timezone: { type: String, default: 'IST', enum: ['IST', 'UTC', 'EST'] },
    showFeaturedContent: { type: Boolean, default: true },
    autoPlayVideos: { type: Boolean, default: true }
  },
  notifications: {
    matchUpdates: { type: Boolean, default: true },
    newsArticles: { type: Boolean, default: true },
    tournamentUpdates: { type: Boolean, default: false },
    orderUpdates: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

