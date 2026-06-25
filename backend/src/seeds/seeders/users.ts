import { User } from "@/models/User";
import type { IUser } from "@/models/User";
import type { UserRole } from "@/types";

// ─── User definitions ──────────────────────────────────────────────────────────

interface UserDef {
  email:      string;
  password:   string;
  firstName:  string;
  lastName:   string;
  role:       UserRole;
  department?: string;
  bio?:       string;
}

const ADMIN_USERS: UserDef[] = [
  {
    email:      "admin@university.edu",
    password:   "AdminPass123!",
    firstName:  "Alex",
    lastName:   "Sterling",
    role:       "admin",
    department: "IT",
    bio:        "Platform administrator and learning strategist.",
  },
  {
    email:      "registrar@university.edu",
    password:   "RegPass123!",
    firstName:  "Jordan",
    lastName:   "Blake",
    role:       "admin",
    department: "IT",
    bio:        "Registrar managing academic records and enrolment operations.",
  },
];

const FACULTY_USERS: UserDef[] = [
  {
    email:      "s.chen@university.edu",
    password:   "FacultyPass123!",
    firstName:  "Sarah",
    lastName:   "Chen",
    role:       "teacher",
    department: "CS",
    bio:        "Specialises in distributed systems and cloud-native architectures.",
  },
  {
    email:      "j.wilson@university.edu",
    password:   "FacultyPass123!",
    firstName:  "James",
    lastName:   "Wilson",
    role:       "teacher",
    department: "CS",
    bio:        "Algorithms researcher and competitive-programming coach.",
  },
  {
    email:      "m.rodriguez@university.edu",
    password:   "FacultyPass123!",
    firstName:  "Maria",
    lastName:   "Rodriguez",
    role:       "teacher",
    department: "BUS",
    bio:        "MBA with 12 years of experience in entrepreneurship education.",
  },
  {
    email:      "a.hassan@university.edu",
    password:   "FacultyPass123!",
    firstName:  "Ahmed",
    lastName:   "Hassan",
    role:       "teacher",
    department: "BUS",
    bio:        "Certified data analyst and business intelligence expert.",
  },
  {
    email:      "e.park@university.edu",
    password:   "FacultyPass123!",
    firstName:  "Emily",
    lastName:   "Park",
    role:       "teacher",
    department: "DST",
    bio:        "Statistical modelling researcher with a focus on Bayesian methods.",
  },
  {
    email:      "r.mueller@university.edu",
    password:   "FacultyPass123!",
    firstName:  "Robert",
    lastName:   "Mueller",
    role:       "teacher",
    department: "MATH",
    bio:        "Applied mathematician specialising in linear algebra and optimisation.",
  },
];

const STUDENT_USERS: UserDef[] = [
  { email: "alice.johnson@student.edu",  password: "StudentPass123!", firstName: "Alice",    lastName: "Johnson",   role: "student", department: "CS" },
  { email: "ben.carter@student.edu",     password: "StudentPass123!", firstName: "Ben",      lastName: "Carter",    role: "student", department: "CS" },
  { email: "carla.reyes@student.edu",    password: "StudentPass123!", firstName: "Carla",    lastName: "Reyes",     role: "student", department: "BUS" },
  { email: "daniel.kim@student.edu",     password: "StudentPass123!", firstName: "Daniel",   lastName: "Kim",       role: "student", department: "CS" },
  { email: "emma.thompson@student.edu",  password: "StudentPass123!", firstName: "Emma",     lastName: "Thompson",  role: "student", department: "DST" },
  { email: "finn.obrien@student.edu",    password: "StudentPass123!", firstName: "Finn",     lastName: "O'Brien",   role: "student", department: "CS" },
  { email: "grace.liu@student.edu",      password: "StudentPass123!", firstName: "Grace",    lastName: "Liu",       role: "student", department: "BUS" },
  { email: "hassan.alrashid@student.edu",password: "StudentPass123!", firstName: "Hassan",   lastName: "Al-Rashid", role: "student", department: "DST" },
  { email: "isabella.costa@student.edu", password: "StudentPass123!", firstName: "Isabella", lastName: "Costa",     role: "student", department: "BUS" },
  { email: "jack.brennan@student.edu",   password: "StudentPass123!", firstName: "Jack",     lastName: "Brennan",   role: "student", department: "CS" },
  { email: "kira.patel@student.edu",     password: "StudentPass123!", firstName: "Kira",     lastName: "Patel",     role: "student", department: "CS" },
  { email: "liam.nakamura@student.edu",  password: "StudentPass123!", firstName: "Liam",     lastName: "Nakamura",  role: "student", department: "MATH" },
  { email: "maya.osei@student.edu",      password: "StudentPass123!", firstName: "Maya",     lastName: "Osei",      role: "student", department: "BUS" },
  { email: "nate.johansson@student.edu", password: "StudentPass123!", firstName: "Nate",     lastName: "Johansson", role: "student", department: "CS" },
  { email: "olivia.fernandez@student.edu",password:"StudentPass123!", firstName: "Olivia",   lastName: "Fernandez", role: "student", department: "DST" },
  { email: "pedro.alves@student.edu",    password: "StudentPass123!", firstName: "Pedro",    lastName: "Alves",     role: "student", department: "CS" },
  { email: "quinn.walsh@student.edu",    password: "StudentPass123!", firstName: "Quinn",    lastName: "Walsh",     role: "student", department: "BUS" },
  { email: "riya.sharma@student.edu",    password: "StudentPass123!", firstName: "Riya",     lastName: "Sharma",    role: "student", department: "DST" },
  { email: "sam.kowalski@student.edu",   password: "StudentPass123!", firstName: "Sam",      lastName: "Kowalski",  role: "student", department: "CS" },
  { email: "tara.mbeki@student.edu",     password: "StudentPass123!", firstName: "Tara",     lastName: "Mbeki",     role: "student", department: "BUS" },
];

