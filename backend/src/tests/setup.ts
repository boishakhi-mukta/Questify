/**
 * ============================================================================
 * QUESTIFY TESTS: Database Setup
 *
 * WHAT IT DOES (For Non-Technical Readers):
 * Connects to a separate test database and clears it out before tests run,
 * so tests never touch real student/course data.
 *
 * WHY IT EXISTS:
 * Keeps automated tests isolated and repeatable — each test run starts clean.
 *
 * HOW IT WORKS (Technical Overview):
 * Thin wrappers around Mongoose's connect and collection-clearing calls.
 * ============================================================================
 */

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
