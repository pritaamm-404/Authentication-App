const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const {
  ensureAuthenticated,
  forwardAuthenticated,
} = require("../middleware/authMiddleware");

// ** Authentication Routes **
router.get("/login", forwardAuthenticated, authController.renderLoginPage);
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.get("/signup", forwardAuthenticated, authController.renderSignupPage);
router.post("/signup", authController.signup);

router.get("/logout", authController.logout);

// Google OAuth Route...........
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google Auth Callback Route
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "/dashboard",
  })
);

// ** Password Management Routes **
router.get(
  "/forgot-password",
  forwardAuthenticated,
  authController.renderForgotPasswordPage
);
router.post("/forgot-password", authController.forgotPassword);
router.get("/reset-password/:token", authController.resetPasswordForm);
router.post("/reset-password/:token", authController.resetPassword);

// ** Protected Routes **
router.get("/dashboard", ensureAuthenticated, authController.renderDashboard);

// ** User Profile Routes **
router.get("/profile", ensureAuthenticated, userController.getUserProfile);
router.post(
  "/profile/update",
  ensureAuthenticated,
  userController.updateUserProfile
);
router.post(
  "/profile/delete",
  ensureAuthenticated,
  userController.deleteAccount
);

router.get(
  "/profile/change-password",
  ensureAuthenticated,
  authController.resetPasswordForm
); // render change password page is in authController

router.post(
  "/profile/change-password",
  ensureAuthenticated,
  userController.changePassword
); // change password is in userController; it is used to update the password in the database

router.get(
  "/profile/update-password",
  ensureAuthenticated,
  userController.renderUpdatePasswordPage
);

module.exports = router;
