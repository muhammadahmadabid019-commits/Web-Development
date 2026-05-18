const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get Cart
router.get('/', async (req, res) => {
  try {
    const cartCookie = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
    
    // Populate cart with actual product details
    const cartItems = [];
    let subtotal = 0;

    for (let item of cartCookie) {
      try {
        const product = await Product.findById(item.productId);
        if (product) {
          cartItems.push({
            product,
            quantity: item.quantity
          });
          subtotal += product.price * item.quantity;
        }
      } catch (err) {
        console.error('Error fetching product for cart:', err);
      }
    }

    const tax = subtotal * 0.05; // 5% tax
    const shipping = subtotal > 0 ? 15 : 0; // Flat $15 shipping if cart not empty
    const total = subtotal + tax + shipping;

    res.render('cart', {
      title: 'Your Shopping Cart',
      cartItems,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2)
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Add to Cart
router.post('/add/:id', (req, res) => {
  const productId = req.params.id;
  const quantity = parseInt(req.body.quantity) || 1;
  let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];

  const existingItemIndex = cart.findIndex(item => item.productId === productId);
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  res.cookie('cart', JSON.stringify(cart), { maxAge: 9000000, httpOnly: true });
  res.redirect(req.get('Referrer') || '/products');
});

// Remove from Cart
router.post('/remove/:id', (req, res) => {
  const productId = req.params.id;
  let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
  
  cart = cart.filter(item => item.productId !== productId);
  
  res.cookie('cart', JSON.stringify(cart), { maxAge: 9000000, httpOnly: true });
  res.redirect('/cart');
});

// Update Quantity
router.post('/update/:id', (req, res) => {
  const productId = req.params.id;
  const quantity = parseInt(req.body.quantity) || 1;
  let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
  
  const existingItemIndex = cart.findIndex(item => item.productId === productId);
  if (existingItemIndex > -1) {
    if (quantity > 0) {
      cart[existingItemIndex].quantity = quantity;
    } else {
      cart = cart.filter(item => item.productId !== productId);
    }
  }
  
  res.cookie('cart', JSON.stringify(cart), { maxAge: 9000000, httpOnly: true });
  res.redirect('/cart');
});

module.exports = router;
