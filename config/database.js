const mongoose = require('mongoose');

// Database connection options
const connectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

// Database connection function
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, connectOptions);
    console.log('MongoDB Connected Successfully');
    
    // Optional: Connection event listeners
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

  } catch (error) {
    console.error('MongoDB Connection Failed:', error.message);
    
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;