import mongoose from "mongoose";
import { env } from "./environment";

const CONNECTION_OPTIONS: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5_000,
  socketTimeoutMS: 45_000,
  connectTimeoutMS: 10_000,
  heartbeatFrequencyMS: 10_000,
};

function attachEvents(): void {
  const conn = mongoose.connection;

  conn.on("error", (err: Error) => {
    console.error("❌  MongoDB error:", err.message);
  });

  conn.on("disconnected", () => {
    console.warn("⚠️   MongoDB disconnected");
  });

  conn.on("reconnected", () => {
    console.log("✅  MongoDB reconnected");
  });

  conn.on("close", () => {
    console.log("MongoDB connection closed");
  });
}

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;

  try {
    attachEvents();
    await mongoose.connect(env.MONGODB_URI, CONNECTION_OPTIONS);
    console.log(`✅  MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error("❌  MongoDB connection failed:", err);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
  console.log("MongoDB disconnected");
}

export { mongoose };
