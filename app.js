require("dotenv").config();
console.log("NODE_ENV:", process.env.NODE_ENV);
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("./config/passport");
const flash = require("connect-flash");
const cors = require("cors");
const path = require("path");
const googleStrategy = require("passport-google-oauth20").Strategy;

const app = express();

// Database Connection
// mongoose
//   .connect(process.env.MONGODB_URI, {
//     // useNewUrlParser: true,
//     // useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.log("MongoDB Connection Error:", err));
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1); // Stop the app if DB connection fails
  });

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Session Middleware

//Session for MongoDB ATLAS.......
const store = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("Error in MONGODB SESSION STORE", err);
});

//Session for local storage MongoDB....
app.use(
  session({
    store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      secure: process.env.NODE_ENV === "production", // Use secure in production
    },
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash Messages
app.use(flash());

// Global Variables Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success");
  res.locals.error_msg = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes);

// Root Route
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }
  res.render("login");
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).render("404", {
    title: "Page Not Found",
    user: req.user,
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", {
    title: "Server Error",
    message: err.message,
    error: process.env.NODE_ENV === "production" ? {} : err,
    user: req.user,
  });
});

// Start Server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   // console.log(`Server running on port ${PORT}`);
//   // console.log(`Visit http://localhost:${PORT}`);
//   console.log(`Server running on port ${PORT}`);
// });

//Why? --> Render runs my app in a containerized environment, so I must explicitly bind it to 0.0.0.0, or else it won't be accessible externally.
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
