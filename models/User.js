const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); //This is a built-in Node module that we will use to generate the reset password token

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        // Only require password for local strategy
        return !this.googleId; // If googleId is not set (i.e. local strategy)
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    firstName: String,
    lastName: String,
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified or is new
  if (!this.isModified("password")) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);

    // Hash the password along with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate and set reset password token
UserSchema.methods.generateResetToken = function () {
  const token = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour

  return token;
};

// a method to find or create Google user..........................
UserSchema.statics.findOrCreateGoogleUser = async function (profile) {
  let user = await this.findOne({ googleId: profile.id });

  if (user) {
    // If user exists, return the user
    console.log("User already exists:", user);
    req.flash("error", "User already exists");
    return done(null, user);
  }
  if (!user) {
    user = new this({
      googleId: profile.id,
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
    });
    await user.save();
  }
  return user;
};
const User = mongoose.model("User", UserSchema);

module.exports = User;
