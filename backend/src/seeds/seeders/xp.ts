/**
 * ============================================================================
 * QUESTIFY SEEDER: XP Logs Seeder
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Populates sample XP transactions showing how mock users earned their points.
 * 
 * WHY IT EXISTS:
 * Populates progress breakdown lists and leaderboard standing tables.
 * 
 * HOW IT WORKS (Technical Overview):
 * Generates audit events linked to student IDs.
 * ============================================================================
 */

import { Types } from "mongoose";
import { XPModel, XP_POINT_VALUES } from "@/models/XP";
import type { XPActivityType } from "@/models/XP";
import type { IEnrollment } from "@/models/Enrollment";

// XP activity types that don't require a real assignment/submission reference
const ACTIVITY_TYPES: XPActivityType[] = [
  "ATTENDANCE",
  "MATERIAL_READ",
  "PARTICIPATION",
  "QUIZ",
];

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 86_400_000);
}

// LCG for reproducible XP distributions
let _s = 13;
function r(): number {
  _s = (_s * 1664525 + 1013904223) & 0xffffffff;
  return (_s >>> 0) / 0xffffffff;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(r() * arr.length)];
}

export async function seedXP(enrollments: IEnrollment[]): Promise<number> {
  const docs: object[] = [];
  let skipped = 0;

  for (const enrollment of enrollments) {
    if (enrollment.status === "DROPPED") continue;

    // 3–12 XP events per enrollment; COMPLETED enrollments get more
    const base  = enrollment.status === "COMPLETED" ? 8 : 3;
    const count = base + Math.floor(r() * 5);

    for (let i = 0; i < count; i++) {
      const type   = pick(ACTIVITY_TYPES);
      const points = XP_POINT_VALUES[type];

      // All three sparse compound indexes include every doc (because studentId and
      // type are always present). Assigning a unique ObjectId to each reference field
      // ensures no two seed records collide in any of the three uniqueness indexes:
      //   unique_attendance_xp  → { studentId, metadata.attendanceId, type }
      //   unique_submission_xp  → { studentId, metadata.submissionId,  type }
      //   unique_material_xp    → { studentId, metadata.materialId,    type }
      docs.push({
        studentId: enrollment.studentId,
        courseId:  enrollment.courseId,
        type,
        points,
        earnedAt:  daysAgo(Math.floor(r() * 90) + 1),
        metadata: {
          description:  `Seed — ${type}`,
          attendanceId: new Types.ObjectId(),
          materialId:   new Types.ObjectId(),
          submissionId: new Types.ObjectId(),
        },
      });
    }
  }

  if (docs.length === 0) {
    console.log("   XP: 0 records (no eligible enrollments)");
    return 0;
  }

  // insertMany bypasses post-save hooks (intentional — avoids double-counting XP
  // since enrollment.totalXpEarned is already set by seedEnrollments)
  const result = await XPModel.insertMany(docs, { ordered: false });

  // If there are existing records from a prior partial run, some inserts may fail
  // on the unique indexes. ordered:false lets the rest through; we count successes.
  const inserted = result.length;

  if (docs.length - inserted > 0) {
    skipped = docs.length - inserted;
  }

  console.log(`   XP: ${inserted} created, ${skipped} skipped`);
  return inserted;
}
