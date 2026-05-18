// Ensure user is logged in
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) return next();
  res.redirect('/auth/login');
};

// Ensure user is an admin
exports.isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role && req.session.user.role.toLowerCase() === 'admin') {
    return next();
  }
  res.status(403).render('403', {
    title: '403 - Access Denied',
    layout: false
  });
};
