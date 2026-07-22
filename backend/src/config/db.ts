/**
 * ============================================================================
 * QUESTIFY CONFIGURATION: Database Starter
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * The active adapter that connects the running server to our database storage.
 * 
 * WHY IT EXISTS:
 * Starts the connection logic and prints success logs once database storage connects.
 * 
 * HOW IT WORKS (Technical Overview):
 * Triggers mongoose.connect() and binds event checks on success/failure hooks.
 * ============================================================================
 *
 * NOTE: This is an older, simpler version of the database connector — the
 * app actually starts up using config/database.ts (see server.ts). This file
 * is kept around but is not currently wired into the running server.
 */

import mongoose from "mongoose";
import { logger } from "@/utils/logger";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not defined. Add it to your .env file."
  );
}

let isConnected = false;

// Opens the database connection once, and remembers that it's open so
// calling this function again doesn't try to reconnect unnecessarily.
export async function connectDB(): Promise<void> {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      // These options are now default in Mongoose 8+, but explicit for clarity
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error", { error: err });
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
      isConnected = false;
    });
  } catch (err) {
    logger.error("Failed to connect to MongoDB", { error: err });
    process.exit(1);
  }
}
