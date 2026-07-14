"use client";

/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Teacher Assignments Panel
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Dashboard for teachers to post assignments and deadlines.
 * 
 * WHY IT EXISTS:
 * Central manager for teacher-generated tasks.
 * 
 * HOW IT WORKS (Technical Overview):
 * Direct query loader populating assignments list forms.
 * ============================================================================
 */

import { useState, useEffect, useCallback, useId } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownPopover,
  DropdownMenu,
  DropdownItem,
  ModalRoot,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalHeading,
  ModalBody,
  ModalFooter,
  ModalCloseTrigger,
  useOverlayState,
} from "@heroui/react";
import { toast } from "sonner";
import {
  HiClipboardDocumentList,
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiEllipsisVertical,
  HiArrowPath,
  HiExclamationTriangle,
  HiEye,
  HiUsers,
  HiClock,
  HiCheckCircle,
  HiXCircle,
} from "react-icons/hi2";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/api/useCourses";
import { useCourseAssignments } from "@/hooks/api/useCourseAssignments";
import { cn } from "@/lib/utils";
import type { Assignment, SubmissionType, Course } from "@/types/api-response";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AssignmentForm {
  title:               string;
  description:         string;
  instructions:        string;
  totalPoints:         number;
  submissionType:      SubmissionType;
  dueDate:             string;
  allowLateSubmission: boolean;
  latePenalty:         number;
}

