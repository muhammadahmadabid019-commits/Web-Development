// Middleware: Ensure user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  req.flash('error', 'Please log in to access that page.');
  res.redirect('/auth/login');
};

// Middleware: Ensure user is an Admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.userRole && req.session.userRole.trim().toLowerCase() === 'admin') {
    return next();
  }
  req.flash('error', 'Access Denied. Admins only.');
  res.redirect('/');
};

module.exports = { isLoggedIn, isAdmin };
