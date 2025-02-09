// const express = require('express');
// const passport = require('../config/passport');
// const router = express.Router();
// const authController = require('../controllers/authController');
// const {
//   ensureAuthenticated,
//   forwardAuthenticated
// } = require('../middleware/authMiddleware');

// // Public Routes
// router.get('/login', forwardAuthenticated, (req, res) => {
//   res.render('login', {
//     error: req.flash('error'),
//     success: req.flash('success')
//   });
// });

// router.get('/signup', forwardAuthenticated, (req, res) => {
//   res.render('signup', {
//     error: req.flash('error'),
//     success: req.flash('success')
//   });
// });

// // Authentication Routes
// router.post('/login',
//   passport.authenticate('local', {
//     successRedirect: '/dashboard',
//     failureRedirect: '/login',
//     failureFlash: true
//   })
// );

// router.post('/signup', authController.signup);

// // Google OAuth Routes
// router.get('/google',
//   passport.authenticate('google', {
//     scope: ['profile', 'email']
//   })
// );

// router.get('/google/callback',
//   passport.authenticate('google', {
//     failureRedirect: '/login',
//     successRedirect: '/dashboard'
//   })
// );

// // Protected Routes
// router.get('/dashboard', ensureAuthenticated, (req, res) => {
//   res.render('dashboard', { user: req.user });
// });

// // Logout Route
// router.get('/logout', (req, res, next) => {
//   req.logout((err) => {
//     if (err) return next(err);
//     req.flash('success', 'You are now logged out');
//     res.redirect('/login');
//   });
// });

// // Password Reset Routes
// router.get('/forgot-password', forwardAuthenticated, (req, res) => {
//   res.render('forgot-password', {
//     error: req.flash('error'),
//     success: req.flash('success')
//   });
// });

// router.post('/forgot-password', authController.forgotPassword);
// router.get('/reset-password/:token', authController.resetPasswordForm);
// router.post('/reset-password/:token', authController.resetPassword);

// module.exports = router;

const User = require("../models/User"); // Import the User model
const transporter = require("../config/nodemailer"); // Nodemailer transporter

// ** Render Login Page **
exports.renderLoginPage = (req, res) => {
  res.render("login", {
    error: req.flash("error"),
    success: req.flash("success"),
  });
};

// ** Render Signup Page **
exports.renderSignupPage = (req, res) => {
  res.render("signup", {
    error: req.flash("error"),
    success: req.flash("success"),
  });
};

// ** Render Forgot Password Page **
exports.renderForgotPasswordPage = (req, res) => {
  res.render("forgot-password", {
    error: req.flash("error"),
    success: req.flash("success"),
  });
};

// ** Render Change Password Page **
exports.renderChangePasswordPage = (req, res) => {
  res.render("reset-password-page", {
    error: req.flash("error"),
    success: req.flash("success"),
  });
};

// ** Render Dashboard **
exports.renderDashboard = (req, res) => {
  res.render("dashboard", { user: req.user });
};

// ** Handle Signup Logic **
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "Email already in use");
      return res.redirect("/signup");
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
    });
    await newUser.save();

    // Send confirmation email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to App!",
      html: `<b>Hello, ${firstName}!</b><br>Your account has been successfully created. Welcome to WanderLust!`,
    };
    await transporter.sendMail(mailOptions);

    req.flash("success", "Account created successfully. You can now log in.");
    res.redirect("/login");
  } catch (error) {
    console.error("Signup error:", error);
    req.flash("error", "Error creating account. Please try again.");
    // res.redirect("/signup");
    res.redirect("/signup");
  }
};

// ** Handle Logout Logic **
exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You are now logged out");
    res.redirect("/login");
  });
};

// ** Handle Forgot Password Logic **
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "No account found with that email");
      return res.redirect("/forgot-password");
    }

    // Generate and set reset token using user model method
    const token = user.generateResetToken();
    await user.save();

    // Send reset email
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/reset-password/${token}`;
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Password Reset Request",
      html: `<b>Hello!</b><br>You requested a password reset. Click the link below to reset your password:<br><a href="${resetUrl}">${resetUrl}</a><br>If you didn't request this, please ignore this email.`,
    };

    // console.log("Sending email to:", email);
    // console.log("Mail options:", mailOptions);

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");

    req.flash("success", "Password reset email sent. Please check your inbox.");
    res.redirect("/forgot-password");
  } catch (error) {
    console.error("Forgot password error:", error);
    req.flash("error", "Error sending password reset email. Please try again.");
    res.redirect("/forgot-password");
  }
};

// ** Render Reset Password Form **
exports.resetPasswordForm = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token, // Find user by token and expiry date greater than now (not expired)
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired");
      return res.redirect("/forgot-password");
    }

    res.render("reset-password-page", { token: req.params.token });
  } catch (error) {
    console.error("Reset password form error:", error);
    req.flash("error", "Error loading reset form");
    res.redirect("/forgot-password");
  }
};

// ** Handle Reset Password Logic **
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match");
      return res.redirect(`/reset-password/${token}`);
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired");
      return res.redirect("/forgot-password");
    }
    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.flash(
      "success",
      "Password has been reset successfully. You can now log in."
    );
    res.redirect("/login");
  } catch (error) {
    console.error("Reset password error:", error);
    req.flash("error", "Error resetting password. Please try again.");
    res.redirect(`/reset-password/${req.params.token}`);
  }
};
