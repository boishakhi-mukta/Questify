/**
 * ============================================================================
 * QUESTIFY MAINTENANCE SCRIPT: Rehash Known Account Passwords
 *
 * WHAT IT DOES (For Non-Technical Readers):
 * Re-saves the password for every seed/demo account (the ones whose
 * passwords are publicly documented, like student@demo.com), so its stored
 * password hash is regenerated using the current security settings.
 *
 * WHY IT EXISTS:
 * Lowering BCRYPT_ROUNDS only speeds up passwords hashed AFTER the change —
 * a password hash carries its original cost with it forever, so existing
 * accounts (including these test/demo accounts) would otherwise stay on the
 * old, slower setting until someone manually changes their password. This
 * script brings the known accounts up to date immediately.
 *
 * HOW IT WORKS (Technical Overview):
 * Re-sets passwordHash to the same known plaintext password for each seed
 * account and saves it, letting the User model's pre-save hook re-hash it
 * at whatever BCRYPT_ROUNDS is currently configured.
 * ============================================================================
 */

import "dotenv/config";
import mongoose from "mongoose";
import { User } from "@/models/User";
import {
  ADMIN_USERS,
  FACULTY_USERS,
  STUDENT_USERS,
  DEMO_USERS,
} from "@/seeds/seeders/users";

// Re-hashes every known seed/demo account's password at the current
// BCRYPT_ROUNDS cost. Safe to run any time — it only touches accounts whose
// password is already publicly documented in the seed data, and it sets
// each one back to that exact same password, just re-hashed.
export async function rehashKnownAccounts(): Promise<{ updated: number; missing: string[] }> {
  const allDefs = [...ADMIN_USERS, ...FACULTY_USERS, ...STUDENT_USERS, ...DEMO_USERS];

  let updated = 0;
  const missing: string[] = [];

  for (const def of allDefs) {
    const user = await User.findOne({ email: def.email.toLowerCase() }).select("+passwordHash");
    if (!user) { missing.push(def.email); continue; }

    user.passwordHash = def.password; // pre-save hook re-hashes this
    await user.save({ validateModifiedOnly: true });
    updated++;
  }

  return { updated, missing };
}

// Lets this be run directly as a one-off maintenance task:
//   ts-node -r tsconfig-paths/register src/seeds/rehash-known-passwords.ts
if (require.main === module) {
  (async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set");

    await mongoose.connect(uri);
    console.log(`✓ Connected: ${uri.replace(/\/\/[^@]+@/, "//***@")}`);

    const { updated, missing } = await rehashKnownAccounts();
    console.log(`✓ Re-hashed ${updated} account(s) at BCRYPT_ROUNDS=${process.env.BCRYPT_ROUNDS ?? "10"}.`);
    if (missing.length > 0) {
      console.log(`  Not found in this database (skipped): ${missing.join(", ")}`);
    }

    await mongoose.disconnect();
  })().catch((err: unknown) => {
    console.error("✗ Rehash failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
