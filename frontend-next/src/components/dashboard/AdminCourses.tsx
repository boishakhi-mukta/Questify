"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: AdminCourses
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * The administration panel list for creating, deleting, and editing course catalogs.
 * 
 * WHY IT EXISTS:
 * Allows administrators to configure courses and assign their instructors.
 * 
 * HOW IT WORKS (Technical Overview):
 * Uses forms and modal overlays interacting with the backend courses REST endpoints.
 * ============================================================================
 */

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
import { useTranslation } from "react-i18next";
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
  "Business",
  "Data Science",
  "Mathematics",
  "Design",
  "Engineering",
];

const DEPARTMENT_SUBJECTS: Record<string, string[]> = {
  "Computer Science": [
    "Introduction to Cloud Computing",
    "Machine Learning Fundamentals",
    "Advanced Algorithms & Data Structures",
    "Full-Stack Web Development",
    "Cybersecurity Fundamentals",
    "Natural Language Processing",
    "Blockchain & Distributed Systems",
    "Database Systems",
    "Operating Systems",
    "Computer Networks",
  ],
  "Business": [
    "Entrepreneurship & Startup Strategy",
    "Data-Driven Business Intelligence",
    "Product Management Essentials",
    "Corporate Finance",
    "Marketing Principles",
    "Strategic Management",
    "Financial Accounting",
    "Operations Management",
    "Business Ethics",
  ],
  "Data Science": [
    "Statistical Methods for Data Science",
    "Applied Deep Learning",
    "Data Engineering & Pipelines",
    "Business Analytics",
    "Data Visualisation",
    "Big Data Technologies",
    "Probabilistic Modelling",
  ],
  "Mathematics": [
    "Linear Algebra & Applications",
    "Discrete Mathematics & Combinatorics",
    "Calculus I",
    "Calculus II",
    "Probability Theory",
    "Numerical Analysis",
    "Mathematical Modelling",
    "Real Analysis",
  ],
  "Design": [
    "UX Research & Prototyping",
    "Motion Design & Animation",
    "Design Systems for Products",
    "Human-Computer Interaction",
    "Graphic Design Fundamentals",
    "Typography & Visual Communication",
    "3D Design & Visualisation",
  ],
  "Engineering": [
    "Software Architecture & Design Patterns",
    "Systems Engineering Principles",
    "Embedded Systems & IoT",
    "Quality Assurance & Software Testing",
    "DevOps & Platform Engineering",
    "Computer Architecture",
    "Signal Processing",
    "Control Systems",
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

// A blank course form, used as the starting point when creating a new course.
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

// The admin "Manage Courses" screen: a searchable table of every course,
// plus dialogs for creating, editing, and deleting one.
export default function AdminCourses() {
  const [search, setSearch] = useState("");
  const { courses, isLoading, error, create, update, remove } = useAdminCourses({ limit: 100 });
  const { t } = useTranslation();

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
  // Opens the dialog with a blank form, ready to create a brand-new course.
  function openCreate() {
    setEditingCourse(null);
    setForm(emptyCourse());
    setFormError(null);
    setDialogOpen(true);
  }

  // Opens the dialog pre-filled with an existing course's details, ready to edit it.
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

  // Saves the form — creates a brand-new course, or updates the one being edited.
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

  // Permanently deletes the course the admin confirmed they want to remove.
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
          <h1 className="text-2xl font-bold text-brand-dark">{t("adminCourses.title")}</h1>
          <p className="text-sm text-brand-body mt-0.5">
            {t("adminCourses.subtitle")}
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <HiPlus size={16} />
          {t("adminCourses.addCourse")}
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
          placeholder={t("adminCourses.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center text-sm text-brand-body">
            {t("adminCourses.loadingCourses")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border bg-brand-bg">
                  <th className="text-left px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">{t("adminCourses.courseName")}</th>
                  <th className="text-left px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">{t("adminCourses.level")}</th>
                  <th className="text-left px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">{t("adminCourses.department")}</th>
                  <th className="text-left px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">{t("adminCourses.credits")}</th>
                  <th className="text-left px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">{t("adminCourses.semester")}</th>
                  <th className="text-right px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">{t("adminCourses.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-brand-body text-sm">
                      {t("adminCourses.noCoursesFound")}
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
                          <Button variant="ghost" size="icon" onClick={() => openEdit(course)} aria-label={t("adminCourses.editCourse")}>
                            <HiPencil size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteTarget(course)}
                            aria-label={t("adminCourses.deleteCourse")}
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
            {t("adminCourses.showing", { count: filtered.length, total: courses.length })}
          </div>
        )}
      </Card>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingCourse ? t("adminCourses.editCourseTitle") : t("adminCourses.addNewCourse")}</DialogTitle>
            <DialogDescription>
              {editingCourse ? t("adminCourses.editCourseDesc") : t("adminCourses.addCourseDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-title">{t("adminCourses.courseTitle")}</Label>
              <Input
                id="c-title"
                placeholder={t("adminCourses.courseTitlePlaceholder")}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-desc">{t("adminCourses.description")}</Label>
              <Input
                id="c-desc"
                placeholder={t("adminCourses.descriptionPlaceholder")}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t("adminCourses.subject")}</Label>
              <div className={!form.category ? "opacity-50 pointer-events-none" : ""}>
                <Select
                  value={form.subject}
                  onValueChange={(v) => setForm((f) => ({ ...f, subject: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={form.category ? t("adminCourses.selectSubject") : t("adminCourses.selectDepartmentFirst")} />
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
                <Label>{t("adminCourses.level")}</Label>
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
                <Label>{t("adminCourses.department")}</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v, subject: "" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>{t("adminCourses.campus")}</Label>
                <Select value={form.campus} onValueChange={(v) => setForm((f) => ({ ...f, campus: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CAMPUSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>{t("adminCourses.semester")}</Label>
                <Select value={form.semester} onValueChange={(v) => setForm((f) => ({ ...f, semester: v }))}>
                  <SelectTrigger><SelectValue placeholder={t("adminCourses.optional")} /></SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="c-credits">{t("adminCourses.credits")} (ECTS)</Label>
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
              <Button variant="secondary" disabled={isSaving}>{t("adminCourses.cancel")}</Button>
            </DialogClose>
            <Button
              onClick={handleSave}
              disabled={isSaving || !form.title.trim() || form.description.trim().length < 10}
            >
              {isSaving ? t("adminCourses.saving") : editingCourse ? t("adminCourses.saveChanges") : t("adminCourses.createCourse")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("adminCourses.deleteCourseTitle")}</DialogTitle>
            <DialogDescription>
              {t("adminCourses.deleteCourseConfirm", { title: deleteTarget?.title ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              {t("adminCourses.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? t("adminCourses.deleting") : t("adminCourses.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
