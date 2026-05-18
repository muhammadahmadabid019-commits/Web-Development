const express = require('express');
const router = express.Router();

const Product = require('../models/Product');
const Quote = require('../models/Quote');

// Landing page route
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'SecureNet Solutions - Home'
  });
});

// GET /onsale-products
router.get('/onsale-products', async (req, res) => {
  try {
    const products = await Product.find({ isOnSale: true }).populate('category');
    res.render('onsale', {
      title: 'On Sale Products - SecureNet',
      products
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
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
