export interface Course {
  id: number;
  name: string;
  level: string;
  campus: string;
  credit: number;
  semester: string;
  category: string;
}

export const courses: Course[] = [
  { id: 1, name: "Introduction to Web Development", level: "Bachelor", campus: "Halden", credit: 10, semester: "Spring 2025", category: "Technology" },
  { id: 2, name: "Data Structures and Algorithms", level: "Bachelor", campus: "Halden", credit: 10, semester: "Spring 2025", category: "CS" },
  { id: 3, name: "Human-Computer Interaction", level: "Master", campus: "Halden", credit: 10, semester: "Fall 2025", category: "Design" },
  { id: 4, name: "Machine Learning Fundamentals", level: "Master", campus: "Halden", credit: 10, semester: "Spring 2025", category: "AI" },
  { id: 5, name: "Cloud Computing with Azure", level: "Bachelor", campus: "Halden", credit: 10, semester: "Fall 2025", category: "Cloud" },
  { id: 6, name: "Software Quality Assurance", level: "Bachelor", campus: "Halden", credit: 10, semester: "Spring 2025", category: "Testing" },
];
