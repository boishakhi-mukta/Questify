/**
 * ============================================================================
 * QUESTIFY MAINTENANCE SCRIPT: Backfill Enrollment XP Totals
 *
 * WHAT IT DOES (For Non-Technical Readers):
 * Recalculates each student's "total XP earned" number for every course,
 * by re-adding up their real XP history — fixing it if it ever went stale
 * or wrong (which is what causes the leaderboard and XP stats to show 0).
 *
 * WHY IT EXISTS:
 * Enrollment.totalXpEarned is a cached shortcut number, kept in sync
 * automatically whenever XP is awarded through the normal app flow. But
 * bulk-inserting XP records (e.g. during database seeding) skips that
 * automatic update, so the cached number can drift away from reality. This
 * script repairs it by recomputing straight from the XP history — the
 * source of truth — for every student/course pair.
 *
 * HOW IT WORKS (Technical Overview):
 * Aggregates the XP collection grouped by (studentId, courseId), then bulk-
 * updates each matching Enrollment's totalXpEarned to that real sum.
 * ============================================================================
 */

import "dotenv/config";
import mongoose, { Types } from "mongoose";
import { XPModel } from "@/models/XP";
import { Enrollment } from "@/models/Enrollment";

// Recomputes totalXpEarned for every enrollment from the real XP ledger.
// Safe to run any time, as many times as needed — it never invents data,
// it only re-derives the cached total from the actual XP records.
export async function recalculateEnrollmentXpTotals(): Promise<{ updated: number }> {
  const totals = await XPModel.aggregate<{
    _id:   { studentId: Types.ObjectId; courseId: Types.ObjectId };
    total: number;
  }>([
    {
      $group: {
        _id:   { studentId: "$studentId", courseId: "$courseId" },
        total: { $sum: "$points" },
      },
    },
  ]);

  if (totals.length === 0) return { updated: 0 };

  const result = await Enrollment.bulkWrite(
    totals.map((t) => ({
      updateOne: {
        filter: { studentId: t._id.studentId, courseId: t._id.courseId },
        update: { $set: { totalXpEarned: t.total } },
      },
    }))
  );

  return { updated: result.modifiedCount };
}

// Lets this be run directly as a one-off repair:
//   ts-node -r tsconfig-paths/register src/seeds/backfill-xp-totals.ts
if (require.main === module) {
  (async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set");

    await mongoose.connect(uri);
    console.log(`✓ Connected: ${uri.replace(/\/\/[^@]+@/, "//***@")}`);

    const { updated } = await recalculateEnrollmentXpTotals();
    console.log(`✓ Recomputed totalXpEarned for ${updated} enrollment(s).`);

    await mongoose.disconnect();
  })().catch((err: unknown) => {
    console.error("✗ Backfill failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
