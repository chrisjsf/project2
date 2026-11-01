function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }

  req.session.message = 'Please log in to continue.';
  return res.redirect('/login');
}

module.exports = {
  isAuthenticated
};
