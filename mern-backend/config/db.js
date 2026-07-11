const mongoose = require('mongoose');

/**
 * Connects Express to MongoDB Atlas.
 * Called once at server startup in server.js.
 * Exits process on failure — do not start the server with no DB connection.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
