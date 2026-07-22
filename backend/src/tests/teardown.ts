/**
 * ============================================================================
 * QUESTIFY TESTS: Database Teardown
 *
 * WHAT IT DOES (For Non-Technical Readers):
 * Disconnects from the test database once a test suite finishes.
 *
 * WHY IT EXISTS:
 * Cleans up the connection so test processes shut down properly instead of
 * hanging open.
 *
 * HOW IT WORKS (Technical Overview):
 * A thin wrapper around Mongoose's disconnect call.
 * ============================================================================
 */

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
