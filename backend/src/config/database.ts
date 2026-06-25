import mongoose from "mongoose";
import { env } from "./environment";
import { logger } from "@/utils/logger";

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
    logger.error("MongoDB error", { message: err.message });
  });

  conn.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });

  conn.on("reconnected", () => {
    logger.info("MongoDB reconnected");
  });

  conn.on("close", () => {
    logger.info("MongoDB connection closed");
  });
}

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;

  try {
    attachEvents();
    await mongoose.connect(env.MONGODB_URI, CONNECTION_OPTIONS);
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    logger.error("MongoDB connection failed", { error: err });
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
}

export { mongoose };
