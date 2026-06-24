import mongoose from "mongoose";

/**
 * Opens a Mongoose connection to the test database.
 * Call in `beforeAll` of each integration test suite.
 */
export async function connectTestDB(): Promise<void> {
  const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/questify_test";
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
}

/**
 * Wipes every collection in the test database.
 * Call in `beforeEach` (full isolation) or `beforeAll` (suite-level reset).
 */
export async function clearCollections(): Promise<void> {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((col) => col.deleteMany({})));
}
