const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    // Build the query object for filtering
    const query = {};

    // Search by name
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }

    // Filter by category
    if (req.query.category && req.query.category !== '') {
      query.category = req.query.category;
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find(query)
      .populate('category')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt'); // Default sorting by newest

    const categories = await Category.find();

    res.render('products', { 
      title: 'Our Products - SecureNet',
      products,
      categories,
      currentPage: page,
      totalPages,
      query: req.query // Pass query params back to the view to maintain filter state
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
