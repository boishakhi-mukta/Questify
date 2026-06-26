"use client";

import { useState } from "react";
import { HiPlus, HiPencil, HiTrash, HiMagnifyingGlass } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAdminCourses } from "@/hooks/api/useAdminCourses";
import type { Course } from "@/types/api-response";
import type { AdminCreateCoursePayload } from "@/services/api";

const LEVELS     = ["BACHELOR", "MASTERS"] as const;
const LEVEL_LABELS: Record<string, string> = {
  BACHELOR: "Bachelor",
  MASTERS:  "Masters",
};
const CAMPUSES  = ["Halden", "Fredrikstad", "Oslo"];
const SEMESTERS = ["Spring 2025", "Fall 2025", "Spring 2026", "Fall 2026"];
const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Mathematics & Statistics",
  "Natural Sciences",
  "Business Administration",
  "Engineering",
  "Social Sciences",
  "Humanities",
  "Health Sciences",
  "Arts & Design",
  "Law",
  "Economics",
];

const DEPARTMENT_SUBJECTS: Record<string, string[]> = {
  "Computer Science": [
    "Introduction to Computer Science",
    "Data Structures and Algorithms",
    "Computer Networks",
    "Operating Systems",
    "Database Systems",
    "Software Engineering",
    "Artificial Intelligence",
    "Machine Learning",
    "Computer Security",
    "Web Development",
    "Mobile Application Development",
    "Cloud Computing",
  ],
  "Information Technology": [
    "IT Project Management",
    "Systems Analysis and Design",
    "Network Administration",
    "Information Security",
    "Enterprise Systems",
    "Business Intelligence",
    "IT Service Management",
    "Digital Transformation",
  ],
  "Mathematics & Statistics": [
    "Calculus I",
    "Calculus II",
    "Linear Algebra",
    "Probability and Statistics",
    "Discrete Mathematics",
    "Numerical Analysis",
    "Mathematical Modeling",
    "Real Analysis",
  ],
  "Natural Sciences": [
    "Physics I",
    "Physics II",
    "General Chemistry",
    "Organic Chemistry",
    "Biology",
    "Environmental Science",
    "Geology",
    "Astrophysics",
  ],
  "Business Administration": [
    "Business Management",
    "Marketing Principles",
    "Corporate Finance",
    "Financial Accounting",
    "Human Resource Management",
    "Operations Management",
    "Strategic Management",
    "Entrepreneurship",
    "Business Ethics",
  ],
  "Engineering": [
    "Engineering Mathematics",
    "Statics and Dynamics",
    "Thermodynamics",
    "Fluid Mechanics",
    "Electrical Engineering Fundamentals",
    "Civil Engineering Principles",
    "Mechanical Design",
    "Materials Science",
  ],
  "Social Sciences": [
    "Introduction to Sociology",
    "Social Psychology",
    "Political Science",
    "Cultural Anthropology",
    "Social Research Methods",
    "International Relations",
    "Public Policy",
  ],
  "Humanities": [
    "World History",
    "Philosophy",
    "World Literature",
    "Linguistics",
    "Ethics and Moral Theory",
    "Cultural Studies",
    "Comparative Religion",
  ],
  "Health Sciences": [
    "Anatomy and Physiology",
    "Health Informatics",
    "Public Health",
    "Nutrition Science",
    "Epidemiology",
    "Health Policy",
    "Clinical Psychology",
  ],
  "Arts & Design": [
    "Graphic Design",
    "Digital Media Production",
    "Photography",
    "2D and 3D Animation",
    "Interior Design",
    "Fine Arts Studio",
    "Design Thinking",
  ],
  "Law": [
    "Constitutional Law",
    "Criminal Law",
    "Contract Law",
    "International Law",
    "Intellectual Property Law",
    "Corporate Law",
    "Human Rights Law",
  ],
  "Economics": [
    "Microeconomics",
    "Macroeconomics",
    "Development Economics",
    "International Economics",
    "Econometrics",
    "Financial Economics",
    "Behavioral Economics",
  ],
};

type CourseLevel = "BACHELOR" | "MASTERS";

interface CourseForm {
  title:       string;
  description: string;
  subject:     string;
  category:    string;
  level:       CourseLevel;
  campus:      string;
  credits:     number;
  semester:    string;
}

const emptyCourse = (): CourseForm => ({
  title:       "",
  description: "",
  subject:     "",
  category:    "Computer Science",
  level:       "BACHELOR",
  campus:      "Halden",
  credits:     10,
  semester:    "Spring 2025",
});

