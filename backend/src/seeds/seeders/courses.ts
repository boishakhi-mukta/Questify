/**
 * ============================================================================
 * QUESTIFY SEEDER: Courses Seeder
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * populates the database with sample courses and descriptions.
 * 
 * WHY IT EXISTS:
 * Populates lists for dashboard grids and course catalogs.
 * 
 * HOW IT WORKS (Technical Overview):
 * Iterates through mock items, linking them to instructors.
 * ============================================================================
 */

import { Types } from "mongoose";
import { Course } from "@/models/Course";
import type { ICourse, CourseLevel } from "@/models/Course";
import type { IUser } from "@/models/User";

interface CourseDef {
  title:            string;
  description:      string;
  shortDescription: string;
  category:         string;
  level:            CourseLevel;
  campus:           string;
  credits:          number;
  semester:         string;
  estimatedHours:   number;
  isFeatured:       boolean;
  maxCapacity:      number;
  department:       string;
  teacherEmails:    string[];
  metadata: {
    objectives:    string[];
    prerequisites: string[];
    tags:          string[];
  };
}

const COURSE_DATA: CourseDef[] = [
  {
    title:            "Introduction to Cloud Computing",
    description:      "A comprehensive foundation course covering cloud service models (IaaS, PaaS, SaaS), leading providers (AWS, Azure, GCP), containerisation with Docker, and orchestration with Kubernetes. Students build and deploy a multi-tier web application to the cloud by the end of the semester.",
    shortDescription: "Build and deploy cloud-native applications from scratch.",
    category:         "Computer Science",
    level:            "BEGINNER",
    campus:           "Oslo",
    credits:          5,
    semester:         "Autumn 2025",
    estimatedHours:   60,
    isFeatured:       true,
    maxCapacity:      40,
    department:       "CS",
    teacherEmails:    ["s.chen@university.edu"],
    metadata: {
      objectives:    ["Understand cloud service models", "Deploy containers with Docker", "Manage resources on AWS"],
      prerequisites: ["Basic Linux familiarity"],
      tags:          ["cloud", "devops", "aws", "docker"],
    },
  },
  {
    title:            "Machine Learning Fundamentals",
    description:      "Covers supervised and unsupervised learning, neural networks, model evaluation, and practical ML pipelines using scikit-learn and PyTorch. Emphasises real-world datasets and reproducible experimentation through weekly coding labs.",
    shortDescription: "From linear regression to neural networks — theory meets practice.",
    category:         "Computer Science",
    level:            "INTERMEDIATE",
    campus:           "Bergen",
    credits:          7,
    semester:         "Spring 2026",
    estimatedHours:   90,
    isFeatured:       true,
    maxCapacity:      35,
    department:       "CS",
    teacherEmails:    ["j.wilson@university.edu", "s.chen@university.edu"],
    metadata: {
      objectives:    ["Implement core ML algorithms", "Evaluate models with cross-validation", "Build end-to-end pipelines"],
      prerequisites: ["Python proficiency", "Linear algebra basics"],
      tags:          ["ml", "python", "pytorch", "data-science"],
    },
  },
  {
    title:            "Advanced Algorithms & Data Structures",
    description:      "In-depth study of graph algorithms, dynamic programming, amortised analysis, NP-completeness, approximation algorithms, and randomised data structures. Problem sets are competitive-programming style, and two proctored contests count towards the grade.",
    shortDescription: "Competitive-level algorithmic thinking for serious engineers.",
    category:         "Computer Science",
    level:            "ADVANCED",
    campus:           "Trondheim",
    credits:          7,
    semester:         "Autumn 2025",
    estimatedHours:   100,
    isFeatured:       false,
    maxCapacity:      25,
    department:       "CS",
    teacherEmails:    ["j.wilson@university.edu"],
    metadata: {
      objectives:    ["Prove algorithm correctness", "Solve dynamic-programming problems", "Analyse NP-hard problems"],
      prerequisites: ["Discrete mathematics", "Intro data structures", "C++ or Java proficiency"],
      tags:          ["algorithms", "competitive-programming", "graphs", "dp"],
    },
  },
  {
    title:            "Full-Stack Web Development",
    description:      "End-to-end web development with React, Node.js, Express, and MongoDB. Topics include REST API design, authentication with JWT, testing, CI/CD with GitHub Actions, and cloud deployment. Students ship a production-ready full-stack application over 12 weeks.",
    shortDescription: "Ship a full-stack app from design to production.",
    category:         "Computer Science",
    level:            "INTERMEDIATE",
    campus:           "Oslo",
    credits:          7,
    semester:         "Spring 2026",
    estimatedHours:   120,
    isFeatured:       true,
    maxCapacity:      40,
    department:       "CS",
    teacherEmails:    ["s.chen@university.edu", "faculty@demo.com"],
    metadata: {
      objectives:    ["Design RESTful APIs", "Implement JWT authentication", "Write integration tests", "Deploy with CI/CD"],
      prerequisites: ["HTML/CSS/JS basics", "Any server-side language experience"],
      tags:          ["react", "nodejs", "mongodb", "full-stack"],
    },
  },
  {
    title:            "Cybersecurity Fundamentals",
    description:      "Introduces information security principles, common attack vectors (OWASP Top 10, social engineering, network attacks), defensive tools (firewalls, IDS/IPS, SIEM), cryptographic foundations, and compliance frameworks (GDPR, ISO 27001). Includes hands-on labs in a sandboxed environment.",
    shortDescription: "Understand attacks and defences to build secure systems.",
    category:         "Computer Science",
    level:            "BEGINNER",
    campus:           "Trondheim",
    credits:          5,
    semester:         "Autumn 2025",
    estimatedHours:   65,
    isFeatured:       false,
    maxCapacity:      45,
    department:       "ISEC",
    teacherEmails:    ["j.wilson@university.edu"],
    metadata: {
      objectives:    ["Identify common attack vectors", "Apply OWASP best practices", "Configure basic network defences"],
      prerequisites: ["Basic networking concepts"],
      tags:          ["security", "owasp", "cryptography", "networking"],
    },
  },
  {
    title:            "Entrepreneurship & Startup Strategy",
    description:      "Guides students through ideation, lean canvas, customer discovery, go-to-market strategy, fundraising fundamentals, and pitch deck construction. Includes guest lectures from Nordic founders and culminates in a live pitch competition judged by local VCs.",
    shortDescription: "Turn your idea into a fundable startup.",
    category:         "Business",
    level:            "BEGINNER",
    campus:           "Oslo",
    credits:          5,
    semester:         "Spring 2026",
    estimatedHours:   50,
    isFeatured:       true,
    maxCapacity:      50,
    department:       "BUS",
    teacherEmails:    ["m.rodriguez@university.edu"],
    metadata: {
      objectives:    ["Conduct customer interviews", "Build a lean canvas", "Draft a financial model", "Present a pitch"],
      prerequisites: [],
      tags:          ["startup", "business", "entrepreneurship", "pitch"],
    },
  },
  {
    title:            "Data-Driven Business Intelligence",
    description:      "Practical BI course covering SQL, data warehousing concepts, ETL pipelines, dashboard design with Power BI and Tableau, KPI frameworks, and storytelling with data. Students build an end-to-end BI solution for a real client brief from a partner organisation.",
    shortDescription: "Turn raw data into boardroom-ready insights.",
    category:         "Business",
    level:            "INTERMEDIATE",
    campus:           "Bergen",
    credits:          5,
    semester:         "Autumn 2025",
    estimatedHours:   70,
    isFeatured:       true,
    maxCapacity:      40,
    department:       "BUS",
    teacherEmails:    ["a.hassan@university.edu"],
    metadata: {
      objectives:    ["Write complex analytical SQL", "Design star schemas", "Build interactive dashboards"],
      prerequisites: ["Basic Excel / spreadsheet skills", "Introduction to statistics"],
      tags:          ["bi", "sql", "power-bi", "data-analysis"],
    },
  },
  {
    title:            "Product Management Essentials",
    description:      "Covers the product lifecycle from discovery through launch and iteration. Topics include user research, roadmap prioritisation (RICE, WSJF), sprint facilitation, stakeholder communication, metrics (AARRR funnel), and working with engineering and design teams.",
    shortDescription: "Learn to build products users actually want.",
    category:         "Business",
    level:            "INTERMEDIATE",
    campus:           "Oslo",
    credits:          5,
    semester:         "Spring 2026",
    estimatedHours:   55,
    isFeatured:       false,
    maxCapacity:      45,
    department:       "BUS",
    teacherEmails:    ["m.rodriguez@university.edu", "a.hassan@university.edu"],
    metadata: {
      objectives:    ["Conduct user interviews", "Prioritise a product backlog", "Define success metrics", "Facilitate sprints"],
      prerequisites: ["Basic project management concepts"],
      tags:          ["product", "agile", "ux", "strategy"],
    },
  },
  {
    title:            "Statistical Methods for Data Science",
    description:      "Covers probability theory, hypothesis testing, regression analysis, Bayesian inference, and experimental design. Students apply methods using R and Python, culminating in an independent analysis project on a real-world dataset of their choice.",
    shortDescription: "The mathematical backbone of modern data science.",
    category:         "Data Science",
    level:            "INTERMEDIATE",
    campus:           "Bergen",
    credits:          7,
    semester:         "Autumn 2025",
    estimatedHours:   85,
    isFeatured:       false,
    maxCapacity:      35,
    department:       "DST",
    teacherEmails:    ["e.park@university.edu"],
    metadata: {
      objectives:    ["Apply hypothesis testing", "Build regression models", "Design experiments", "Communicate statistical findings"],
      prerequisites: ["Calculus fundamentals", "Basic probability"],
      tags:          ["statistics", "r", "python", "data-science"],
    },
  },
  {
    title:            "Linear Algebra & Applications",
    description:      "Core linear algebra — vector spaces, linear maps, eigenvalues, singular-value decomposition — with applications to machine learning, computer graphics, and optimisation. Problem sets blend rigorous proof writing with computational implementation.",
    shortDescription: "The linear algebra engineers and data scientists actually use.",
    category:         "Mathematics",
    level:            "BEGINNER",
    campus:           "Trondheim",
    credits:          5,
    semester:         "Spring 2026",
    estimatedHours:   60,
    isFeatured:       false,
    maxCapacity:      50,
    department:       "MATH",
    teacherEmails:    ["r.mueller@university.edu"],
    metadata: {
      objectives:    ["Prove vector space properties", "Apply SVD to real problems", "Solve systems of equations", "Implement matrix operations"],
      prerequisites: ["High-school algebra", "Basic calculus"],
      tags:          ["linear-algebra", "math", "ml-foundations"],
    },
  },
];

