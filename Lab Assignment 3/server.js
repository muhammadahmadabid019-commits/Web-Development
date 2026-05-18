const express = require('express');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const config = require('config');
const path = require('path');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Routes
const indexRoutes = require('./routes/index');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const authRoutes = require('./routes/auth');
const adminProductRoutes = require('./routes/admin/products');

// Middlewares
const { isAdmin } = require('./middlewares/auth');

const app = express();

app.use(cors());

// Configuration
const PORT = config.has('port') ? config.get('port') : 3000;
const MONGO_URI = config.get('mongoURI');

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Set up EJS and Layouts
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

// Built-in Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Session Configuration (stored in MongoDB)
app.use(session({
  secret: 'securenet-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Flash Messages
app.use(flash());

// Global variables for all views
app.use((req, res, next) => {
  // Flash messages
  res.locals.messages = {
    success: req.flash('success'),
    error: req.flash('error')
  };

  // Logged-in user info
  res.locals.currentUser = {
    id: req.session.userId || null,
    name: req.session.userName || null,
    role: req.session.userRole || null
  };

  // Cart badge count (from cookie)
  let cartCount = 0;
  if (req.cookies.cart) {
    try {
      const cart = JSON.parse(req.cookies.cart);
      cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    } catch (e) {}
  }
  res.locals.cartCount = cartCount;

  next();
});

// Set Admin Layout for admin routes
app.use('/admin', (req, res, next) => {
  res.locals.layout = 'admin-layout';
  next();
});

// Mount Routes
app.use('/', indexRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/auth', authRoutes);
app.use('/admin/products', isAdmin, adminProductRoutes); // Protected by isAdmin

// 404 Handler
app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Page Not Found' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
