/**
 * ============================================================================
 * QUESTIFY CONFIGURATION: Database Configuration
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Tells the backend application how to locate and safely connect to our
 * MongoDB database server.
 * 
 * WHY IT EXISTS:
 * Essential link establishing connection pathways for storage retrievals.
 * 
 * HOW IT WORKS (Technical Overview):
 * Reads connection strings from environment profiles to configure Mongoose options.
 * ============================================================================
 */

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

// Wires up logging so we get a message in the console/log file whenever the
// database connection has a problem, drops, or comes back — makes outages visible.
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

// Opens the connection to the MongoDB database when the server starts.
// If we're already connected it does nothing; if the connection attempt
// fails, it logs the error and shuts the server down rather than running
// in a broken state with no database.
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

// Cleanly closes the database connection — used when the server shuts down
// (or between automated tests) so nothing is left dangling.
export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
}

export { mongoose };
