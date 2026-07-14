/**
 * ============================================================================
 * QUESTIFY SEEDER: Assignments Seeder
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Adds sample homework items, deadlines, and point rewards to seeded courses.
 * 
 * WHY IT EXISTS:
 * Populates dashboards with tasks for student and grading flows.
 * 
 * HOW IT WORKS (Technical Overview):
 * References seeded course IDs to create matching assignment collections.
 * ============================================================================
 */

import { Assignment } from "@/models/Assignment";
import type { IAssignment, SubmissionType } from "@/models/Assignment";
import type { ICourse } from "@/models/Course";

interface AssignmentDef {
  title:               string;
  description:         string;
  instructions:        string;
  submissionType:      SubmissionType;
  totalPoints:         number;
  dueDaysFromNow:      number;
  allowLateSubmission: boolean;
  latePenalty:         number;
}

const CS_ASSIGNMENTS: AssignmentDef[] = [
  {
    title:               "Lab 1 — Environment Setup & Hello World",
    description:         "Set up your development environment and complete the provided Hello World exercise. Submit a screenshot of your running application alongside annotated source code.",
    instructions:        "1. Install all required tools listed in the setup guide.\n2. Clone the starter repo.\n3. Run the Hello World program.\n4. Submit a screenshot + the source file.\nMinimum documentation: one comment per non-trivial block.",
    submissionType:      "TEXT",
    totalPoints:         50,
    dueDaysFromNow:      14,
    allowLateSubmission: true,
    latePenalty:         20,
  },
  {
    title:               "Assignment 1 — Core Concepts",
    description:         "Answer the theoretical questions and implement the small practical exercise described in the assignment sheet. Your written answers must reference at least two primary sources.",
    instructions:        "Part A (40 pts): Written answers — answer all five questions in no more than 300 words each.\nPart B (60 pts): Implementation — complete the coding task, include tests.\nCite sources using IEEE format.",
    submissionType:      "TEXT",
    totalPoints:         100,
    dueDaysFromNow:      28,
    allowLateSubmission: true,
    latePenalty:         15,
  },
  {
    title:               "Midterm Project — Design Document",
    description:         "Submit a 4–6 page technical design document for your final project. The document must cover architecture, component breakdown, data flow diagrams, and risk assessment.",
    instructions:        "Use the provided template. Sections required: 1) Executive Summary, 2) System Architecture, 3) Component Design, 4) Data Flow Diagram, 5) Risks & Mitigations.\nPage limit: 6 pages excluding diagrams.",
    submissionType:      "FILE",
    totalPoints:         150,
    dueDaysFromNow:      45,
    allowLateSubmission: false,
    latePenalty:         0,
  },
  {
    title:               "Final Project — Complete Implementation",
    description:         "Build and deploy the final project described in the course specification. Include a 2-page technical report covering architecture decisions, challenges, and how you resolved them.",
    instructions:        "Deliverables:\n1. Source code (GitHub link)\n2. Deployed URL\n3. 2-page technical report (PDF)\n4. 5-minute demo video\nAll four deliverables must be submitted to receive full marks.",
    submissionType:      "FILE",
    totalPoints:         200,
    dueDaysFromNow:      75,
    allowLateSubmission: false,
    latePenalty:         0,
  },
  {
    title:               "Peer Code Review",
    description:         "Review two of your peers' Lab 1 submissions using the provided rubric. Submit your structured feedback via the course portal. Constructive, specific comments earn full marks.",
    instructions:        "Use the official review rubric. Each review must:\n- Identify at least 2 strengths\n- Identify at least 2 areas for improvement\n- Provide specific, actionable suggestions\n- Be written respectfully and constructively",
    submissionType:      "TEXT",
    totalPoints:         50,
    dueDaysFromNow:      21,
    allowLateSubmission: true,
    latePenalty:         10,
  },
];

