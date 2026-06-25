import mongoose from "mongoose";

/**
 * Closes the Mongoose connection.
 * Call in `afterAll` of each integration test suite.
 */
export async function disconnectTestDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
