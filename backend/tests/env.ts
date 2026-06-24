/**
 * Runs in every Jest worker process (via setupFiles in jest.config.js) before
 * any test module is imported. Sets the minimum environment variables required
 * by src/config/environment.ts so importing app/models/controllers doesn't fail.
 *
 * Override any value by exporting it in a .env.test file and loading it first,
 * or by setting it in the shell before running Jest.
 */

process.env.NODE_ENV          = "test";
process.env.MONGODB_URI       =
  process.env.MONGODB_TEST_URI ?? "mongodb://127.0.0.1:27017/questify_test";
// Minimum 32 chars required by Zod schema
process.env.JWT_SECRET        = "test-jwt-secret-that-is-at-least-32-characters-long!!";
process.env.JWT_REFRESH_SECRET= "test-refresh-secret-at-least-32-characters-long!!!";
process.env.ALLOWED_ORIGINS   = "http://localhost:3000";
// Use minimum valid bcrypt rounds to keep unit tests fast
process.env.BCRYPT_ROUNDS     = "10";
process.env.LOG_FORMAT        = "tiny";
// Optional fields — empty is fine for tests
process.env.CLERK_SECRET_KEY  = "";