const EMPTY_FORM: AssignmentForm = {
  title:               "",
  description:         "",
  instructions:        "",
  totalPoints:         25,
  submissionType:      "TEXT",
  dueDate:             "",
  allowLateSubmission: false,
  latePenalty:         10,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const INPUT_CLS =
  "w-full h-10 rounded-md border border-brand-border dark:border-white/10 bg-white dark:bg-slate-800 px-3 text-[13px] text-brand-dark dark:text-white placeholder:text-brand-body/40 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand-blue/40";
const TEXTAREA_CLS =
  "w-full rounded-md border border-brand-border dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2.5 text-[13px] text-brand-dark dark:text-white placeholder:text-brand-body/40 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 resize-none";

function fmtDeadline(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

type DueStatus = "overdue" | "today" | "soon" | "upcoming";

function getDueStatus(iso: string): DueStatus {
  if (!iso) return "upcoming";
  const due  = new Date(iso).getTime();
  const now  = Date.now();
  const diff = due - now;
  if (diff < 0)              return "overdue";
  if (diff < 86_400_000)     return "today";
  if (diff < 3 * 86_400_000) return "soon";
  return "upcoming";
}

type ChipColor = "danger" | "warning" | "accent" | "default";

const DUE_COLOR: Record<DueStatus, ChipColor> = {
  overdue:  "danger",
  today:    "warning",
  soon:     "accent",
  upcoming: "default",
};

const DUE_LABEL: Record<DueStatus, string> = {
  overdue:  "Overdue",
  today:    "Due today",
  soon:     "Due soon",
  upcoming: "",
};

const SUB_TYPE_LABELS: Record<SubmissionType, string> = {
  TEXT: "Text",
  FILE: "File",
  LINK: "Link",
  CODE: "Code",
};

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[12px] font-semibold text-brand-body/70 dark:text-white/50 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Assignment form body (shared create / edit) ───────────────────────────────

function AssignmentFormBody({
  id,
  form,
  onChange,
}: {
  id:       string;
  form:     AssignmentForm;
  onChange: (patch: Partial<AssignmentForm>) => void;
}) {
  return (
    <div className="space-y-4">
      <Field label="Assignment Title" htmlFor={`${id}-title`}>
        <input
          id={`${id}-title`}
          type="text"
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g., Assignment 1: Variables and Data Types"
          className={INPUT_CLS}
        />
      </Field>

      <Field label="Description" htmlFor={`${id}-desc`}>
        <textarea
          id={`${id}-desc`}
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Brief summary shown on the assignment card"
          rows={2}
          className={TEXTAREA_CLS}
        />
      </Field>

      <Field label="Instructions" htmlFor={`${id}-instr`}>
        <textarea
          id={`${id}-instr`}
          value={form.instructions}
          onChange={(e) => onChange({ instructions: e.target.value })}
          placeholder="Detailed step-by-step instructions for students"
          rows={4}
          className={TEXTAREA_CLS}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="XP Points" htmlFor={`${id}-pts`}>
          <input
            id={`${id}-pts`}
            type="number"
            value={form.totalPoints}
            min={1}
            max={500}
            onChange={(e) => onChange({ totalPoints: Number(e.target.value) })}
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Submission Type">
          <Select
            value={form.submissionType}
            onValueChange={(v) => onChange({ submissionType: v as SubmissionType })}
          >
            <SelectTrigger className="dark:bg-slate-800 dark:border-white/10 dark:text-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TEXT">Text</SelectItem>
              <SelectItem value="FILE">File Upload</SelectItem>
              <SelectItem value="LINK">URL / Link</SelectItem>
              <SelectItem value="CODE">Code</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Due Date &amp; Time" htmlFor={`${id}-due`}>
        <input
          id={`${id}-due`}
          type="datetime-local"
          value={form.dueDate}
          onChange={(e) => onChange({ dueDate: e.target.value })}
          className={INPUT_CLS}
        />
      </Field>

      {/* Late submission toggle */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.allowLateSubmission}
            onChange={(e) => onChange({ allowLateSubmission: e.target.checked })}
            className="w-4 h-4 rounded border-brand-border dark:border-white/20 accent-brand-blue"
          />
          <span className="text-[13px] font-medium text-brand-dark dark:text-white">
            Allow late submissions
          </span>
        </label>

        {form.allowLateSubmission && (
          <div className="ml-7">
            <Field label="Late penalty (%)" htmlFor={`${id}-penalty`}>
              <input
                id={`${id}-penalty`}
                type="number"
                value={form.latePenalty}
                min={0}
                max={100}
                onChange={(e) => onChange({ latePenalty: Number(e.target.value) })}
                className={cn(INPUT_CLS, "w-32")}
              />
            </Field>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Create / Edit modal ───────────────────────────────────────────────────────

function AssignmentModal({
  state,
  mode,
  target,
  courseId,
  onSaved,
}: {
  state:    ReturnType<typeof useOverlayState>;
  mode:     "create" | "edit";
  target:   Assignment | null;
  courseId: string;
  onSaved:  (a: Assignment) => void;
}) {
  const id              = useId();
  const [form, setForm] = useState<AssignmentForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!state.isOpen) return;
    if (mode === "edit" && target) {
      setForm({
        title:               target.title,
        description:         target.description,
        instructions:        target.instructions ?? "",
        totalPoints:         target.totalPoints,
        submissionType:      target.submissionType,
        dueDate:             target.dueDate ? target.dueDate.slice(0, 16) : "",
        allowLateSubmission: target.allowLateSubmission,
        latePenalty:         target.latePenalty,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [state.isOpen, mode, target]);

  async function handleSave() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!form.dueDate)      { toast.error("Due date is required"); return; }

    setIsSaving(true);
    await new Promise<void>((r) => setTimeout(r, 900));

    const now = new Date().toISOString();
    const saved: Assignment = mode === "edit" && target
      ? { ...target, ...form, dueDate: new Date(form.dueDate).toISOString(), updatedAt: now }
      : {
          _id:                 crypto.randomUUID(),
          courseId,
          title:               form.title,
          description:         form.description,
          instructions:        form.instructions,
          dueDate:             new Date(form.dueDate).toISOString(),
          totalPoints:         form.totalPoints,
          submissionType:      form.submissionType,
          allowLateSubmission: form.allowLateSubmission,
          latePenalty:         form.latePenalty,
          attachments:         [],
          createdAt:           now,
          updatedAt:           now,
        };

    onSaved(saved);
    toast.success(
      mode === "create" ? "Assignment created" : "Assignment updated",
      { description: form.title, icon: mode === "create" ? "✅" : "✏️" },
    );
    setIsSaving(false);
    state.close();
  }

  return (
    <ModalRoot state={state}>
      <ModalBackdrop />
      <ModalContainer size="md" placement="center">
        <ModalDialog>
          <ModalHeader className="flex items-center justify-between">
            <ModalHeading className="text-[16px] font-bold">
              {mode === "create" ? "Create Assignment" : "Edit Assignment"}
            </ModalHeading>
            <ModalCloseTrigger />
          </ModalHeader>

          <ModalBody className="py-5">
            <AssignmentFormBody
              id={id}
              form={form}
              onChange={(p) => setForm((f) => ({ ...f, ...p }))}
            />
          </ModalBody>

          <ModalFooter className="gap-2">
            <ModalCloseTrigger>
              <Button variant="outline" size="sm">Cancel</Button>
            </ModalCloseTrigger>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-1.5 min-w-[140px]"
            >
              {isSaving ? (
                <><HiArrowPath size={14} className="animate-spin" />
                  {mode === "create" ? "Creating…" : "Saving…"}
                </>
              ) : (
                <>{mode === "create" ? <><HiPlus size={14} /> Create</> : <><HiPencilSquare size={14} /> Save Changes</>}</>
              )}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </ModalRoot>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────

function DeleteModal({
  state,
  target,
  onConfirm,
}: {
  state:     ReturnType<typeof useOverlayState>;
  target:    Assignment | null;
  onConfirm: (id: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!target) return;
    setIsDeleting(true);
    await new Promise<void>((r) => setTimeout(r, 700));
    onConfirm(target._id);
    toast.success("Assignment deleted", { icon: "🗑️" });
    setIsDeleting(false);
    state.close();
  }

  return (
    <ModalRoot state={state}>
      <ModalBackdrop />
      <ModalContainer size="sm" placement="center">
        <ModalDialog>
          <ModalHeader className="flex items-center justify-between">
            <ModalHeading className="text-[16px] font-bold">Delete Assignment</ModalHeading>
            <ModalCloseTrigger />
          </ModalHeader>
          <ModalBody className="py-5">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center shrink-0">
                <HiExclamationTriangle size={18} className="text-red-500" />
              </div>
              <div className="space-y-1">
                <p className="text-[14px] font-semibold text-brand-dark dark:text-white">
                  Delete &ldquo;{target?.title}&rdquo;?
                </p>
                <p className="text-[13px] text-brand-body dark:text-white/60">
                  All student submissions for this assignment will also be removed. This cannot be undone.
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="gap-2">
            <ModalCloseTrigger>
              <Button variant="outline" size="sm">Keep it</Button>
            </ModalCloseTrigger>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting} className="gap-1.5">
              {isDeleting ? <><HiArrowPath size={14} className="animate-spin" /> Deleting…</> : <><HiTrash size={14} /> Delete</>}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </ModalRoot>
  );
}

// ── Submissions preview modal ─────────────────────────────────────────────────

function SubmissionsModal({
  state,
  target,
}: {
  state:  ReturnType<typeof useOverlayState>;
  target: Assignment | null;
}) {
  // Simulated submission rows
  const MOCK_SUBMISSIONS = [
    { name: "Alice Johnson",   status: "GRADED",    score: 92, submittedAt: "Jun 24, 9:12 AM" },
    { name: "Bob Martinez",    status: "SUBMITTED",  score: null, submittedAt: "Jun 24, 11:03 AM" },
    { name: "Carol White",     status: "GRADED",    score: 78, submittedAt: "Jun 23, 8:55 PM" },
    { name: "David Chen",      status: "LATE",      score: 65, submittedAt: "Jun 25, 2:30 AM" },
    { name: "Eva Gonzalez",    status: "SUBMITTED",  score: null, submittedAt: "Jun 24, 6:17 PM" },
  ];

  const statusChip = (status: string, score: number | null) => {
    if (status === "GRADED")    return <Chip color="success" variant="soft" size="sm">{score}%</Chip>;
    if (status === "LATE")      return <Chip color="warning" variant="soft" size="sm">Late</Chip>;
    return <Chip color="default" variant="soft" size="sm">Pending review</Chip>;
  };

  const TH = "px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-brand-body/60 dark:text-white/40 text-left";
  const TD = "px-4 py-3 text-[13px]";

  return (
    <ModalRoot state={state}>
      <ModalBackdrop />
      <ModalContainer size="md" placement="center">
        <ModalDialog>
          <ModalHeader className="flex items-center justify-between">
            <div className="space-y-0.5">
              <ModalHeading className="text-[16px] font-bold">Submissions</ModalHeading>
              <p className="text-[12px] text-brand-body/60 dark:text-white/40">{target?.title}</p>
            </div>
            <ModalCloseTrigger />
          </ModalHeader>
          <ModalBody className="py-4">
            <div className="flex gap-4 mb-4">
              {[
                { icon: HiUsers,        label: "Total",    value: MOCK_SUBMISSIONS.length, color: "text-brand-blue" },
                { icon: HiCheckCircle,  label: "Graded",   value: MOCK_SUBMISSIONS.filter(s => s.status === "GRADED").length, color: "text-emerald-500" },
                { icon: HiClock,        label: "Pending",  value: MOCK_SUBMISSIONS.filter(s => s.status === "SUBMITTED").length, color: "text-amber-500" },
                { icon: HiXCircle,      label: "Late",     value: MOCK_SUBMISSIONS.filter(s => s.status === "LATE").length, color: "text-red-500" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex-1 text-center p-2 rounded-lg bg-brand-bg dark:bg-white/4">
                  <Icon size={16} className={cn("mx-auto mb-0.5", color)} />
                  <p className="text-[15px] font-black text-brand-dark dark:text-white">{value}</p>
                  <p className="text-[10px] text-brand-body/55 dark:text-white/35">{label}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto rounded-md border border-brand-border dark:border-white/8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-brand-border dark:border-white/8 bg-brand-bg dark:bg-white/3">
                    <th className={TH}>Student</th>
                    <th className={TH}>Submitted</th>
                    <th className={TH}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_SUBMISSIONS.map((s, i) => (
                    <tr key={i} className="border-b border-brand-border/40 dark:border-white/5 last:border-0">
                      <td className={cn(TD, "font-medium text-brand-dark dark:text-white")}>{s.name}</td>
                      <td className={cn(TD, "text-brand-body dark:text-white/60 text-[12px]")}>{s.submittedAt}</td>
                      <td className={TD}>{statusChip(s.status, s.score)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ModalBody>
          <ModalFooter>
            <ModalCloseTrigger>
              <Button variant="outline" size="sm">Close</Button>
            </ModalCloseTrigger>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </ModalRoot>
  );
}

// ── Assignments table ─────────────────────────────────────────────────────────

function AssignmentsTable({
  assignments,
  isLoading,
  onEdit,
  onDelete,
  onViewSubmissions,
}: {
  assignments:       Assignment[];
  isLoading:         boolean;
  onEdit:            (a: Assignment) => void;
  onDelete:          (a: Assignment) => void;
  onViewSubmissions: (a: Assignment) => void;
}) {
  const TH = "px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-brand-body/60 dark:text-white/40 text-left whitespace-nowrap";
  const TD = "px-4 py-3 text-[13px]";

  const MOCK_SUB_COUNT: Record<string, number> = {};

  function handleAction(key: string | number, a: Assignment) {
    const k = String(key);
    if (k === "edit")        onEdit(a);
    if (k === "delete")      onDelete(a);
    if (k === "submissions") onViewSubmissions(a);
  }

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse px-4 py-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-brand-border/40 dark:bg-white/5" />
        ))}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <HiClipboardDocumentList size={36} className="text-brand-body/20 dark:text-white/10" />
        <p className="text-[14px] font-semibold text-brand-body dark:text-white/60">No assignments yet</p>
        <p className="text-[12px] text-brand-body/50 dark:text-white/30">
          Create the first assignment for this course.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-brand-border dark:border-white/8">
            <th className={TH}>Title</th>
            <th className={TH}>Due Date</th>
            <th className={TH}>Points</th>
            <th className={TH}>Type</th>
            <th className={TH}>Submissions</th>
            <th className={cn(TH, "text-right")}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((a) => {
            const status   = getDueStatus(a.dueDate);
            const subCount = MOCK_SUB_COUNT[a._id] ?? Math.floor(Math.random() * 20);
            return (
              <tr
                key={a._id}
                className="border-b border-brand-border/40 dark:border-white/5 hover:bg-brand-bg dark:hover:bg-white/4 transition-colors"
              >
                <td className={TD}>
                  <div className="min-w-0">
                    <p className="font-semibold text-brand-dark dark:text-white truncate max-w-[220px]">{a.title}</p>
                    {a.description && (
                      <p className="text-[11px] text-brand-body/55 dark:text-white/35 truncate max-w-[220px]">{a.description}</p>
                    )}
                  </div>
                </td>
                <td className={TD}>
                  <div className="space-y-1">
                    <p className="text-[12px] text-brand-body dark:text-white/60 whitespace-nowrap">{fmtDeadline(a.dueDate)}</p>
                    {(status === "overdue" || status === "today" || status === "soon") && (
                      <Chip color={DUE_COLOR[status]} variant="soft" size="sm">
                        {DUE_LABEL[status]}
                      </Chip>
                    )}
                  </div>
                </td>
                <td className={TD}>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {a.totalPoints} XP
                  </span>
                </td>
                <td className={TD}>
                  <Chip color="default" variant="soft" size="sm">
                    {SUB_TYPE_LABELS[a.submissionType]}
                  </Chip>
                </td>
                <td className={TD}>
                  <button
                    type="button"
                    onClick={() => onViewSubmissions(a)}
                    className="flex items-center gap-1.5 text-brand-blue hover:underline font-semibold"
                  >
                    <HiEye size={13} />
                    {subCount} submitted
                  </button>
                </td>
                <td className={cn(TD, "text-right")}>
                  <Dropdown>
                    <DropdownTrigger>
                      <button
                        type="button"
                        className="w-8 h-8 inline-flex items-center justify-center rounded-md text-brand-body/55 dark:text-white/35 hover:text-brand-dark dark:hover:text-white hover:bg-brand-border/50 dark:hover:bg-white/8 transition-colors"
                        aria-label="Assignment actions"
                      >
                        <HiEllipsisVertical size={17} />
                      </button>
                    </DropdownTrigger>
                    <DropdownPopover>
                      <DropdownMenu onAction={(key) => handleAction(key, a)}>
                        <DropdownItem id="submissions">
                          <span className="flex items-center gap-2"><HiEye size={14} /> View Submissions</span>
                        </DropdownItem>
                        <DropdownItem id="edit">
                          <span className="flex items-center gap-2"><HiPencilSquare size={14} /> Edit</span>
                        </DropdownItem>
                        <DropdownItem id="delete" className="text-red-500 dark:text-red-400">
                          <span className="flex items-center gap-2"><HiTrash size={14} /> Delete</span>
                        </DropdownItem>
                      </DropdownMenu>
                    </DropdownPopover>
                  </Dropdown>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TeacherAssignmentsPage() {
  const { user }                               = useAuth();
  const { courses, isLoading: coursesLoading } = useCourses({ limit: 200 });
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const teacherCourses = courses.filter((c: Course) =>
    c.teachers.some((t) =>
      typeof t === "string" ? t === user?._id : t._id === user?._id
    )
  );

  const { assignments, isLoading: asgnLoading } = useCourseAssignments(selectedCourseId);
  const [localAsgns, setLocalAsgns]             = useState<Assignment[]>([]);

  useEffect(() => { setLocalAsgns(assignments); }, [assignments]);
  useEffect(() => {
    if (!selectedCourseId && teacherCourses.length > 0) {
      setSelectedCourseId(teacherCourses[0]._id);
    }
  }, [teacherCourses, selectedCourseId]);

  const createModal  = useOverlayState();
  const editModal    = useOverlayState();
  const deleteModal  = useOverlayState();
  const subsModal    = useOverlayState();

  const [editTarget,   setEditTarget]   = useState<Assignment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null);
  const [subsTarget,   setSubsTarget]   = useState<Assignment | null>(null);

  const openEdit = useCallback((a: Assignment) => { setEditTarget(a);   editModal.open();   }, [editModal]);
  const openDel  = useCallback((a: Assignment) => { setDeleteTarget(a); deleteModal.open(); }, [deleteModal]);
  const openSubs = useCallback((a: Assignment) => { setSubsTarget(a);   subsModal.open();   }, [subsModal]);

  const selectedCourse = teacherCourses.find((c) => c._id === selectedCourseId);

  // Derived stats
  const overdue = localAsgns.filter((a) => getDueStatus(a.dueDate) === "overdue").length;
  const dueToday = localAsgns.filter((a) => getDueStatus(a.dueDate) === "today").length;

  return (
    <div className="max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
            <HiClipboardDocumentList size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-brand-dark dark:text-white tracking-tight">Assignments</h1>
        </div>
        <p className="text-[14px] text-brand-body dark:text-white/55 ml-12">
          Create and manage assignments, track submissions and grades.
        </p>
      </div>

      {/* ── Course selector + create button ── */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div className="w-72">
          <label className="block text-[11px] font-semibold text-brand-body/60 dark:text-white/40 uppercase tracking-wide mb-1.5">
            Course
          </label>
          {coursesLoading ? (
            <div className="h-10 rounded-md bg-brand-border/40 dark:bg-white/5 animate-pulse" />
          ) : (
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="dark:bg-slate-800 dark:border-white/10 dark:text-white">
                <SelectValue placeholder="Select a course…" />
              </SelectTrigger>
              <SelectContent>
                {teacherCourses.map((c) => (
                  <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {selectedCourseId && (
          <Button variant="default" size="sm" onClick={createModal.open} className="gap-1.5 h-10">
            <HiPlus size={15} />
            Create Assignment
          </Button>
        )}
      </div>

      {/* ── Quick stat chips ── */}
      {selectedCourseId && !asgnLoading && localAsgns.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/15">
            <HiClipboardDocumentList size={13} /> {localAsgns.length} total
          </span>
          {overdue > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400">
              <HiClock size={13} /> {overdue} overdue
            </span>
          )}
          {dueToday > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <HiClock size={13} /> {dueToday} due today
            </span>
          )}
        </div>
      )}

      {/* ── Assignments card ── */}
      {selectedCourseId ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-[15px]">{selectedCourse?.title ?? "Assignments"}</CardTitle>
              <span className="text-[12px] text-brand-body/55 dark:text-white/35">
                {localAsgns.length} assignment{localAsgns.length !== 1 ? "s" : ""}
              </span>
            </div>
          </CardHeader>

          <div className="h-px bg-brand-border dark:bg-white/8" />

          <CardContent className="px-0 pb-4">
            <AssignmentsTable
              assignments={localAsgns}
              isLoading={asgnLoading}
              onEdit={openEdit}
              onDelete={openDel}
              onViewSubmissions={openSubs}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <HiClipboardDocumentList size={40} className="text-brand-body/20 dark:text-white/10" />
            <p className="text-[15px] font-semibold text-brand-body dark:text-white/60">
              Select a course to manage its assignments
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Modals ── */}
      <AssignmentModal
        state={createModal}
        mode="create"
        target={null}
        courseId={selectedCourseId}
        onSaved={(a) => setLocalAsgns((prev) => [a, ...prev])}
      />
      <AssignmentModal
        state={editModal}
        mode="edit"
        target={editTarget}
        courseId={selectedCourseId}
        onSaved={(updated) =>
          setLocalAsgns((prev) => prev.map((a) => (a._id === updated._id ? updated : a)))
        }
      />
      <DeleteModal
        state={deleteModal}
        target={deleteTarget}
        onConfirm={(id) => setLocalAsgns((prev) => prev.filter((a) => a._id !== id))}
      />
      <SubmissionsModal state={subsModal} target={subsTarget} />
    </div>
  );
}
