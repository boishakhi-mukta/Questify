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

  // ── Computer Science ────────────────────────────────────────────────────────

  {
    title:            "Introduction to Cloud Computing",
    description:      "A comprehensive foundation course covering cloud service models (IaaS, PaaS, SaaS), leading providers (AWS, Azure, GCP), containerisation with Docker, and orchestration with Kubernetes. Students build and deploy a multi-tier web application to the cloud by the end of the semester.",
    shortDescription: "Build and deploy cloud-native applications from scratch.",
    category:         "Computer Science",
    level:            "BACHELOR",
    campus:           "Oslo",
    credits:          5,
    semester:         "Fall 2026",
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
    level:            "MASTERS",
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
    level:            "MASTERS",
    campus:           "Trondheim",
    credits:          7,
    semester:         "Fall 2026",
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
    level:            "BACHELOR",
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
    level:            "BACHELOR",
    campus:           "Trondheim",
    credits:          5,
    semester:         "Fall 2026",
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
    title:            "Natural Language Processing",
    description:      "Explores text preprocessing, language modelling, transformer architectures (BERT, GPT), named entity recognition, sentiment analysis, and retrieval-augmented generation. Students implement an NLP pipeline and fine-tune a pre-trained model on a domain-specific dataset.",
    shortDescription: "Teach machines to understand and generate human language.",
    category:         "Computer Science",
    level:            "MASTERS",
    campus:           "Bergen",
    credits:          7,
    semester:         "Spring 2027",
    estimatedHours:   95,
    isFeatured:       true,
    maxCapacity:      30,
    department:       "CS",
    teacherEmails:    ["j.wilson@university.edu", "e.park@university.edu"],
    metadata: {
      objectives:    ["Implement tokenisation and embeddings", "Fine-tune transformer models", "Build an end-to-end NLP pipeline"],
      prerequisites: ["Machine Learning Fundamentals", "Python proficiency"],
      tags:          ["nlp", "transformers", "bert", "deep-learning"],
    },
  },
  {
    title:            "Blockchain & Distributed Systems",
    description:      "Covers distributed consensus algorithms (Raft, PBFT), smart contract development on Ethereum, decentralised application (dApp) architecture, cryptographic primitives underpinning blockchain, and current enterprise use-cases. A capstone project requires deploying a functioning dApp.",
    shortDescription: "From consensus algorithms to production-ready smart contracts.",
    category:         "Computer Science",
    level:            "MASTERS",
    campus:           "Oslo",
    credits:          5,
    semester:         "Fall 2027",
    estimatedHours:   75,
    isFeatured:       false,
    maxCapacity:      30,
    department:       "CS",
    teacherEmails:    ["s.chen@university.edu"],
    metadata: {
      objectives:    ["Implement consensus protocols", "Write and audit smart contracts", "Deploy a decentralised application"],
      prerequisites: ["Distributed systems basics", "Cryptography fundamentals"],
      tags:          ["blockchain", "ethereum", "smart-contracts", "web3"],
    },
  },

  // ── Business ────────────────────────────────────────────────────────────────

  {
    title:            "Entrepreneurship & Startup Strategy",
    description:      "Guides students through ideation, lean canvas, customer discovery, go-to-market strategy, fundraising fundamentals, and pitch deck construction. Includes guest lectures from Nordic founders and culminates in a live pitch competition judged by local VCs.",
    shortDescription: "Turn your idea into a fundable startup.",
    category:         "Business",
    level:            "BACHELOR",
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
    level:            "MASTERS",
    campus:           "Bergen",
    credits:          5,
    semester:         "Fall 2026",
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
    level:            "MASTERS",
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

  // ── Data Science ────────────────────────────────────────────────────────────

  {
    title:            "Statistical Methods for Data Science",
    description:      "Covers probability theory, hypothesis testing, regression analysis, Bayesian inference, and experimental design. Students apply methods using R and Python, culminating in an independent analysis project on a real-world dataset of their choice.",
    shortDescription: "The mathematical backbone of modern data science.",
    category:         "Data Science",
    level:            "MASTERS",
    campus:           "Bergen",
    credits:          7,
    semester:         "Fall 2026",
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
    title:            "Applied Deep Learning",
    description:      "Hands-on deep learning with PyTorch covering CNNs, RNNs, attention mechanisms, generative models (GANs, VAEs, diffusion), and efficient training at scale. Students reproduce a published paper and submit an original research contribution as a final project.",
    shortDescription: "From foundations to frontier models — build and train deep neural networks.",
    category:         "Data Science",
    level:            "MASTERS",
    campus:           "Oslo",
    credits:          7,
    semester:         "Fall 2027",
    estimatedHours:   110,
    isFeatured:       true,
    maxCapacity:      28,
    department:       "DST",
    teacherEmails:    ["e.park@university.edu", "j.wilson@university.edu"],
    metadata: {
      objectives:    ["Implement CNNs and RNNs from scratch", "Train generative models", "Reproduce a published research result"],
      prerequisites: ["Machine Learning Fundamentals", "Linear Algebra & Applications"],
      tags:          ["deep-learning", "pytorch", "cnn", "generative-ai"],
    },
  },

  // ── Mathematics ─────────────────────────────────────────────────────────────

  {
    title:            "Linear Algebra & Applications",
    description:      "Core linear algebra — vector spaces, linear maps, eigenvalues, singular-value decomposition — with applications to machine learning, computer graphics, and optimisation. Problem sets blend rigorous proof writing with computational implementation.",
    shortDescription: "The linear algebra engineers and data scientists actually use.",
    category:         "Mathematics",
    level:            "BACHELOR",
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
  {
    title:            "Discrete Mathematics & Combinatorics",
    description:      "Covers logic and proof techniques, set theory, graph theory, combinatorics, recurrence relations, and an introduction to number theory. Builds the rigorous mathematical foundation expected of computer science and engineering students.",
    shortDescription: "The mathematical toolkit every computer scientist needs.",
    category:         "Mathematics",
    level:            "BACHELOR",
    campus:           "Oslo",
    credits:          5,
    semester:         "Spring 2027",
    estimatedHours:   60,
    isFeatured:       false,
    maxCapacity:      55,
    department:       "MATH",
    teacherEmails:    ["r.mueller@university.edu"],
    metadata: {
      objectives:    ["Write rigorous mathematical proofs", "Analyse graph structures", "Count combinatorial objects", "Solve recurrences"],
      prerequisites: ["High-school mathematics"],
      tags:          ["discrete-math", "graph-theory", "combinatorics", "proofs"],
    },
  },

  // ── Design ──────────────────────────────────────────────────────────────────

  {
    title:            "UX Research & Prototyping",
    description:      "A hands-on introduction to user-centred design: contextual inquiry, affinity mapping, journey mapping, wireframing, interactive prototyping with Figma, and usability testing. Students conduct a full end-to-end UX project for a real product brief.",
    shortDescription: "Research real users, then design products they love.",
    category:         "Design",
    level:            "BACHELOR",
    campus:           "Oslo",
    credits:          5,
    semester:         "Spring 2026",
    estimatedHours:   65,
    isFeatured:       true,
    maxCapacity:      35,
    department:       "DES",
    teacherEmails:    ["l.kim@university.edu"],
    metadata: {
      objectives:    ["Conduct user interviews and usability tests", "Create journey maps and wireframes", "Build interactive prototypes in Figma"],
      prerequisites: [],
      tags:          ["ux", "figma", "prototyping", "user-research"],
    },
  },
  {
    title:            "Motion Design & Animation",
    description:      "Explores the principles of motion design — timing, easing, staging, anticipation — and applies them using After Effects and Lottie for digital products. Students produce a motion-design system and a branded animation reel for their portfolio.",
    shortDescription: "Bring digital interfaces to life through principled motion.",
    category:         "Design",
    level:            "BACHELOR",
    campus:           "Bergen",
    credits:          5,
    semester:         "Fall 2026",
    estimatedHours:   70,
    isFeatured:       false,
    maxCapacity:      30,
    department:       "DES",
    teacherEmails:    ["l.kim@university.edu"],
    metadata: {
      objectives:    ["Apply the 12 principles of animation", "Create micro-interactions with Lottie", "Deliver a branded animation portfolio piece"],
      prerequisites: ["Basic graphic design familiarity"],
      tags:          ["motion-design", "after-effects", "animation", "lottie"],
    },
  },
  {
    title:            "Design Systems for Products",
    description:      "Covers component-driven design, token architecture, accessibility (WCAG 2.2), Figma component libraries, design-to-code handoff, and versioning design assets. Students build and document a fully accessible design system from scratch.",
    shortDescription: "Build the scalable design foundation behind great products.",
    category:         "Design",
    level:            "MASTERS",
    campus:           "Oslo",
    credits:          7,
    semester:         "Spring 2027",
    estimatedHours:   80,
    isFeatured:       true,
    maxCapacity:      25,
    department:       "DES",
    teacherEmails:    ["l.kim@university.edu", "m.rodriguez@university.edu"],
    metadata: {
      objectives:    ["Architect a token-based design system", "Ensure WCAG 2.2 compliance", "Document and version a component library"],
      prerequisites: ["UX Research & Prototyping"],
      tags:          ["design-systems", "figma", "accessibility", "tokens"],
    },
  },
  {
    title:            "Human-Computer Interaction",
    description:      "Advanced HCI course covering cognitive models (GOMS, KLM), embodied interaction, inclusive design, adaptive interfaces, and critical analysis of emerging interaction paradigms (AR/VR, voice, gesture). Students conduct original HCI research and submit a conference-format paper.",
    shortDescription: "Study how humans and computers interact — then make it better.",
    category:         "Design",
    level:            "MASTERS",
    campus:           "Trondheim",
    credits:          7,
    semester:         "Fall 2027",
    estimatedHours:   90,
    isFeatured:       false,
    maxCapacity:      25,
    department:       "DES",
    teacherEmails:    ["l.kim@university.edu"],
    metadata: {
      objectives:    ["Apply cognitive models to interface evaluation", "Design inclusive, adaptive interfaces", "Conduct and write up original HCI research"],
      prerequisites: ["UX Research & Prototyping", "Basic statistics"],
      tags:          ["hci", "cognitive-models", "inclusive-design", "ar-vr"],
    },
  },

  // ── Engineering ─────────────────────────────────────────────────────────────

  {
    title:            "Software Architecture & Design Patterns",
    description:      "Deep dive into architectural styles (layered, hexagonal, event-driven, microservices), the Gang-of-Four and enterprise patterns, architectural decision records, and quality-attribute trade-off analysis. Students refactor a legacy monolith into a documented target architecture.",
    shortDescription: "Design software systems that last — and evolve gracefully.",
    category:         "Engineering",
    level:            "MASTERS",
    campus:           "Trondheim",
    credits:          7,
    semester:         "Spring 2026",
    estimatedHours:   85,
    isFeatured:       true,
    maxCapacity:      30,
    department:       "ENG",
    teacherEmails:    ["t.berg@university.edu", "s.chen@university.edu"],
    metadata: {
      objectives:    ["Select appropriate architectural styles", "Apply design patterns correctly", "Document architectural decisions with ADRs"],
      prerequisites: ["Full-Stack Web Development or equivalent OOP experience"],
      tags:          ["architecture", "design-patterns", "microservices", "systems-design"],
    },
  },
  {
    title:            "Systems Engineering Principles",
    description:      "Introduction to systems thinking, requirements engineering, functional decomposition, reliability modelling, failure mode analysis (FMEA), and model-based systems engineering (MBSE) using SysML. Includes a group project designing a safety-critical embedded system.",
    shortDescription: "Engineer complex systems that are reliable, safe, and maintainable.",
    category:         "Engineering",
    level:            "BACHELOR",
    campus:           "Bergen",
    credits:          5,
    semester:         "Fall 2026",
    estimatedHours:   70,
    isFeatured:       false,
    maxCapacity:      40,
    department:       "ENG",
    teacherEmails:    ["t.berg@university.edu"],
    metadata: {
      objectives:    ["Write structured requirements", "Perform FMEA on a real system", "Model system behaviour with SysML"],
      prerequisites: ["Basic programming", "Introduction to mathematics"],
      tags:          ["systems-engineering", "requirements", "fmea", "sysml"],
    },
  },
  {
    title:            "Embedded Systems & IoT",
    description:      "Covers bare-metal C programming, RTOS fundamentals (FreeRTOS), sensor interfacing via I2C/SPI/UART, power management, OTA firmware updates, and cloud connectivity with MQTT. Students build and ship a battery-powered IoT device that streams telemetry to a cloud dashboard.",
    shortDescription: "Program hardware and connect it to the cloud.",
    category:         "Engineering",
    level:            "BACHELOR",
    campus:           "Oslo",
    credits:          7,
    semester:         "Spring 2027",
    estimatedHours:   90,
    isFeatured:       false,
    maxCapacity:      30,
    department:       "ENG",
    teacherEmails:    ["t.berg@university.edu"],
    metadata: {
      objectives:    ["Write RTOS tasks in bare-metal C", "Interface sensors over I2C and SPI", "Stream device telemetry to a cloud backend"],
      prerequisites: ["C programming basics", "Basic electronics"],
      tags:          ["embedded", "iot", "freertos", "mqtt", "c"],
    },
  },
  {
    title:            "Quality Assurance & Software Testing",
    description:      "Comprehensive QA course covering test strategy, unit and integration testing (Jest, JUnit), property-based testing, contract testing, performance testing (k6, Gatling), accessibility audits, and chaos engineering. Students build a full test suite for a production codebase.",
    shortDescription: "Ship software you can actually trust.",
    category:         "Engineering",
    level:            "BACHELOR",
    campus:           "Trondheim",
    credits:          5,
    semester:         "Fall 2027",
    estimatedHours:   65,
    isFeatured:       false,
    maxCapacity:      40,
    department:       "ENG",
    teacherEmails:    ["t.berg@university.edu", "j.wilson@university.edu"],
    metadata: {
      objectives:    ["Write unit, integration, and contract tests", "Run performance tests with k6", "Design a quality strategy for a real project"],
      prerequisites: ["Any programming experience"],
      tags:          ["testing", "qa", "jest", "performance", "chaos-engineering"],
    },
  },
  {
    title:            "DevOps & Platform Engineering",
    description:      "End-to-end DevOps practice: Git workflows, CI/CD pipelines (GitHub Actions, ArgoCD), infrastructure as code (Terraform), container orchestration (Kubernetes), observability (Prometheus, Grafana, OpenTelemetry), and platform team organisation. Students build and operate a complete platform for a microservices application.",
    shortDescription: "Build the platforms that developers love to deploy on.",
    category:         "Engineering",
    level:            "BACHELOR",
    campus:           "Bergen",
    credits:          7,
    semester:         "Spring 2027",
    estimatedHours:   100,
    isFeatured:       true,
    maxCapacity:      35,
    department:       "ENG",
    teacherEmails:    ["t.berg@university.edu", "s.chen@university.edu"],
    metadata: {
      objectives:    ["Build CI/CD pipelines with GitHub Actions", "Provision infrastructure with Terraform", "Set up observability with Prometheus and Grafana"],
      prerequisites: ["Introduction to Cloud Computing", "Basic Linux"],
      tags:          ["devops", "kubernetes", "terraform", "cicd", "observability"],
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
    level:            "BACHELOR",
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
    level:            "BACHELOR",
    campus:           "Oslo",
    credits:          3,
    semester:         "Fall 2026",
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

  if (existing) {
    const updated = await Course.findOneAndUpdate(
      { _id: existing._id },
      {
        $set: {
          level:            def.level,
          semester:         def.semester,
          category:         def.category,
          description:      def.description,
          shortDescription: def.shortDescription,
          campus:           def.campus,
          credits:          def.credits,
          estimatedHours:   def.estimatedHours,
          isFeatured:       def.isFeatured,
          maxCapacity:      def.maxCapacity,
          teachers:         teacherIds,
          metadata:         def.metadata,
        },
      },
      { new: true, runValidators: true },
    );
    return { course: updated!, wasCreated: false };
  }

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
  let updated = 0;

  for (const def of defs) {
    const teacherIds = resolveTeachers(def, teachers, demoTeacher);
    const { course, wasCreated } = await upsertCourse(def, teacherIds);
    courses.push(course);
    wasCreated ? created++ : updated++;
  }

  console.log(`   Courses: ${created} created, ${updated} updated`);
  return courses;
}
