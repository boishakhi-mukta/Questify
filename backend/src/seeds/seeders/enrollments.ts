/**
 * ============================================================================
 * QUESTIFY SEEDER: Enrollments Seeder
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Registers mock students into mock courses.
 * 
 * WHY IT EXISTS:
 * Ensures mock dashboards display active classes upon login.
 * 
 * HOW IT WORKS (Technical Overview):
 * Inserts links matching mock student IDs with course IDs.
 * ============================================================================
 */

import { Enrollment } from "@/models/Enrollment";
import { Course } from "@/models/Course";
import type { IEnrollment, EnrollmentStatus } from "@/models/Enrollment";
import type { ICourse } from "@/models/Course";
import type { IUser } from "@/models/User";
import { Types } from "mongoose";

// Deterministic LCG — same seed produces same enrolment pattern every run
let _s = 99;
function r(): number {
  _s = (_s * 1664525 + 1013904223) & 0xffffffff;
  return (_s >>> 0) / 0xffffffff;
}
function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 86_400_000);
}

// Pre-determined enrolment plan — guarantees stable demo data
// Format: [studentIndex, courseIndex, status]
type EnrolPlan = [number, number, EnrollmentStatus];

const ENROL_PLAN: EnrolPlan[] = [
  // Alice (0) — CS student
  [0,  0, "ACTIVE"],    // Cloud Computing
  [0,  3, "ACTIVE"],    // Full-Stack Web Dev
  [0,  1, "DROPPED"],   // ML Fundamentals (dropped)

  // Ben (1) — CS
  [1,  0, "COMPLETED"], // Cloud Computing (done)
  [1,  4, "ACTIVE"],    // Cybersecurity

  // Carla (2) — Business
  [2,  5, "ACTIVE"],    // Entrepreneurship
  [2,  7, "ACTIVE"],    // Product Management
  [2,  6, "COMPLETED"], // BI (done)

  // Daniel (3) — CS
  [3,  2, "ACTIVE"],    // Advanced Algorithms
  [3,  3, "ACTIVE"],    // Full-Stack

  // Emma (4) — DST
  [4,  8, "ACTIVE"],    // Statistical Methods
  [4,  1, "ACTIVE"],    // ML Fundamentals

  // Finn (5) — CS
  [5,  0, "ACTIVE"],    // Cloud Computing
  [5,  4, "ACTIVE"],    // Cybersecurity

  // Grace (6) — Business
  [6,  5, "ACTIVE"],    // Entrepreneurship
  [6,  6, "ACTIVE"],    // BI

  // Hassan (7) — DST
  [7,  8, "COMPLETED"], // Statistical Methods (done)
  [7,  1, "ACTIVE"],    // ML Fundamentals

  // Isabella (8) — Business
  [8,  7, "ACTIVE"],    // Product Management
  [8,  6, "DROPPED"],   // BI (dropped)

  // Jack (9) — CS
  [9,  3, "ACTIVE"],    // Full-Stack
  [9,  0, "ACTIVE"],    // Cloud Computing

  // Kira (10) — CS
  [10, 2, "ACTIVE"],    // Advanced Algorithms
  [10, 1, "ACTIVE"],    // ML Fundamentals

  // Liam (11) — MATH
  [11, 9, "ACTIVE"],    // Linear Algebra
  [11, 1, "ACTIVE"],    // ML Fundamentals

  // Maya (12) — Business
  [12, 5, "COMPLETED"], // Entrepreneurship (done)
  [12, 7, "ACTIVE"],    // Product Management

  // Nate (13) — CS
  [13, 0, "ACTIVE"],    // Cloud Computing
  [13, 3, "DROPPED"],   // Full-Stack (dropped)

  // Olivia (14) — DST
  [14, 8, "ACTIVE"],    // Statistical Methods
  [14, 6, "ACTIVE"],    // BI

  // Pedro (15) — CS
  [15, 4, "ACTIVE"],    // Cybersecurity
  [15, 3, "ACTIVE"],    // Full-Stack

  // Quinn (16) — Business
  [16, 6, "ACTIVE"],    // BI
  [16, 5, "ACTIVE"],    // Entrepreneurship

  // Riya (17) — DST
  [17, 8, "COMPLETED"], // Statistical Methods (done)
  [17, 9, "ACTIVE"],    // Linear Algebra

  // Sam (18) — CS
  [18, 0, "COMPLETED"], // Cloud Computing (done)
  [18, 2, "ACTIVE"],    // Advanced Algorithms

  // Tara (19) — Business
  [19, 7, "ACTIVE"],    // Product Management
  [19, 5, "ACTIVE"],    // Entrepreneurship
];

async function upsertEnrollment(
  studentId: Types.ObjectId,
  courseId:  Types.ObjectId,
  status:    EnrollmentStatus
): Promise<{ enrollment: IEnrollment; wasCreated: boolean }> {
  const existing = await Enrollment.findOne({ studentId, courseId });
  if (existing) return { enrollment: existing, wasCreated: false };

  const enrolledAt    = daysAgo(Math.floor(r() * 120) + 10);
  const progressPct   =
    status === "COMPLETED" ? 100 :
    status === "DROPPED"   ? Math.floor(r() * 40) + 5 :
    Math.floor(r() * 70) + 10;

  const enrollment = await Enrollment.create({
    studentId,
    courseId,
    status,
    enrolledAt,
    completedAt:        status === "COMPLETED" ? daysAgo(Math.floor(r() * 14)) : undefined,
    totalXpEarned:      0,
    progressPercentage: progressPct,
    lastAccessedAt:     daysAgo(Math.floor(r() * 7)),
    certificateIssued:  status === "COMPLETED",
    notes:              status === "DROPPED" ? "Student withdrew due to scheduling conflict." : undefined,
  });

  await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });

  return { enrollment, wasCreated: true };
}

export async function seedEnrollments(
  students:    IUser[],
  courses:     ICourse[],
  demoStudent?: IUser,
  demoCourses?: ICourse[]
): Promise<IEnrollment[]> {
  const enrollments: IEnrollment[] = [];
  let created = 0;
  let skipped = 0;

  // Planned enrolments for the 20 regular students
  for (const [si, ci, status] of ENROL_PLAN) {
    const student = students[si];
    const course  = courses[ci];
    if (!student || !course) continue;

    const { enrollment, wasCreated } = await upsertEnrollment(
      student._id as Types.ObjectId,
      course._id  as Types.ObjectId,
      status
    );
    enrollments.push(enrollment as unknown as IEnrollment);
    wasCreated ? created++ : skipped++;
  }

  // Demo student — enrol in first 2 demo courses (or first 2 regular courses)
  if (demoStudent) {
    const targets = demoCourses?.slice(0, 2) ?? courses.slice(0, 2);
    for (const course of targets) {
      const { enrollment, wasCreated } = await upsertEnrollment(
        demoStudent._id as Types.ObjectId,
        course._id      as Types.ObjectId,
        "ACTIVE"
      );
      enrollments.push(enrollment as unknown as IEnrollment);
      wasCreated ? created++ : skipped++;
    }
  }

  console.log(`   Enrollments: ${created} created, ${skipped} skipped`);
  return enrollments;
}
