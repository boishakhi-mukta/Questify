/**
 * ============================================================================
 * QUESTIFY UTILITY: Password Hashing
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Converts plaintext passwords into secure encrypted strings (hashes) for database storage.
 * 
 * WHY IT EXISTS:
 * Crucial security utility ensuring login credentials cannot be stolen from storage.
 * 
 * HOW IT WORKS (Technical Overview):
 * Uses bcryptjs algorithms to run salt cycles during password hashing checks.
 * ============================================================================
 */

import { randomBytes } from "crypto";

// Ambiguous characters (0/O, 1/I/l) intentionally excluded so the password is
// easy to read and type from an email.
const UPPER   = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER   = "abcdefghjkmnpqrstuvwxyz";
const NUMBERS = "23456789";
const SPECIAL = "!@#$%&*";

// Picks `n` random characters from the given set of allowed characters —
// a building block used to construct a temporary password.
function pickRandom(chars: string, n: number): string[] {
  return Array.from({ length: n }, () => {
    const byte = randomBytes(1)[0];
    return chars[byte % chars.length];
  });
}

// Generates an 8-character password that satisfies all strength rules:
// at least 2 uppercase, 2 lowercase, 2 numeric, 2 special — then shuffled.
export function generateTempPassword(): string {
  const chars = [
    ...pickRandom(UPPER,   2),
    ...pickRandom(LOWER,   2),
    ...pickRandom(NUMBERS, 2),
    ...pickRandom(SPECIAL, 2),
  ];

  // Fisher-Yates shuffle with crypto-grade entropy
  for (let i = chars.length - 1; i > 0; i--) {
    const byte = randomBytes(1)[0];
    const j    = byte % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
