import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not defined. Add it to your .env file."
  );
}

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      // These options are now default in Mongoose 8+, but explicit for clarity
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log("✅  MongoDB connected:", mongoose.connection.host);

    mongoose.connection.on("error", (err) => {
      console.error("❌  MongoDB connection error:", err);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️   MongoDB disconnected. Reconnecting...");
      isConnected = false;
    });
  } catch (err) {
    console.error("❌  Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}