// Demo-only course used in seed:demo mode
export const DEMO_COURSE_DEFS: CourseDef[] = [
  {
    title:            "[DEMO] Introduction to Programming",
    description:      "A gentle introduction to programming concepts using Python. Covers variables, control flow, functions, and basic data structures. Perfect for absolute beginners with no prior coding experience.",
    shortDescription: "Your very first steps into coding with Python.",
    category:         "Computer Science",
    level:            "BEGINNER",
    campus:           "Oslo",
    credits:          5,
    semester:         "Spring 2026",
    estimatedHours:   40,
    isFeatured:       true,
    maxCapacity:      50,
    department:       "CS",
    teacherEmails:    ["faculty@demo.com"],
    metadata: {
      objectives:    ["Write basic Python programs", "Understand control flow", "Use functions and loops"],
      prerequisites: [],
      tags:          ["python", "beginner", "programming"],
    },
  },
  {
    title:            "[DEMO] Business Communication",
    description:      "Covers professional writing, presentation skills, stakeholder communication, and cross-cultural business etiquette. Students produce a portfolio of business documents and deliver a final presentation to a simulated board.",
    shortDescription: "Communicate like a professional in any business setting.",
    category:         "Business",
    level:            "BEGINNER",
    campus:           "Oslo",
    credits:          3,
    semester:         "Spring 2026",
    estimatedHours:   30,
    isFeatured:       false,
    maxCapacity:      60,
    department:       "BUS",
    teacherEmails:    ["faculty@demo.com"],
    metadata: {
      objectives:    ["Write professional emails and reports", "Deliver effective presentations", "Communicate across cultures"],
      prerequisites: [],
      tags:          ["communication", "business", "presentation"],
    },
  },
];

