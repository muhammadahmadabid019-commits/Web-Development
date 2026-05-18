const express = require('express');
const router = express.Router();

// Landing page route
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'SecureNet Solutions - Home'
  });
});

module.exports = router;
