import { Types } from "mongoose";
import { Department } from "@/models/Department";
import type { IDepartment } from "@/models/Department";

interface DepartmentDef {
  name: string;
  code: string;
  description: string;
}

const DEPARTMENT_DATA: DepartmentDef[] = [
  {
    name:        "Computer Science",
    code:        "CS",
    description: "Covers algorithms, software engineering, AI/ML, systems programming, and cloud computing.",
  },
  {
    name:        "Business Administration",
    code:        "BUS",
    description: "Entrepreneurship, finance, marketing, strategy, and data-driven management.",
  },
  {
    name:        "Data Science & Statistics",
    code:        "DST",
    description: "Statistical methods, machine learning, data engineering, and applied analytics.",
  },
  {
    name:        "Mathematics",
    code:        "MATH",
    description: "Pure and applied mathematics including linear algebra, calculus, and discrete math.",
  },
  {
    name:        "Information Security",
    code:        "ISEC",
    description: "Cybersecurity, cryptography, compliance frameworks, and secure software development.",
  },
];

export async function seedDepartments(
  heads?: Record<string, Types.ObjectId>
): Promise<IDepartment[]> {
  const results: IDepartment[] = [];
  let created = 0;
  let skipped = 0;

  for (const def of DEPARTMENT_DATA) {
    const existing = await Department.findOne({ code: def.code });

    if (existing) {
      results.push(existing);
      skipped++;
      continue;
    }

    const dept = await Department.create({
      ...def,
      head:     heads?.[def.code],
      isActive: true,
    });

    results.push(dept);
    created++;
  }

  console.log(`   Departments: ${created} created, ${skipped} skipped`);
  return results;
}
