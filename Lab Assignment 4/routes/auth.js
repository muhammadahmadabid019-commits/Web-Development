const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /auth/register
router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('auth/register', {
    title: 'Register - SecureNet',
    layout: 'auth-layout',
    error: null
  });
});

// POST /auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.render('auth/register', {
      title: 'Register - SecureNet', layout: 'auth-layout',
      error: 'All fields are required.'
    });
  }

  if (password !== confirmPassword) {
    return res.render('auth/register', {
      title: 'Register - SecureNet', layout: 'auth-layout',
      error: 'Passwords do not match.'
    });
  }

  if (password.length < 6) {
    return res.render('auth/register', {
      title: 'Register - SecureNet', layout: 'auth-layout',
      error: 'Password must be at least 6 characters.'
    });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.render('auth/register', {
        title: 'Register - SecureNet', layout: 'auth-layout',
        error: 'An account with this email already exists.'
      });
    }

    const user = await User.create({ name, email, password });

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.redirect('/');
  } catch (err) {
    console.error('Registration error:', err);
    res.render('auth/register', {
      title: 'Register - SecureNet', layout: 'auth-layout',
      error: 'Something went wrong. Please try again.'
    });
  }
});

// GET /auth/login
router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('auth/login', {
    title: 'Login - SecureNet',
    layout: 'auth-layout',
    error: null
  });
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('auth/login', {
      title: 'Login - SecureNet', layout: 'auth-layout',
      error: 'Email and password are required.'
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('auth/login', {
        title: 'Login - SecureNet', layout: 'auth-layout',
        error: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('auth/login', {
        title: 'Login - SecureNet', layout: 'auth-layout',
        error: 'Invalid email or password.'
      });
    }

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    if (user.role === 'admin') {
      res.redirect('/admin/products');
    } else {
      res.redirect('/');
    }
  } catch (err) {
    console.error('Login error:', err);
    res.render('auth/login', {
      title: 'Login - SecureNet', layout: 'auth-layout',
      error: 'Something went wrong. Please try again.'
    });
  }
});

// GET /auth/logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
});

module.exports = router;
