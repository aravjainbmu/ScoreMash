// Import required modules
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: "secretkey",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 1000 * 60 * 10, // 10 minutes
    httpOnly: true,
    sameSite: "lax"
  } 
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

app.use('/data', express.static(path.join(__dirname, 'data')));


app.locals.isValidUrl = function (str) {
  try {
    new URL(str);
    return true;
  } catch (e) {
    return false;
  }
};


// Set up EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB
mongoose.connect('<mongodb url>', {
  serverSelectionTimeoutMS: 5000
})
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch(err => {
    console.log('Error: MongoDB could not connect.');
  });

// Import routes
const indexRoutes = require('./routes/index');
const matchesRoutes = require('./routes/matches');
const playersRoutes = require('./routes/players');
const teamsRoutes = require('./routes/teams');
const tournamentsRoutes = require('./routes/tournaments');
const newsRoutes = require('./routes/news');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const settingsRoutes = require('./routes/settings');
const pagesRoutes = require('./routes/pages');

// Use routes
app.use('/', indexRoutes);
app.use('/matches', matchesRoutes);
app.use('/players', playersRoutes);
app.use('/teams', teamsRoutes);
app.use('/tournaments', tournamentsRoutes);
app.use('/news', newsRoutes);
app.use('/shop', shopRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/cart', cartRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/settings', settingsRoutes);
app.use('/', pagesRoutes);

// Error handling - show an error page if error occurs
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).render('error', { 
    title: 'Error',
    currentPage: '',
    error: err.message,
    user: req.session || null
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export app and sessions for use in routes
module.exports = app;