const BUS_ASSIGNMENTS: AssignmentDef[] = [
  {
    title:               "Customer Discovery Interview Summary",
    description:         "Conduct at least three customer discovery interviews and produce a structured summary covering the problem statement, key insights, and proposed next steps.",
    instructions:        "Submit:\n1. Summary document (500–800 words)\n2. Anonymised interview transcripts or audio recordings\n3. Insight mapping worksheet (template provided)\nAll three components must be present for marking.",
    submissionType:      "FILE",
    totalPoints:         100,
    dueDaysFromNow:      21,
    allowLateSubmission: true,
    latePenalty:         15,
  },
  {
    title:               "Lean Canvas Workshop Submission",
    description:         "Complete the lean canvas for your chosen business idea. Each of the nine boxes must contain at least two concrete, validated items. Bring a printed copy to the in-class workshop.",
    instructions:        "Use the Lean Canvas template provided in the course materials.\nFor each box, provide:\n- Minimum 2 validated items\n- Evidence or rationale for each item\n- Source (interview, secondary research, etc.)",
    submissionType:      "TEXT",
    totalPoints:         80,
    dueDaysFromNow:      35,
    allowLateSubmission: true,
    latePenalty:         10,
  },
  {
    title:               "Go-to-Market Strategy Report",
    description:         "Write a 1 500-word go-to-market strategy document covering target segment, value proposition, channel strategy, pricing model, and 90-day launch plan. Cite at least five market data sources.",
    instructions:        "Word count: 1 400–1 600 words (excl. references).\nRequired sections:\n1. Target Segment\n2. Value Proposition\n3. Channel Strategy\n4. Pricing Model\n5. 90-Day Launch Plan\nMinimum 5 citations (Statista, Bloomberg, etc.)",
    submissionType:      "FILE",
    totalPoints:         150,
    dueDaysFromNow:      56,
    allowLateSubmission: false,
    latePenalty:         0,
  },
  {
    title:               "Case Study Analysis",
    description:         "Analyse the provided case study using the strategic frameworks discussed in weeks 3–5. Your written response must apply at minimum two frameworks and propose a concrete recommendation.",
    instructions:        "Length: 800–1000 words.\nApply at least two frameworks from: SWOT, Porter's Five Forces, PESTLE, BCG Matrix, Value Chain.\nConclude with a recommendation that a real board could act on.\nWord count strictly enforced.",
    submissionType:      "TEXT",
    totalPoints:         100,
    dueDaysFromNow:      42,
    allowLateSubmission: true,
    latePenalty:         20,
  },
];

const DST_ASSIGNMENTS: AssignmentDef[] = [
  {
    title:               "Exploratory Data Analysis — Lab 1",
    description:         "Perform a full exploratory data analysis on the provided dataset using R or Python. Produce a report summarising distributions, outliers, missing values, and preliminary insights.",
    instructions:        "Use the dataset from the course portal.\nRequired:\n1. Summary statistics table\n2. At least 5 visualisations (histograms, box plots, scatter plots)\n3. Outlier analysis\n4. Written interpretation (300–500 words)\nSubmit as a Jupyter notebook or R Markdown file.",
    submissionType:      "FILE",
    totalPoints:         100,
    dueDaysFromNow:      21,
    allowLateSubmission: true,
    latePenalty:         15,
  },
  {
    title:               "Hypothesis Testing Report",
    description:         "Design and execute a hypothesis test on a dataset of your choice. The report must clearly state null/alternative hypotheses, justify the chosen test, present results, and interpret findings.",
    instructions:        "Report length: 600–900 words.\nMust include:\n1. Research question\n2. Null and alternative hypotheses\n3. Test selection justification\n4. Statistical output (p-value, confidence interval)\n5. Plain-English interpretation\nAttach code as an appendix.",
    submissionType:      "FILE",
    totalPoints:         120,
    dueDaysFromNow:      42,
    allowLateSubmission: false,
    latePenalty:         0,
  },
  {
    title:               "Regression Modelling Assignment",
    description:         "Build, evaluate, and interpret a regression model on the provided dataset. Compare at least two models using appropriate metrics and justify your final model choice.",
    instructions:        "Deliverables:\n1. Model code (R or Python)\n2. Evaluation table (R², RMSE, MAE for each model)\n3. Residual diagnostics plots\n4. Written discussion (400–600 words)\nUse cross-validation for all models.",
    submissionType:      "FILE",
    totalPoints:         150,
    dueDaysFromNow:      60,
    allowLateSubmission: true,
    latePenalty:         10,
  },
];

