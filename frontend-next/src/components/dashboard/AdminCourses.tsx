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
import { seedCourses, nextCourseId, type AdminCourse } from "@/lib/admin-store";

const LEVELS     = ["Bachelor", "Master", "PhD"];
const CAMPUSES   = ["Halden", "Fredrikstad", "Oslo"];
const SEMESTERS  = ["Spring 2025", "Fall 2025", "Spring 2026", "Fall 2026"];
const CATEGORIES = ["Technology", "CS", "Design", "AI", "Cloud", "Testing", "Math", "Business"];

const emptyCourse = (): Omit<AdminCourse, "id"> => ({
  name: "",
  level: "Bachelor",
  campus: "Halden",
  credit: 10,
  semester: "Spring 2025",
  category: "Technology",
});

export default function AdminCourses() {
  const [courses, setCourses] = useState<AdminCourse[]>(seedCourses);
  const [search, setSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);
  const [form, setForm] = useState(emptyCourse());
  const [deleteTarget, setDeleteTarget] = useState<AdminCourse | null>(null);

  // ── Derived list ────────────────────────────────────────
  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.level.toLowerCase().includes(q)
    );
  });

  // ── Helpers ─────────────────────────────────────────────
  function openCreate() {
    setEditingCourse(null);
    setForm(emptyCourse());
    setDialogOpen(true);
  }

  function openEdit(course: AdminCourse) {
    setEditingCourse(course);
    setForm({ name: course.name, level: course.level, campus: course.campus, credit: course.credit, semester: course.semester, category: course.category });
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    if (editingCourse) {
      setCourses((prev) => prev.map((c) => c.id === editingCourse.id ? { ...c, ...form } : c));
    } else {
      setCourses((prev) => [...prev, { id: nextCourseId(prev), ...form }]);
    }
    setDialogOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setCourses((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
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

      {/* Search */}
      <div className="relative max-w-xs">
        <HiMagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-body" />
        <Input
          placeholder="Search by name or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border bg-brand-bg">
                <th className="text-left px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">Course Name</th>
                <th className="text-left px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">Level</th>
                <th className="text-left px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">Category</th>
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
                    key={course.id}
                    className={cn("border-b border-brand-border last:border-0 transition-colors hover:bg-brand-bg/50", i % 2 === 0 ? "bg-white" : "bg-brand-bg/30")}
                  >
                    <td className="px-5 py-3.5 font-semibold text-brand-dark max-w-[260px]">{course.name}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={course.level === "Master" ? "blue" : "default"}>{course.level}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-brand-body">{course.category}</td>
                    <td className="px-5 py-3.5 text-brand-body">{course.credit} ECTS</td>
                    <td className="px-5 py-3.5 text-brand-body">{course.semester}</td>
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
        {filtered.length > 0 && (
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
            {/* Course name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-name">Course Name</Label>
              <Input
                id="c-name"
                placeholder="e.g. Introduction to Web Development"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Level */}
              <div className="flex flex-col gap-1.5">
                <Label>Level</Label>
                <Select value={form.level} onValueChange={(v) => setForm((f) => ({ ...f, level: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Campus */}
              <div className="flex flex-col gap-1.5">
                <Label>Campus</Label>
                <Select value={form.campus} onValueChange={(v) => setForm((f) => ({ ...f, campus: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CAMPUSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Semester */}
              <div className="flex flex-col gap-1.5">
                <Label>Semester</Label>
                <Select value={form.semester} onValueChange={(v) => setForm((f) => ({ ...f, semester: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Credits */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="c-credit">Credits (ECTS)</Label>
                <Input
                  id="c-credit"
                  type="number"
                  min={1}
                  max={60}
                  value={form.credit}
                  onChange={(e) => setForm((f) => ({ ...f, credit: Number(e.target.value) }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={!form.name.trim()}>
              {editingCourse ? "Save Changes" : "Create Course"}
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
              <span className="font-semibold text-brand-dark">{deleteTarget?.name}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
