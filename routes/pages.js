const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

router.get('/privacy', (req, res) => {
  res.render('privacy', {
    title: 'ScoreMash - Privacy Policy',
    currentPage: '',
    user: req.session.user || null
  });
});

router.get('/terms', (req, res) => {
  res.render('terms', {
    title: 'ScoreMash - Terms of Service',
    currentPage: '',
    user: req.session.user || null
  });
});

router.get('/about', (req, res) => {
  res.render('about', {
    title: 'ScoreMash - About Us',
    currentPage: '',
    user: req.session.user || null
  });
});

router.get('/contact', (req, res) => {
  const { success, error } = req.query;

  res.render('contact', {
    title: 'ScoreMash - Contact Us',
    currentPage: '',
    user: req.session.user || null,
    success: success ? "Your message has been sent successfully!" : null,
    error: error || null
  });
});

router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate fields
    if (!name || !email ||!subject || !message) {
      return res.redirect('/contact?error=All fields are required');
    }

    // Save to database
    const cont = new Contact({
      name: name,
      email: email,
      subject: subject,
      message: message
    });

    await cont.save();

    console.log("New contact form entry saved!");

    return res.redirect('/contact?success=true');

  } catch (err) {
    console.error("Contact form error:", err);

    return res.redirect('/contact?error=An error occurred while sending your message');
  }
});

module.exports = router;

