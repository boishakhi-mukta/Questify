import { Schema, model, Document, Types } from "mongoose";

export interface IAttendance extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;  // ref: User
  courseId: Types.ObjectId;   // ref: Course
  /** ISO date string YYYY-MM-DD — the class date */
  date: string;
  present: boolean;
  /** Teacher who recorded this entry */
  recordedBy: Types.ObjectId; // ref: User (teacher)
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "studentId is required"],
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "courseId is required"],
    },
    date: {
      type: String,
      required: [true, "date is required"],
      match: [
        /^\d{4}-\d{2}-\d{2}$/,
        "date must be in YYYY-MM-DD format",
      ],
    },
    present: {
      type: Boolean,
      required: [true, "present is required"],
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "recordedBy is required"],
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// One attendance record per student per course per date
AttendanceSchema.index(
  { studentId: 1, courseId: 1, date: 1 },
  { unique: true, name: "unique_attendance_record" }
);
// Teacher dashboard: all attendance for a course on a given date
AttendanceSchema.index({ courseId: 1, date: 1 });

export const Attendance = model<IAttendance>("Attendance", AttendanceSchema);
