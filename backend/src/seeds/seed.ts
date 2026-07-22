/**
 * ============================================================================
 * QUESTIFY SEEDER: Master Data Runner
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Wipes the database and loads fresh mock accounts, courses, and badges for testing.
 * 
 * WHY IT EXISTS:
 * Gives developers a populated sandbox database for testing and demos.
 * 
 * HOW IT WORKS (Technical Overview):
 * Connects to MongoDB, wipes tables, and runs individual seeders in sequence.
 * ============================================================================
 */

/**
 * Questify database seed script.
 *
 * Usage:
 *   npm run seed            Full seed (all users, courses, enrolments, etc.)
 *   npm run seed:demo       Demo users + 2 demo courses only
 *   npm run seed:reset      Drop all collections, then run full seed
 *   npm run seed:admin      Admin users only (admin@university.edu, etc.)
 *
 * Safety:
 *   - NO emails are sent during any seed operation
 *   - Production databases require explicit "SEED" confirmation
 *   - All operations are idempotent (safe to run multiple times)
 */

import "dotenv/config";
import mongoose from "mongoose";
import readline from "readline";

import { seedDepartments }  from "./seeders/departments";
import { seedUsers }        from "./seeders/users";
import { seedCourses, DEMO_COURSE_DEFS } from "./seeders/courses";
import { seedEnrollments }  from "./seeders/enrollments";
import { seedMaterials }    from "./seeders/materials";
import { seedAssignments }  from "./seeders/assignments";
import { seedAttendance }   from "./seeders/attendance";
import { seedXP }           from "./seeders/xp";

// ─── CLI flags ─────────────────────────────────────────────────────────────────

const args   = new Set(process.argv.slice(2));
const DEMO   = args.has("--demo");
const RESET  = args.has("--reset");
const ADMIN  = args.has("--admin-only");

// ─── Helpers ───────────────────────────────────────────────────────────────────

// Opens the database connection this script will seed data into.
async function connect(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(uri);
  console.log(`\n✓ Connected: ${uri.replace(/\/\/[^@]+@/, "//***@")}`);
}

// Safety check: if this script is about to run against the live production
// database, it stops and asks whoever is running it to type "SEED" to
// confirm — prevents someone from accidentally wiping/overwriting real data.
async function confirmProduction(): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    process.stdout.write(
      "\n╔══════════════════════════════════════════════════╗\n" +
      "║  ⚠️   PRODUCTION DATABASE DETECTED               ║\n" +
      "║  This will modify live data. NO emails are sent. ║\n" +
      "╚══════════════════════════════════════════════════╝\n" +
      '\nType "SEED" to confirm, or anything else to abort: '
    );
    rl.once("line", (answer) => {
      rl.close();
      resolve(answer.trim() === "SEED");
    });
  });
}

// Empties out every table this script manages, so seeding starts from a
// completely clean slate (used by the --reset flag).
async function dropCollections(): Promise<void> {
  const names = [
    "users", "courses", "enrollments",
    "materials", "assignments", "submissions",
    "attendances", "xps", "departments",
  ];
  for (const name of names) {
    await mongoose.connection.collection(name).deleteMany({});
  }
  console.log("✓ All collections cleared (--reset)");
}

// ─── Seed modes ────────────────────────────────────────────────────────────────

// Populates the database with a complete, realistic dataset: a full roster
// of admins/teachers/students, departments, courses, enrollments, materials,
// assignments, attendance history, and XP — everything needed for a
// fully-working demo or development environment.
async function runFull(): Promise<void> {
  console.log("\n━━━ Full seed ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const { admins, teachers, students, demo } = await seedUsers();
  await seedDepartments({ CS: admins[0]._id, BUS: admins[0]._id });

  const courses = await seedCourses(teachers, demo.teacher);
  const enrollments = await seedEnrollments(students, courses, demo.student);

  const allTeachers = [...teachers, demo.teacher];
  await seedMaterials(courses, allTeachers);
  await seedAssignments(courses);
  await seedAttendance(enrollments, allTeachers, courses);
  await seedXP(enrollments);
}

// A lighter version of the full seed: just the demo accounts and two demo
// courses, for quick local testing without a huge dataset.
async function runDemo(): Promise<void> {
  console.log("\n━━━ Demo seed ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const { demo } = await seedUsers({ demoOnly: true });

  const demoCourses = await seedCourses([], demo.teacher, DEMO_COURSE_DEFS);
  const enrollments = await seedEnrollments([], demoCourses, demo.student, demoCourses);

  await seedMaterials(demoCourses, [demo.teacher]);
  await seedAssignments(demoCourses);
  await seedAttendance(enrollments, [demo.teacher], demoCourses);
  await seedXP(enrollments);
}

// Creates just the admin accounts, nothing else — useful when you only need
// to log in as an admin without a full dataset.
async function runAdminOnly(): Promise<void> {
  console.log("\n━━━ Admin-only seed ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  await seedUsers({ adminOnly: true });
}

// ─── Entry point ───────────────────────────────────────────────────────────────

// The script's entry point: connects to the database, double-checks before
// touching production, optionally wipes existing data, runs whichever seed
// mode was requested (full/demo/admin-only), and prints a summary with the
// login credentials to use afterward.
async function main(): Promise<void> {
  await connect();

  // Production safety gate
  if (process.env.NODE_ENV === "production") {
    const confirmed = await confirmProduction();
    if (!confirmed) {
      console.log("\n✗ Aborted — production seed cancelled.");
      return;
    }
  }

  if (RESET) await dropCollections();

  const start = Date.now();

  if (DEMO)  await runDemo();
  else if (ADMIN) await runAdminOnly();
  else       await runFull();

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓  Seed complete in ${elapsed}s

${ADMIN ? `
  Admin users:
    admin@university.edu        AdminPass123!
    registrar@university.edu    RegPass123!
    admin@demo.com              DemoPass123!
` : `
  Demo accounts  (password: DemoPass123!)
    admin@demo.com
    faculty@demo.com
    student@demo.com

  University accounts
    admin@university.edu        AdminPass123!
    registrar@university.edu    RegPass123!
    s.chen@university.edu       FacultyPass123!
    alice.johnson@student.edu   StudentPass123!
    (+ 5 more faculty, 19 more students)
`}
  NOTE: NO emails were sent during this seed.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main()
  .catch((err: unknown) => {
    console.error("\n✗ Seed failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => mongoose.disconnect());