// ─── Helper ────────────────────────────────────────────────────────────────────

function resolveTeachers(
  def: CourseDef,
  allTeachers: IUser[],
  demoTeacher?: IUser
): Types.ObjectId[] {
  return def.teacherEmails.flatMap((email) => {
    if (email === "faculty@demo.com" && demoTeacher) return [demoTeacher._id as Types.ObjectId];
    const found = allTeachers.find((t) => t.email === email);
    return found ? [found._id as Types.ObjectId] : [];
  });
}

async function upsertCourse(
  def: CourseDef,
  teacherIds: Types.ObjectId[]
): Promise<{ course: ICourse; wasCreated: boolean }> {
  if (teacherIds.length === 0) return Promise.reject(new Error(`No teachers found for course: ${def.title}`));

  const existing = await Course.findOne({ title: def.title });
  if (existing) return { course: existing, wasCreated: false };

  const course = await Course.create({
    title:            def.title,
    description:      def.description,
    shortDescription: def.shortDescription,
    category:         def.category,
    level:            def.level,
    campus:           def.campus,
    credits:          def.credits,
    semester:         def.semester,
    estimatedHours:   def.estimatedHours,
    isFeatured:       def.isFeatured,
    isPublished:      true,
    maxCapacity:      def.maxCapacity,
    averageRating:    0,
    totalReviews:     0,
    enrollmentCount:  0,
    teachers:         teacherIds,
    metadata:         def.metadata,
  });

  return { course, wasCreated: true };
}

// ─── Exports ───────────────────────────────────────────────────────────────────

export async function seedCourses(
  teachers: IUser[],
  demoTeacher?: IUser,
  defs: CourseDef[] = COURSE_DATA
): Promise<ICourse[]> {
  const courses: ICourse[] = [];
  let created = 0;
  let skipped = 0;

  for (const def of defs) {
    const teacherIds = resolveTeachers(def, teachers, demoTeacher);
    const { course, wasCreated } = await upsertCourse(def, teacherIds);
    courses.push(course);
    wasCreated ? created++ : skipped++;
  }

  console.log(`   Courses: ${created} created, ${skipped} skipped`);
  return courses;
}
