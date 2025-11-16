const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: String,
  category: String,
  price: { type: Number, required: true },
  rating: Number,
  reviews: Number,
  image: String,
  description: String,
  stock: { type: Number, default: 100 },
  userReviews: [reviewSchema]
});

// Virtual to calculate average rating from user reviews
productSchema.virtual('averageRating').get(function() {
  if (!this.userReviews || this.userReviews.length === 0) {
    return this.rating || 0;
  }
  const sum = this.userReviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / this.userReviews.length).toFixed(1);
});

// Method to update rating and review count
productSchema.methods.updateRating = function() {
  if (this.userReviews && this.userReviews.length > 0) {
    const sum = this.userReviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating = parseFloat((sum / this.userReviews.length).toFixed(1));
    this.reviews = this.userReviews.length;
  } else {
    this.rating = 0;
    this.reviews = 0;
  }
};

module.exports = mongoose.model('Product', productSchema);