const MATH_ASSIGNMENTS: AssignmentDef[] = [
  {
    title:               "Problem Set 1 — Vector Spaces",
    description:         "Complete the ten proof-based problems on vector spaces, subspaces, linear independence, and spanning sets. Show all working; unsupported answers receive zero marks.",
    instructions:        "All answers must be typeset in LaTeX or submitted as a neatly handwritten PDF scan.\nProve each statement from first principles unless otherwise stated.\nPartial credit available for correct methods with arithmetic errors.",
    submissionType:      "FILE",
    totalPoints:         100,
    dueDaysFromNow:      14,
    allowLateSubmission: true,
    latePenalty:         20,
  },
  {
    title:               "Problem Set 2 — Eigenvalues & Eigenvectors",
    description:         "Twelve problems covering characteristic polynomials, diagonalisation, and applications to differential equations. Includes both computation and proof problems.",
    instructions:        "Sections A–C must be attempted in full.\nFor Section D (bonus, 20 pts): provide rigorous proofs.\nNumerical answers should be exact (fractions, surds) unless stated otherwise.",
    submissionType:      "FILE",
    totalPoints:         120,
    dueDaysFromNow:      35,
    allowLateSubmission: false,
    latePenalty:         0,
  },
  {
    title:               "Computational Lab — SVD Applications",
    description:         "Use NumPy to implement SVD-based image compression and a basic recommender system. Write a short report comparing compression ratios and reconstruction quality at different ranks.",
    instructions:        "Submit a Jupyter notebook with:\n1. Image compression implementation (compare ranks 5, 20, 50)\n2. Recommender system on the provided ratings matrix\n3. Written discussion (250–400 words)\nCode must run end-to-end without errors.",
    submissionType:      "FILE",
    totalPoints:         100,
    dueDaysFromNow:      49,
    allowLateSubmission: true,
    latePenalty:         10,
  },
];

function getAssignmentPool(category: string): AssignmentDef[] {
  if (category === "Data Science" || category === "Statistics") return DST_ASSIGNMENTS;
  if (category === "Mathematics") return MATH_ASSIGNMENTS;
  if (category === "Business")    return BUS_ASSIGNMENTS;
  return CS_ASSIGNMENTS;
}

function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * 86_400_000);
}

export async function seedAssignments(courses: ICourse[]): Promise<IAssignment[]> {
  const all: IAssignment[] = [];
  let created = 0;
  let skipped = 0;

  for (const course of courses) {
    const pool = getAssignmentPool(course.category);
    // 2–3 assignments per course
    const count = Math.min(pool.length, 2 + (courses.indexOf(course) % 2));

    for (let i = 0; i < count; i++) {
      const def = pool[i];

      const exists = await Assignment.findOne({ courseId: course._id, title: def.title });
      if (exists) {
        all.push(exists as unknown as IAssignment);
        skipped++;
        continue;
      }

      const assignment = await Assignment.create({
        courseId:            course._id,
        title:               def.title,
        description:         def.description,
        instructions:        def.instructions,
        submissionType:      def.submissionType,
        totalPoints:         def.totalPoints,
        dueDate:             daysFromNow(def.dueDaysFromNow),
        allowLateSubmission: def.allowLateSubmission,
        latePenalty:         def.latePenalty,
      });

      all.push(assignment as unknown as IAssignment);
      created++;
    }
  }

  console.log(`   Assignments: ${created} created, ${skipped} skipped`);
  return all;
}
