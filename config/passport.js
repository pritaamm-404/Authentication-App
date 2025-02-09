const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const flash = require("connect-flash");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        // Find the user by email
        const user = await User.findOne({ email });

        // If no user found
        if (!user) {
          return done(null, false, { message: "Incorrect email." });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google Strategy........................................
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Profile:", profile); // Debug logging
        // Check if user already exists
        // let user = await User.findOne({ googleId: profile.id });

        // if (!user) {
        //   // Create new user if doesn't exist
        //   user = new User({
        //     googleId: profile.id,
        //     email: profile.emails[0].value,
        //     firstName: profile.name.givenName,
        //     lastName: profile.name.familyName,
        //   });

        //   await user.save();
        // }

        // Check if a user already exists
        let user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          // User already exists
          // req.flash("error", "User already exists");
          console.log("User found:", user);
          return done(null, user);
        } else {
          const user = await User.findOrCreateGoogleUser(profile);
          return done(null, user);
        }
      } catch (error) {
        console.error("Google OAuth Error:", error);
        return done(error);
      }
    }
  )
);

module.exports = passport;
