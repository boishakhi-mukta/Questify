/**
 * ============================================================================
 * QUESTIFY SEEDER: Materials Seeder
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Uploads mock lecture guides, handouts, and video links.
 * 
 * WHY IT EXISTS:
 * Populates the materials drawer for courses page testing.
 * 
 * HOW IT WORKS (Technical Overview):
 * Inserts mock Material documents connected to course IDs.
 * ============================================================================
 */

import { Types } from "mongoose";
import { Material } from "@/models/Material";
import type { MaterialType } from "@/models/Material";
import type { ICourse } from "@/models/Course";
import type { IUser } from "@/models/User";

interface MaterialDef {
  title:       string;
  description: string;
  type:        MaterialType;
  url:         string;
  fileSize:    number;
  xpReward:    number;
}

const CS_MATERIALS: MaterialDef[] = [
  { title: "Course Introduction & Setup Guide",      description: "Welcome packet, environment setup instructions, and grading rubric.",         type: "PDF",      url: "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/",                                                    fileSize: 512_000,   xpReward: 10 },
  { title: "Week 1 — Core Concepts Lecture Slides",  description: "Slide deck covering the foundational theory for week 1.",                     type: "PDF",      url: "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/e921a690079369751bcce3e34da6c6ee_MIT6_0001F16_Lec1.pdf", fileSize: 1_200_000, xpReward: 15 },
  { title: "Getting Started — Video Walkthrough",    description: "30-minute video demonstrating the first lab exercise end-to-end.",            type: "VIDEO",    url: "https://www.youtube.com/watch?v=eWRfhZUzrAc",                                                                                                                   fileSize: 0,         xpReward: 20 },
  { title: "Official Documentation Reference",       description: "Curated links to official documentation and reference pages.",                type: "LINK",     url: "https://developer.mozilla.org/en-US/docs/Web",                                                                                                                  fileSize: 0,         xpReward: 5  },
  { title: "Lab Exercise — Starter Code",            description: "GitHub repository with the starter template for all lab exercises.",          type: "CODE",     url: "https://github.com/jwasham/coding-interview-university",                                                                                                        fileSize: 0,         xpReward: 15 },
  { title: "Mid-Course Review Notes",               description: "Condensed revision notes covering the first half of the course.",             type: "DOCUMENT", url: "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/pages/in-class-questions-and-video-solutions/",          fileSize: 340_000,   xpReward: 15 },
  { title: "Recommended Reading List",              description: "Annotated bibliography of textbooks and papers referenced in lectures.",      type: "DOCUMENT", url: "https://github.com/EbookFoundation/free-programming-books",                                                                                                     fileSize: 150_000,   xpReward: 10 },
];

const BUS_MATERIALS: MaterialDef[] = [
  { title: "Course Syllabus & Assessment Overview",       description: "Full syllabus, assessment breakdown, and attendance policy.",                      type: "PDF",      url: "https://ocw.mit.edu/courses/15-401-finance-theory-i-fall-2008/",                                                fileSize: 420_000, xpReward: 10 },
  { title: "Week 1 — Lecture Deck",                       description: "Keynote slides from the first lecture session.",                                    type: "PDF",      url: "https://ocw.mit.edu/courses/15-401-finance-theory-i-fall-2008/resources/introduction-and-course-overview/",     fileSize: 980_000, xpReward: 15 },
  { title: "Case Study — Airbnb Market Entry",            description: "Harvard-style case study used in week 3 discussion sessions.",                      type: "DOCUMENT", url: "https://en.wikipedia.org/wiki/Airbnb",                                                                           fileSize: 220_000, xpReward: 20 },
  { title: "Industry Data Dashboard",                     description: "Live market data source referenced throughout the course.",                         type: "LINK",     url: "https://www.statista.com",                                                                                       fileSize: 0,       xpReward: 5  },
  { title: "Guest Lecture Recording — Startup Ecosystem", description: "Recorded session with a serial entrepreneur discussing Nordic startup culture.",    type: "VIDEO",    url: "https://www.youtube.com/results?search_query=startup+ecosystem+lecture",                                        fileSize: 0,       xpReward: 20 },
  { title: "Financial Model Template",                    description: "Three-statement financial model template for the final project.",                   type: "DOCUMENT", url: "https://corporatefinanceinstitute.com/resources/financial-modeling/case-study-3-statement-model-template/",     fileSize: 180_000, xpReward: 15 },
];

