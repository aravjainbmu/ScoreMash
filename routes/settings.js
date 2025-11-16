const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Require user login
function requireUser(req, res, next) {
  if (!req.session || !req.session.isLoggedIn) {
    return res.redirect('/auth/signin');
  }
  next();
}

// Function to render settings page
function renderSettings(res, section, userSession, userFromDb, options = {}) {
  res.render('settings', {
    title: `ScoreMash - ${section.charAt(0).toUpperCase() + section.slice(1)}`,
    currentPage: 'settings',
    activeSection: section,
    user: {
      ...userSession,
      email: userFromDb.email,
      name: userFromDb.name,
      notifications: userFromDb.notifications || {},
      preferences: userFromDb.preferences || {}
    },
    error: options.error || null,
    success: options.success || null
  });
}

// Get user settings page
router.get('/', requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    if (!user) return res.redirect('/auth/signin');
    
    renderSettings(res, 'account', req.session.user, user);
  } catch (error) {
    console.error('Error loading settings:', error);
    res.redirect('/');
  }
});

// Update account information
router.post('/account', requireUser, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const user = await User.findById(req.session.user.id);
    if (!user) return res.redirect('/auth/signin');

    if (!name || !email) {
      return renderSettings(res, 'account', req.session.user, user, { error: 'Name and email are required' });
    }    
    
    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: req.session.user.id } });
    if (existingUser) return renderSettings(res, 'account', req.session.user, user, { error: 'Email is already taken' });

    user.name = name;
    user.email = email;
    await user.save();
    
    // Update session
    req.session.user.name = name;
    req.session.user.email = email;
    
    renderSettings(res, 'account', req.session.user, user, { success: 'Account information updated successfully' });
  } catch (error) {
    console.error('Error updating account:', error);
    const user = await User.findById(req.session.user.id)
    renderSettings(res, 'account', req.session.user, user, { error: 'Error updating account information' });
  }
});

// Change password
router.post('/password', requireUser, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    const user = await User.findById(req.session.user.id);
    if (!user) return res.redirect('/auth/signin');

    if (!currentPassword || !newPassword || !confirmPassword) {
      return renderSettings(res, 'account', req.session.user, user, { error: 'All password fields are required' });
    }
    
    if (newPassword !== confirmPassword) {
      return renderSettings(res, 'account', req.session.user, user, { error: 'New passwords do not match' });
    }
    
    if (newPassword.length < 6) {
      return renderSettings(res, 'account', req.session.user, user, { error: 'Password must be at least 6 characters long' });
    }
    
    // Verify current password
    if (user.password !== currentPassword) {
      return renderSettings(res, 'account', req.session.user, user, { error: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    renderSettings(res, 'account', req.session.user, user, { success: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    const user = await User.findById(req.session.user.id);
    renderSettings(res, 'account', req.session.user, user, { error: 'Error changing password' });
  }
});

// Notification Settings
router.get('/notifications', requireUser, async (req, res) => {
  const user = await User.findById(req.session.user.id);
  
  if (!user) {
    return res.redirect('/auth/signin');
  }
  
  renderSettings(res, 'notifications', req.session.user, user);
});

// Update notification settings
router.post('/notifications', requireUser, async (req, res) => {
  try {
    const { matchUpdates, newsArticles, tournamentUpdates, orderUpdates } = req.body;
    
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.redirect('/auth/signin');
    }
    

    user.notifications = {
      matchUpdates: matchUpdates === 'on' || matchUpdates === true,
      newsArticles: newsArticles === 'on' || newsArticles === true,
      tournamentUpdates: tournamentUpdates === 'on' || tournamentUpdates === true,
      orderUpdates: orderUpdates === 'on' || orderUpdates === true
    };
    
    await user.save();
    renderSettings(res, 'notifications', req.session.user, user, { success: 'Notification settings updated successfully' });

  } catch (error) {
    console.error('Error updating notification settings:', error);
    const user = await User.findById(req.session.user.id);
    renderSettings(res, 'notifications', req.session.user, user, { error: 'Error updating notification settings' });
  }
});

// Preferences
router.get('/preferences', requireUser, async (req, res) => {
  const user = await User.findById(req.session.user.id);
  if (!user) {
    return res.redirect('/auth/signin');
  }
  
  renderSettings(res, 'preferences', req.session.user, user);
});

// Update preferences
router.post('/preferences', requireUser, async (req, res) => {
  try {
    const { theme, language, timezone, showFeaturedContent, autoPlayVideos } = req.body;
    
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.redirect('/auth/signin');
    }
    
    user.preferences = user.preferences || {};
    
    // Update preferences
    if (theme) user.preferences.theme = theme;
    if (language) user.preferences.language = language;
    if (timezone) user.preferences.timezone = timezone;
    user.preferences.showFeaturedContent = showFeaturedContent === 'on' || showFeaturedContent === true;
    user.preferences.autoPlayVideos = autoPlayVideos === 'on' || autoPlayVideos === true;
    
    await user.save();
    
    renderSettings(res, 'preferences', req.session.user, user, { success: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Error updating preferences:', error);
    const user = await User.findById(req.session.user.id);
    renderSettings(res, 'preferences', req.session.user, user, { error: 'Error updating preferences' });
  }
});

// Help & Support
router.get('/help', requireUser, async (req, res) => {
  const user = await User.findById(req.session.user.id);
  if (!user) {
    return res.redirect('/auth/signin');
  }
  
  renderSettings(res, 'help', req.session.user, user);
});

module.exports = router;

