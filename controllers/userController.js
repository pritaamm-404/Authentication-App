const User = require("../models/User"); // Import the User model
const transporter = require("../config/nodemailer"); // Nodemailer transporter

// ** Render User Profile Page **
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    ); //.select is used to exclude sensitive fields

    if (!user) {
      return res.status(404).render("error", {
        title: "User Not Found",
        error: "User profile could not be found",
      });
    }

    res.render("userProfile", { user });
  } catch (error) {
    console.error("Profile retrieval error:", error);
    req.flash("error", "Error retrieving profile");
    res.redirect("/dashboard");
  }
};

// ** Update User Profile **
exports.updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, email },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      req.flash("error", "Unable to update profile");
      return res.redirect("/profile");
    }

    req.flash("success", "Profile updated successfully");
    res.redirect("/profile");
  } catch (error) {
    console.error("Profile update error:", error);
    req.flash("error", "Error updating profile");
    res.redirect("/profile");
  }
};

// ** Change User Password **
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    // Find user by ID
    const user = await User.findById(req.user.id);

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/profile/change-password");
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      req.flash("error", "Current password is incorrect");
      return res.redirect("/profile/change-password");
    }

    // Check if new passwords match
    if (newPassword !== confirmNewPassword) {
      req.flash("error", "New passwords do not match");
      return res.redirect("/profile/change-password");
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send confirmation email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Changed on Authify",
      html: `<b>Hello, ${user.firstName}!</b><br>Your password has been successfully updated. <br><br> Best Regards`,
    };
    await transporter.sendMail(mailOptions);

    req.flash("success", "Password changed successfully");
    res.redirect("/profile");
  } catch (error) {
    console.error("Password change error:", error);
    req.flash("error", "Error changing password");
    res.redirect("/profile/change-password");
  }
};

// Render update password page while being logged in..................................................
exports.renderUpdatePasswordPage = (req, res) => {
  res.render("updatePassword");
};

// ** Delete User Account **
exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);

    // Logout user after account deletion
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
      req.flash("success", "Your account has been deleted");
      res.redirect("/login");
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    req.flash("error", "Error deleting account");
    res.redirect("/profile");
  }
};