const DST_MATERIALS: MaterialDef[] = [
  { title: "Statistical Computing with R — Setup",        description: "R and RStudio installation guide with package configuration.",                     type: "PDF",      url: "https://cran.r-project.org/doc/manuals/R-intro.pdf",                                                          fileSize: 350_000, xpReward: 10 },
  { title: "Probability & Distributions Lecture Notes",   description: "Comprehensive notes on probability theory and common distributions.",              type: "PDF",      url: "https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/mit18_05_s22_probability.pdf", fileSize: 820_000, xpReward: 15 },
  { title: "Hypothesis Testing Lab — Dataset",            description: "Real-world dataset and notebook template for the hypothesis testing lab.",         type: "CODE",     url: "https://github.com/rfordatascience/tidytuesday",                                                              fileSize: 0,       xpReward: 20 },
  { title: "Bayesian Inference Overview Video",           description: "45-minute lecture recording introducing Bayesian thinking with worked examples.",  type: "VIDEO",    url: "https://www.youtube.com/results?search_query=bayesian+inference+introduction+lecture",                        fileSize: 0,       xpReward: 20 },
  { title: "R Reference Card",                            description: "Condensed quick-reference card for commonly used R functions and syntax.",         type: "DOCUMENT", url: "https://github.com/rstudio/cheatsheets",                                                                       fileSize: 90_000,  xpReward: 5  },
];

const MATH_MATERIALS: MaterialDef[] = [
  { title: "Linear Algebra — Course Notes (Full)",        description: "Complete lecture notes covering all topics in the course.",                        type: "PDF",      url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",                                       fileSize: 2_100_000, xpReward: 20 },
  { title: "Matrix Operations in NumPy",                  description: "Practical code notebook demonstrating matrix operations using Python/NumPy.",      type: "CODE",     url: "https://numpy.org/doc/stable/reference/routines.linalg.html",                                         fileSize: 0,         xpReward: 15 },
  { title: "SVD Visualisation Tool",                      description: "Interactive web tool for visualising singular-value decomposition.",               type: "LINK",     url: "https://setosa.io/ev/matrix-multiplication/",                                                          fileSize: 0,         xpReward: 10 },
  { title: "Problem Set Solutions — Weeks 1–4",           description: "Annotated solutions to the first four weekly problem sets.",                      type: "PDF",      url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/mit18_06s10_pset1_s10_soln/", fileSize: 680_000,   xpReward: 15 },
];

// Picks which set of sample course materials to use based on the course's
// subject area, so each course gets topically relevant sample content.
function getMaterialPool(category: string): MaterialDef[] {
  if (category === "Data Science" || category === "Statistics") return DST_MATERIALS;
  if (category === "Mathematics") return MATH_MATERIALS;
  if (category === "Business")    return BUS_MATERIALS;
  return CS_MATERIALS;
}

// Fills each sample course with a handful of sample materials (PDFs, videos,
// links, code) so the course pages have realistic-looking content to browse.
export async function seedMaterials(
  courses:  ICourse[],
  teachers: IUser[]
): Promise<number> {
  let created = 0;
  let skipped = 0;

  for (const course of courses) {
    const pool = getMaterialPool(course.category);

    // 2–4 materials per course (cycle through the pool)
    const count = Math.min(pool.length, 2 + (courses.indexOf(course) % 3));

    for (let i = 0; i < count; i++) {
      const def = pool[i % pool.length];

      const exists = await Material.findOne({ courseId: course._id, title: def.title });
      if (exists) { skipped++; continue; }

      const teacher = teachers.find((t) =>
        course.teachers.map(String).includes(t._id.toString())
      ) ?? teachers[0];

      await Material.create({
        courseId:    course._id,
        title:       def.title,
        description: def.description,
        type:        def.type,
        url:         def.url,
        fileSize:    def.fileSize,
        xpReward:    def.xpReward,
        uploadedBy:  teacher._id as Types.ObjectId,
        order:       i,
        isPublished: true,
        views:       Math.floor(Math.random() * 150) + 20,
      });
      created++;
    }
  }

  console.log(`   Materials: ${created} created, ${skipped} skipped`);
  return created;
}
