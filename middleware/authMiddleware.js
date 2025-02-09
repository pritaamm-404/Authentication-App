// Middleware to protect routes
exports.ensureAuthenticated = (req, res, next) => { // It checks if the user is authenticated before allowing access to a route and redirects them to the login page if they are not authenticated
  if (req.isAuthenticated()) {
    return next();
  }

  // Store the original URL they were trying to access
  req.session.returnTo = req.originalUrl;

  // Redirect to login page with an error message
  req.flash("error", "Please log in to access this page");
  res.redirect("/login");
};

// Middleware to redirect authenticated users
exports.forwardAuthenticated = (req, res, next) => { //It checks if the user is already authenticated before allowing access to a route and redirects them to the dashboard
  if (req.isAuthenticated()) {
    // If user is already logged in, redirect to dashboard
    return res.redirect("/dashboard");
  }
  next();
};
