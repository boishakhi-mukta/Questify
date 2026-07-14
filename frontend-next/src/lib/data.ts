/**
 * ============================================================================
 * QUESTIFY LIBRARY: Mock Layout Data
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Static definitions (FAQ arrays, features) used to fill public layouts.
 * 
 * WHY IT EXISTS:
 * Avoids hardcoding layout details, keeping layouts clean.
 * 
 * HOW IT WORKS (Technical Overview):
 * Exports structured JSON arrays containing marketing content strings.
 * ============================================================================
 */

export interface Course {
  id: number;
  name: string;
  level: string;
  campus: string;
  credit: number;
  semester: string;
  category: string;
  // Enriched fields for search/filter
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  instructor: string;
  rating: number;
  enrollments: number;
  price: number;   // 0 = free
  createdAt: string; // ISO date, used for the "date added" filter
}

export const courses: Course[] = [
  {
    id: 1,
    name: "Introduction to Web Development",
    level: "Bachelor", campus: "Halden", credit: 10, semester: "Spring 2025",
    category: "Technology", difficulty: "Beginner",
    description: "Learn HTML, CSS, and JavaScript fundamentals to build modern web applications from scratch.",
    instructor: "Alice Hansen", rating: 4.5, enrollments: 234, price: 0,
    createdAt: "2025-10-15",
  },
  {
    id: 2,
    name: "Data Structures and Algorithms",
    level: "Bachelor", campus: "Halden", credit: 10, semester: "Spring 2025",
    category: "Computer Science", difficulty: "Intermediate",
    description: "Master essential data structures and algorithm design techniques for efficient problem-solving.",
    instructor: "Bob Eriksen", rating: 4.2, enrollments: 189, price: 0,
    createdAt: "2025-09-20",
  },
  {
    id: 3,
    name: "Human-Computer Interaction",
    level: "Master", campus: "Halden", credit: 10, semester: "Fall 2025",
    category: "Design", difficulty: "Intermediate",
    description: "Explore user research, usability principles, and interface design for human-centred systems.",
    instructor: "Lena Berg", rating: 4.7, enrollments: 156, price: 0,
    createdAt: "2026-02-01",
  },
  {
    id: 4,
    name: "Machine Learning Fundamentals",
    level: "Master", campus: "Halden", credit: 10, semester: "Spring 2025",
    category: "AI & Machine Learning", difficulty: "Advanced",
    description: "Dive into supervised and unsupervised learning, neural networks, and model evaluation techniques.",
    instructor: "Dr. Erik Larsen", rating: 4.8, enrollments: 312, price: 99,
    createdAt: "2025-08-12",
  },
  {
    id: 5,
    name: "Cloud Computing with Azure",
    level: "Bachelor", campus: "Halden", credit: 10, semester: "Fall 2025",
    category: "Cloud Computing", difficulty: "Intermediate",
    description: "Deploy, manage, and scale applications on Microsoft Azure using industry best practices.",
    instructor: "Anna Kristiansen", rating: 4.3, enrollments: 201, price: 149,
    createdAt: "2025-07-30",
  },
  {
    id: 6,
    name: "Software Quality Assurance",
    level: "Bachelor", campus: "Halden", credit: 10, semester: "Spring 2025",
    category: "Quality Assurance", difficulty: "Beginner",
    description: "Learn testing methodologies, automation frameworks, and quality standards for modern software.",
    instructor: "Ola Nordmann", rating: 4.1, enrollments: 98, price: 0,
    createdAt: "2026-06-02",
  },
  {
    id: 7,
    name: "Business Analytics & Data-Driven Decisions",
    level: "Master", campus: "Halden", credit: 10, semester: "Spring 2025",
    category: "Business", difficulty: "Intermediate",
    description: "Apply statistical analysis and data visualisation to solve real-world business challenges.",
    instructor: "Maria Andersen", rating: 4.4, enrollments: 167, price: 79,
    createdAt: "2026-05-10",
  },
  {
    id: 8,
    name: "Advanced React & Next.js",
    level: "Bachelor", campus: "Halden", credit: 10, semester: "Fall 2025",
    category: "Technology", difficulty: "Advanced",
    description: "Build production-grade React apps with Next.js, server components, and modern patterns.",
    instructor: "Thomas Haugen", rating: 4.6, enrollments: 278, price: 129,
    createdAt: "2026-06-10",
  },
  {
    id: 9,
    name: "UI/UX Design Principles",
    level: "Bachelor", campus: "Halden", credit: 10, semester: "Fall 2025",
    category: "Design", difficulty: "Beginner",
    description: "Master visual hierarchy, colour theory, typography, and prototyping for intuitive interfaces.",
    instructor: "Sara Lindberg", rating: 4.3, enrollments: 145, price: 0,
    createdAt: "2026-06-20",
  },
  {
    id: 10,
    name: "Deep Learning & Neural Networks",
    level: "Master", campus: "Halden", credit: 10, semester: "Fall 2025",
    category: "AI & Machine Learning", difficulty: "Advanced",
    description: "Implement convolutional, recurrent, and transformer architectures for complex AI tasks.",
    instructor: "Prof. Anders Holm", rating: 4.9, enrollments: 421, price: 199,
    createdAt: "2025-06-20",
  },
  {
    id: 11,
    name: "DevOps & CI/CD Pipelines",
    level: "Bachelor", campus: "Halden", credit: 10, semester: "Spring 2025",
    category: "Technology", difficulty: "Advanced",
    description: "Automate build, test, and deploy workflows with Docker, GitHub Actions, and Kubernetes.",
    instructor: "Magnus Sørensen", rating: 4.5, enrollments: 189, price: 99,
    createdAt: "2026-04-20",
  },
  {
    id: 12,
    name: "Discrete Mathematics",
    level: "Bachelor", campus: "Halden", credit: 10, semester: "Spring 2025",
    category: "Mathematics", difficulty: "Intermediate",
    description: "Explore logic, sets, graph theory, and combinatorics — the mathematical backbone of computer science.",
    instructor: "Dr. Ingrid Viken", rating: 3.9, enrollments: 87, price: 0,
    createdAt: "2026-03-15",
  },
];

// Derived constants used by filter UI
export const CATEGORIES = [...new Set(courses.map((c) => c.category))].sort();
export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;
export const SEMESTERS = [...new Set(courses.map((c) => c.semester))].sort();