export default function AdminCourses() {
  const [search, setSearch] = useState("");
  const { courses, isLoading, error, create, update, remove } = useAdminCourses({ limit: 100 });

  // Dialog state
  const [dialogOpen, setDialogOpen]       = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm]                   = useState(emptyCourse());
  const [isSaving, setIsSaving]           = useState(false);
  const [formError, setFormError]         = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting]     = useState(false);

  // ── Derived list ────────────────────────────────────────────────────────────
  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.level.toLowerCase().includes(q)
    );
  });

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function openCreate() {
    setEditingCourse(null);
    setForm(emptyCourse());
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(course: Course) {
    setEditingCourse(course);
    setForm({
      title:       course.title,
      description: course.description,
      subject:     course.shortDescription ?? "",
      category:    course.category,
      level:       course.level as CourseLevel,
      campus:      course.campus,
      credits:     course.credits,
      semester:    course.semester ?? "",
    });
    setFormError(null);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.description.trim()) return;
    setIsSaving(true);
    setFormError(null);
    try {
      const payload: AdminCreateCoursePayload = {
        title:            form.title,
        description:      form.description,
        shortDescription: form.subject || undefined,
        category:         form.category,
        level:            form.level,
        campus:           form.campus,
        credits:          form.credits,
        semester:         form.semester || undefined,
      };
      if (editingCourse) {
        await update(editingCourse._id, payload);
      } else {
        await create(payload);
      }
      setDialogOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save course");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await remove(deleteTarget._id);
      setDeleteTarget(null);
    } catch {
      // error surfaced by hook
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Courses</h1>
          <p className="text-sm text-brand-body mt-0.5">
            Add, update, and remove courses from the platform catalogue.
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <HiPlus size={16} />
          Add Course
        </Button>
      </div>

      {/* API error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-xs">
        <HiMagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-body" />
        <Input
          placeholder="Search by title or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center text-sm text-brand-body">
            Loading courses…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border bg-brand-bg">
                  <th className="text-left px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">Course Name</th>
                  <th className="text-left px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">Level</th>
                  <th className="text-left px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">Department</th>
                  <th className="text-left px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">Credits</th>
                  <th className="text-left px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">Semester</th>
                  <th className="text-right px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-brand-body text-sm">
                      No courses found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((course, i) => (
                    <tr
                      key={course._id}
                      className={cn(
                        "border-b border-brand-border last:border-0 transition-colors hover:bg-brand-bg/50",
                        i % 2 === 0 ? "bg-white" : "bg-brand-bg/30"
                      )}
                    >
                      <td className="px-5 py-3.5 font-semibold text-brand-dark max-w-[260px]">{course.title}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={course.level === "MASTERS" ? "blue" : "default"}>
                          {LEVEL_LABELS[course.level] ?? course.level}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-brand-body">{course.category}</td>
                      <td className="px-5 py-3.5 text-brand-body">{course.credits} ECTS</td>
                      <td className="px-5 py-3.5 text-brand-body">{course.semester ?? "—"}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(course)} aria-label="Edit course">
                            <HiPencil size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteTarget(course)}
                            aria-label="Delete course"
                          >
                            <HiTrash size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-brand-border bg-brand-bg/30 text-[12px] text-brand-body">
            Showing {filtered.length} of {courses.length} courses
          </div>
        )}
      </Card>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
            <DialogDescription>
              {editingCourse ? "Update the course details below." : "Fill in the details to create a new course."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-title">Course Title</Label>
              <Input
                id="c-title"
                placeholder="e.g. Introduction to Web Development"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-desc">Description</Label>
              <Input
                id="c-desc"
                placeholder="Brief course description (min 10 chars)"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Subject</Label>
              <div className={!form.category ? "opacity-50 pointer-events-none" : ""}>
                <Select
                  value={form.subject}
                  onValueChange={(v) => setForm((f) => ({ ...f, subject: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={form.category ? "Select a subject" : "Select a department first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(DEPARTMENT_SUBJECTS[form.category] ?? []).map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Level</Label>
                <Select value={form.level} onValueChange={(v) => setForm((f) => ({ ...f, level: v as CourseLevel }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>{LEVEL_LABELS[l]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Department</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v, subject: "" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Campus</Label>
                <Select value={form.campus} onValueChange={(v) => setForm((f) => ({ ...f, campus: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CAMPUSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Semester</Label>
                <Select value={form.semester} onValueChange={(v) => setForm((f) => ({ ...f, semester: v }))}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="c-credits">Credits (ECTS)</Label>
                <Input
                  id="c-credits"
                  type="number"
                  min={1}
                  max={60}
                  value={form.credits}
                  onChange={(e) => setForm((f) => ({ ...f, credits: Number(e.target.value) }))}
                />
              </div>
            </div>

            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" disabled={isSaving}>Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleSave}
              disabled={isSaving || !form.title.trim() || form.description.trim().length < 10}
            >
              {isSaving ? "Saving…" : editingCourse ? "Save Changes" : "Create Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-brand-dark">{deleteTarget?.title}</span>?
              This will also remove all related enrollments, materials, and submissions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
