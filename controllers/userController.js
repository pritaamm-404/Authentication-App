// const User = require("../models/User"); // Import the User model
// // Import the nodemailer transporter
// const transporter = require("../config/nodemailer");

// // Get user profile page and render user data when user is authenticated
// exports.getUserProfile = async (req, res) => {
//   try {
//     // Find user by ID and exclude sensitive fields
//     const user = await User.findById(req.user.id).select(
//       "-password -resetPasswordToken -resetPasswordExpires"
//     );

//     if (!user) {
//       return res.status(404).render("error", {
//         title: "User Not Found",
//         error: "User profile could not be found",
//       });
//     }

//     res.render("profile", { user });
//   } catch (error) {
//     console.error("Profile retrieval error:", error);
//     req.flash("error", "Error retrieving profile");
//     res.redirect("/dashboard");
//   }
// };

// // Update user profile
// exports.updateUserProfile = async (req, res) => {
//   try {
//     const { firstName, lastName, email } = req.body;

//     // Find and update user
//     const updatedUser = await User.findByIdAndUpdate(
//       req.user.id,
//       {
//         firstName,
//         lastName,
//         email,
//       },
//       {
//         new: true, // Return updated document
//         runValidators: true, // Run model validations
//       }
//     );

//     if (!updatedUser) {
//       req.flash("error", "Unable to update profile");
//       return res.redirect("/profile");
//     }
//     const mailOptions = {
//       from: process.env.SENDER_EMAIL, // sender address
//       to: email, // list of receivers
//       subject: "Update profile on WanderLust's", // Subject line
//       html: `<b>Hello the WanderLust, ${firstName}!!!</b><br>Your account has been updated successfully with the email id: ${email}.
//       <b>If it is not you then check security of your profile.</b> <br>Hope to have a great journey with you ahead!!`, // html body
//       // text:`Welcome to the world of WanderLust's, ${username}!!! Your account has been created successfully with the email id: ${email}. Hope to have a great journey with you ahead!!` // plain text body
//     };
//     await transporter.sendMail(mailOptions);

//     req.flash("success", "Profile updated successfully");
//     res.redirect("/profile");
//   } catch (error) {
//     console.error("Profile update error:", error);
//     req.flash("error", "Error updating profile");
//     res.redirect("/profile");
//   }
// };

// // Change password
// exports.changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword, confirmNewPassword } = req.body;

//     // Find user by ID
//     const user = await User.findById(req.user.id);

//     // Verify current password
//     const isMatch = await user.comparePassword(currentPassword);

//     if (!isMatch) {
//       req.flash("error", "Current password is incorrect");
//       return res.redirect("/profile/change-password");
//     }

//     // Check if new passwords match
//     if (newPassword !== confirmNewPassword) {
//       req.flash("error", "New passwords do not match");
//       return res.redirect("/profile/change-password");
//     }

//     // Update password
//     user.password = newPassword;
//     await user.save();
//     const mailOptions = {
//       from: process.env.SENDER_EMAIL, // sender address
//       to: email, // list of receivers
//       subject: "Password change on WanderLust's", // Subject line
//       html: `<b>Hello WanderLust's, ${user}!!!</b><br>Your password has been updated successfully.<br>Hope to have a great journey with you ahead!!`,
//     };
//     await transporter.sendMail(mailOptions);

//     req.flash("success", "Password changed successfully");
//     res.redirect("/profile");
//   } catch (error) {
//     console.error("Password change error:", error);
//     req.flash("error", "Error changing password");
//     res.redirect("/profile/change-password");
//   }
// };

// // Delete user account
// exports.deleteAccount = async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.user.id);

//     // Logout user after account deletion
//     req.logout((err) => {
//       if (err) {
//         console.error("Logout error:", err);
//       }
//       req.flash("success", "Your account has been deleted");
//       res.redirect("/login");
//     });
//   } catch (error) {
//     console.error("Account deletion error:", error);
//     req.flash("error", "Error deleting account");
//     res.redirect("/profile");
//   }
// };

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
      subject: "Password Changed on App",
      html: `<b>Hello, ${user.firstName}!</b><br>Your password has been successfully updated.`,
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
