require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const config = require('config');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Routes
const indexRoutes = require('./routes/index');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const adminProductRoutes = require('./routes/admin/products');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();

// Middlewares
app.use(cors());

// Configuration
const PORT = process.env.PORT || (config.has('port') ? config.get('port') : 3000);
const MONGO_URI = config.get('mongoURI');

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully to: ' + MONGO_URI))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Set up EJS and Layouts
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout'); // default layout is views/layout.ejs

// Built-in Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Session
app.use(session({
  secret: 'securenet-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Global variables for views
app.use((req, res, next) => {
  // Cart count from cookie
  let cartCount = 0;
  if (req.cookies.cart) {
    try {
      const cart = JSON.parse(req.cookies.cart);
      cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    } catch (e) {}
  }
  res.locals.cartCount = cartCount;

  // Expose logged-in user to all views
  res.locals.currentUser = req.session.user || null;

  next();
});

// Set Admin Layout for admin routes
app.use('/admin', (req, res, next) => {
  res.locals.layout = 'admin-layout';
  next();
});

// Auth views use minimal auth-layout (no navbar/footer)
app.use('/auth', (req, res, next) => {
  res.locals.layout = 'auth-layout';
  next();
});

// Mount Routes
app.use('/', indexRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/admin/products', adminProductRoutes);
app.use('/auth', authRoutes);
app.use('/api/v1', apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 - Page Not Found'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
