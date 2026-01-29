const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async (uri) => {
  if (!uri) {
    throw new Error("❌ MONGODB_URI is missing");
  }

  // Reuse existing connection
  if (cached.conn) {
    return cached.conn;
  }

  // Create new connection (only once)
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  console.log("✅ MongoDB connected (cached)");
  return cached.conn;
};

module.exports = connectDB;

