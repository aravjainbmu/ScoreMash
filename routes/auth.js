const express = require('express');
const router = express.Router();
const User = require('../models/User');

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

router.get('/signin', (req, res) => {
  // If already logged in, redirect to home
  if (req.session.isLoggedIn) {
    return res.redirect('/');
  }
  res.render('signin', {
    title: 'ScoreMash - Sign In',
    currentPage: '',
    error: null,
    user: req.session.user || null
  });
});

router.get('/signup', (req, res) => {
  // If already logged in, redirect to home
  if (req.session.isLoggedIn) {
    return res.redirect('/');
  }
  res.render('signup', {
    title: 'ScoreMash - Sign Up',
    currentPage: '',
    error: null,
    user: req.session.user || null
  });
});

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin user
    if (email === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      req.session.isLoggedIn = true;
      req.session.user = {
        id: 'admin',
        email: ADMIN_USERNAME,
        name: 'Admin',
        isAdmin: true
      }
      return res.redirect('/admin');
    }

    // Check regular user in database
    const user = await User.findOne({ email: email });
    
    if (!user || user.password !== password) {
      return res.render('signin', {
        title: 'ScoreMash - Sign In',
        currentPage: '',
        error: 'Invalid email or password',
        user: req.session.user || null
      });
    }

    req.session.isLoggedIn = true;
    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.name
    };

    res.redirect('/');
  } catch (error) {
    console.error('Sign in error:', error);

    res.render('signin', {
      title: 'ScoreMash - Sign In',
      currentPage: '',
      error: 'An error occurred. Please try again.',
      user: req.session.user || null
    });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, 'confirm-password': confirmPassword } = req.body;

    // Validate passwords match
    if (password !== confirmPassword) {
      return res.render('signup', {
        title: 'ScoreMash - Sign Up',
        currentPage: '',
        error: 'Passwords do not match',
        user: req.session.user || null
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.render('signup', {
        title: 'ScoreMash - Sign Up',
        currentPage: '',
        error: 'Password must be at least 6 characters long',
        user: req.session.user || null
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.render('signup', {
        title: 'ScoreMash - Sign Up',
        currentPage: '',
        error: 'Email already registered',
        user: req.session.user || null
      });
    }

    // Create new user
    const user = new User({
      name: name,
      email: email,
      password: password
    });

    await user.save();

    req.session.isLoggedIn = true;
    req.session.isAdmin = false;
    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      isAdmin: false
    }

    res.redirect('/');
  } catch (error) {
    console.error('Sign up error:', error);

    res.render('signup', {
      title: 'ScoreMash - Sign Up',
      currentPage: '',
      error: 'An error occurred. Please try again.',
      user: req.session.user || null
    });
  }
});

router.get('/forgot-password', (req, res) => {
  // If already logged in, redirect to home
  if (req.session.isLoggedIn) {
    return res.redirect('/');
  }
  res.render('forgot-password', {
    title: 'ScoreMash - Forgot Password',
    currentPage: '',
    error: null,
    success: null,
    user: req.session.user || null
  });
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!email || !newPassword || !confirmPassword) {
      return res.render('forgot-password', {
        title: 'ScoreMash - Forgot Password',
        currentPage: '',
        error: 'All fields are required',
        success: null,
        user: req.session.user || null
      });
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return res.render('forgot-password', {
        title: 'ScoreMash - Forgot Password',
        currentPage: '',
        error: 'Passwords do not match',
        success: null,
        user: req.session.user || null
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.render('forgot-password', {
        title: 'ScoreMash - Forgot Password',
        currentPage: '',
        error: 'Password must be at least 6 characters long',
        success: null,
        user: req.session.user || null
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email });
    
    if (!user) {
      return res.render('forgot-password', {
        title: 'ScoreMash - Forgot Password',
        currentPage: '',
        error: 'No account found with this email address',
        success: null,
        user: req.session.user || null
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.render('forgot-password', {
      title: 'ScoreMash - Forgot Password',
      currentPage: '',
      error: null,
      success: 'Password reset successfully! You can now sign in with your new password.',
      user: req.session.user || null
    });

  } catch (error) {
    console.error('Forgot password error:', error);

    res.render('forgot-password', {
      title: 'ScoreMash - Forgot Password',
      currentPage: '',
      error: 'An error occurred. Please try again.',
      success: null,
      user: req.session.user || null
    });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.redirect("/");
    }

    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

module.exports = router;