const DEMO_USERS: UserDef[] = [
  {
    email:     "student@demo.com",
    password:  "DemoPass123!",
    firstName: "Demo",
    lastName:  "Student",
    role:      "student",
    bio:       "Demo student account for platform walkthroughs.",
  },
  {
    email:     "faculty@demo.com",
    password:  "DemoPass123!",
    firstName: "Demo",
    lastName:  "Faculty",
    role:      "teacher",
    bio:       "Demo faculty account for platform walkthroughs.",
  },
  {
    email:     "admin@demo.com",
    password:  "DemoPass123!",
    firstName: "Demo",
    lastName:  "Admin",
    role:      "admin",
    bio:       "Demo admin account for platform walkthroughs.",
  },
];

// ─── Helper ────────────────────────────────────────────────────────────────────

async function upsertUser(def: UserDef): Promise<{ user: IUser; wasCreated: boolean }> {
  const existing = await User.findOne({ email: def.email.toLowerCase() });
  if (existing) return { user: existing, wasCreated: false };

  // passwordHash receives plain text; the pre-save hook hashes it
  const user = await new User({
    email:          def.email.toLowerCase(),
    firstName:      def.firstName,
    lastName:       def.lastName,
    passwordHash:   def.password,
    role:           def.role,
    emailVerified:  true,
    isActive:       true,
    profile: {
      bio:         def.bio,
      department:  def.department,
      socialLinks: [],
    },
  }).save();

  return { user, wasCreated: true };
}

// ─── Exports ───────────────────────────────────────────────────────────────────

export interface SeededUsers {
  admins:   IUser[];
  teachers: IUser[];
  students: IUser[];
  demo: {
    admin:   IUser;
    teacher: IUser;
    student: IUser;
  };
}

export async function seedUsers(options?: {
  demoOnly?:  boolean;
  adminOnly?: boolean;
}): Promise<SeededUsers> {
  const { demoOnly = false, adminOnly = false } = options ?? {};

  const results = {
    admins:   [] as IUser[],
    teachers: [] as IUser[],
    students: [] as IUser[],
    demo:     {} as SeededUsers["demo"],
  };

  let created = 0;
  let skipped = 0;

  async function process(defs: UserDef[], bucket: IUser[]): Promise<void> {
    for (const def of defs) {
      const { user, wasCreated } = await upsertUser(def);
      bucket.push(user);
      wasCreated ? created++ : skipped++;
    }
  }

  // Demo users are always created
  const demoResults: IUser[] = [];
  await process(DEMO_USERS, demoResults);
  results.demo = {
    admin:   demoResults.find((u) => u.email === "admin@demo.com")!,
    teacher: demoResults.find((u) => u.email === "faculty@demo.com")!,
    student: demoResults.find((u) => u.email === "student@demo.com")!,
  };

  if (!demoOnly) {
    await process(ADMIN_USERS, results.admins);

    if (!adminOnly) {
      await process(FACULTY_USERS, results.teachers);
      await process(STUDENT_USERS, results.students);
    }
  }

  console.log(`   Users: ${created} created, ${skipped} skipped`);
  return results;
}
