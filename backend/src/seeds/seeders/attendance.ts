/**
 * ============================================================================
 * QUESTIFY SEEDER: Attendance Seeder
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Logs mock classroom attendance logs.
 * 
 * WHY IT EXISTS:
 * Populates charts monitoring student attendance trends.
 * 
 * HOW IT WORKS (Technical Overview):
 * Inserts attendance logs matching course IDs and dates.
 * ============================================================================
 */

import { Types } from "mongoose";
import { Attendance } from "@/models/Attendance";
import type { IEnrollment } from "@/models/Enrollment";
import type { IUser } from "@/models/User";
import type { ICourse } from "@/models/Course";

// Normalize a date to midnight UTC to satisfy the unique(studentId, courseId, date) index
function midnight(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number): Date {
  return midnight(new Date(Date.now() - n * 86_400_000));
}

// Generate 8 class-session dates evenly spread over the past 10 weeks.
// Offset by courseIndex to avoid all courses having the same dates (which would
// violate the unique-per-student-course-date index if two courses share a date
// and the same student appears in both on the same day... that's actually fine
// since the index is per course, but offset avoids visual monotony in the data).
function sessionDates(courseIndex: number): Date[] {
  const dates: Date[] = [];
  for (let week = 0; week < 8; week++) {
    const daysBack = 7 * (8 - week) + (courseIndex % 3);
    dates.push(daysAgo(daysBack));
  }
  // Remove duplicates (can happen with offset arithmetic)
  const seen = new Set<string>();
  return dates.filter((d) => {
    const k = d.toISOString();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// Creates sample attendance records (present/absent) for every enrolled
// student across roughly 8 weeks of class sessions, so demo dashboards have
// realistic attendance history and rates to display.
export async function seedAttendance(
  enrollments: IEnrollment[],
  teachers:    IUser[],
  courses:     ICourse[]
): Promise<number> {
  const docs: {
    studentId: Types.ObjectId;
    courseId:  Types.ObjectId;
    date:      Date;
    present:   boolean;
    markedBy:  Types.ObjectId;
    remarks?:  string;
  }[] = [];

  let skipped = 0;

  for (const enrollment of enrollments) {
    if (enrollment.status === "DROPPED") continue;

    const courseIdStr = enrollment.courseId.toString();
    const courseIndex = courses.findIndex((c) => c._id.toString() === courseIdStr);
    const course      = courses[courseIndex];
    if (!course) continue;

    const teacher = teachers.find((t) =>
      course.teachers.map(String).includes(t._id.toString())
    ) ?? teachers[0];

    for (const date of sessionDates(courseIndex)) {
      // Check uniqueness before adding to bulk list
      const exists = await Attendance.findOne({
        studentId: enrollment.studentId,
        courseId:  enrollment.courseId,
        date,
      });
      if (exists) { skipped++; continue; }

      // ~85% attendance rate; COMPLETED enrollments attend ~95%
      const threshold = enrollment.status === "COMPLETED" ? 0.05 : 0.15;
      const present   = Math.random() > threshold;

      docs.push({
        studentId: enrollment.studentId as Types.ObjectId,
        courseId:  enrollment.courseId  as Types.ObjectId,
        date,
        present,
        markedBy:  teacher._id as Types.ObjectId,
        remarks:   !present && Math.random() > 0.6 ? "Student notified in advance." : undefined,
      });
    }
  }

  if (docs.length > 0) {
    await Attendance.insertMany(docs, { ordered: false });
  }

  console.log(`   Attendance: ${docs.length} created, ${skipped} skipped`);
  return docs.length;
}
