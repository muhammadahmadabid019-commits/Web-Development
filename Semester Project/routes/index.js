const express = require('express');
const router = express.Router();

const Quote = require('../models/Quote');

// Landing page route
router.get('/', (req, res) => {
  if (req.session && req.session.userId && req.session.userRole && req.session.userRole.trim().toLowerCase() === 'admin') {
    return res.redirect('/admin/products');
  }
  res.render('index', { 
    title: 'SecureNet Solutions - Home'
  });
});

// POST /quote - Save free quote request
router.post('/quote', async (req, res) => {
  try {
    const { name, phone, email, service, message } = req.body;

    if (!name || !phone || !email || !service) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields.'
      });
    }

    const quote = await Quote.create({
      name,
      phone,
      email,
      service,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Quote request submitted successfully!',
      quote
    });
  } catch (err) {
    console.error('Quote Submission Error:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error. Failed to save quote request.'
    });
  }
});

module.exports = router;
