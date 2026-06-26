"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";
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
  ProgressBarRoot,
  ProgressBarTrack,
  ProgressBarFill,
  useOverlayState,
} from "@heroui/react";
import { toast } from "sonner";
import {
  HiDocumentArrowUp,
  HiDocumentText,
  HiVideoCamera,
  HiLink,
  HiPhoto,
  HiCodeBracket,
  HiEllipsisVertical,
  HiArrowDownTray,
  HiPencilSquare,
  HiTrash,
  HiXCircle,
  HiArrowPath,
  HiExclamationTriangle,
  HiCloudArrowUp,
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
import { useCourseMaterials } from "@/hooks/api/useCourseMaterials";
import { cn } from "@/lib/utils";
import type { Material, MaterialType, Course } from "@/types/api-response";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MaterialForm {
  title:       string;
  description: string;
  type:        MaterialType;
  url:         string;
  xpReward:    number;
}

const EMPTY_FORM: MaterialForm = {
  title: "", description: "", type: "PDF", url: "", xpReward: 15,
};

// ── Constants ─────────────────────────────────────────────────────────────────

type ChipColor = "success" | "danger" | "warning" | "accent" | "default";

const TYPE_COLOR: Record<MaterialType, ChipColor> = {
  PDF:      "danger",
  VIDEO:    "accent",
  DOCUMENT: "default",
  LINK:     "success",
  IMAGE:    "warning",
  CODE:     "accent",
};

const TYPE_ICON: Record<MaterialType, React.ElementType> = {
  PDF:      HiDocumentText,
  VIDEO:    HiVideoCamera,
  DOCUMENT: HiDocumentText,
  LINK:     HiLink,
  IMAGE:    HiPhoto,
  CODE:     HiCodeBracket,
};

const MATERIAL_TYPES: MaterialType[] = ["PDF", "VIDEO", "DOCUMENT", "LINK", "IMAGE", "CODE"];
const ACCEPTS_FILE:   MaterialType[] = ["PDF", "VIDEO", "DOCUMENT", "IMAGE", "CODE"];

// ── Helpers ───────────────────────────────────────────────────────────────────

const INPUT_CLS =
  "w-full h-10 rounded-md border border-brand-border dark:border-white/10 bg-white dark:bg-slate-800 px-3 text-[13px] text-brand-dark dark:text-white placeholder:text-brand-body/40 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand-blue/40";

const TEXTAREA_CLS =
  "w-full rounded-md border border-brand-border dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2.5 text-[13px] text-brand-dark dark:text-white placeholder:text-brand-body/40 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 resize-none";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtSize(bytes?: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function Field({
  label, htmlFor, children,
}: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-[12px] font-semibold text-brand-body/70 dark:text-white/50 uppercase tracking-wide"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Dropzone ──────────────────────────────────────────────────────────────────

function FileDropzone({
  fileRef,
  file,
  onClear,
}: {
  fileRef: React.RefObject<HTMLInputElement | null>;
  file:    File | null;
  onClear: () => void;
}) {
  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-dashed transition-colors",
        file
          ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50/60 dark:bg-emerald-900/10"
          : "border-brand-border dark:border-white/15 hover:border-brand-blue/50 dark:hover:border-brand-blue/40 bg-brand-bg/50 dark:bg-white/3",
      )}
    >
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={() => {/* handled by parent */}}
        accept=".pdf,.mp4,.doc,.docx,.png,.jpg,.jpeg,.gif,.js,.ts,.py,.java,.c,.cpp,.txt"
      />

      {file ? (
        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <HiDocumentArrowUp size={18} className="text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400 truncate">{file.name}</p>
              <p className="text-[11px] text-emerald-600/70 dark:text-emerald-500/70">{fmtSize(file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-emerald-500 hover:text-red-500 transition-colors"
          >
            <HiXCircle size={18} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full flex flex-col items-center gap-2 py-8 px-4 cursor-pointer"
        >
          <HiCloudArrowUp size={28} className="text-brand-body/30 dark:text-white/20" />
          <p className="text-[13px] font-semibold text-brand-body dark:text-white/60">
            Click to select or drag &amp; drop
          </p>
          <p className="text-[11px] text-brand-body/50 dark:text-white/30">Max 100 MB</p>
        </button>
      )}
    </div>
  );
}

// ── Shared form body ──────────────────────────────────────────────────────────

function MaterialFormBody({
  id,
  form,
  onChange,
  fileRef,
  file,
  onClearFile,
}: {
  id:          string;
  form:        MaterialForm;
  onChange:    (patch: Partial<MaterialForm>) => void;
  fileRef:     React.RefObject<HTMLInputElement | null>;
  file:        File | null;
  onClearFile: () => void;
}) {
  const needsFile = ACCEPTS_FILE.includes(form.type);

  return (
    <div className="space-y-4">
      <Field label="Title" htmlFor={`${id}-title`}>
        <input
          id={`${id}-title`}
          type="text"
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g., Lecture 1: Introduction"
          className={INPUT_CLS}
        />
      </Field>

      <Field label="Description" htmlFor={`${id}-desc`}>
        <textarea
          id={`${id}-desc`}
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Brief description for students"
          rows={3}
          className={TEXTAREA_CLS}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Material Type">
          <Select
            value={form.type}
            onValueChange={(v) => onChange({ type: v as MaterialType })}
          >
            <SelectTrigger className="dark:bg-slate-800 dark:border-white/10 dark:text-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {MATERIAL_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="XP Reward" htmlFor={`${id}-xp`}>
          <input
            id={`${id}-xp`}
            type="number"
            value={form.xpReward}
            min={0}
            max={100}
            onChange={(e) => onChange({ xpReward: Number(e.target.value) })}
            className={INPUT_CLS}
          />
        </Field>
      </div>

      {needsFile ? (
        <Field label="File">
          <FileDropzone fileRef={fileRef} file={file} onClear={onClearFile} />
        </Field>
      ) : (
        <Field label="URL" htmlFor={`${id}-url`}>
          <input
            id={`${id}-url`}
            type="url"
            value={form.url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="https://…"
            className={INPUT_CLS}
          />
        </Field>
      )}
    </div>
  );
}

// ── Upload modal ──────────────────────────────────────────────────────────────

function UploadModal({
  state,
  courseId,
  onUploaded,
}: {
  state:      ReturnType<typeof useOverlayState>;
  courseId:   string;
  onUploaded: (m: Material) => void;
}) {
  const id          = useId();
  const fileRef     = useRef<HTMLInputElement>(null);
  const [form, setForm]           = useState<MaterialForm>(EMPTY_FORM);
  const [file, setFile]           = useState<File | null>(null);
  const [progress, setProgress]   = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (state.isOpen) { setForm(EMPTY_FORM); setFile(null); setProgress(0); }
  }, [state.isOpen]);

  // wire up file input change
  useEffect(() => {
    const el = fileRef.current;
    if (!el) return;
    const handler = () => { if (el.files?.[0]) setFile(el.files[0]); };
    el.addEventListener("change", handler);
    return () => el.removeEventListener("change", handler);
  }, []);

  async function handleUpload() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (ACCEPTS_FILE.includes(form.type) && !file && !form.url) {
      toast.error("Please select a file or provide a URL");
      return;
    }

    setIsUploading(true);
    setProgress(0);

    const tick = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 18 + 4, 92));
    }, 180);

    try {
      await new Promise<void>((res) => setTimeout(res, 2000));
      clearInterval(tick);
      setProgress(100);

      const mock: Material = {
        _id:         crypto.randomUUID(),
        courseId,
        title:       form.title,
        description: form.description,
        type:        form.type,
        url:         form.url || (file ? URL.createObjectURL(file) : "#"),
        fileSize:    file?.size,
        order:       0,
        xpReward:    form.xpReward,
        isPublished: true,
        viewCount:   0,
        createdAt:   new Date().toISOString(),
        updatedAt:   new Date().toISOString(),
      };

      onUploaded(mock);
      toast.success("Material uploaded", { description: form.title, icon: "📁" });
      state.close();
    } catch {
      clearInterval(tick);
      toast.error("Upload failed — please try again");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <ModalRoot state={state}>
      <ModalBackdrop />
      <ModalContainer size="md" placement="center">
        <ModalDialog>
          <ModalHeader className="flex items-center justify-between">
            <ModalHeading className="text-[16px] font-bold">Upload New Material</ModalHeading>
            <ModalCloseTrigger />
          </ModalHeader>

          <ModalBody className="py-5">
            <MaterialFormBody
              id={id}
              form={form}
              onChange={(p) => setForm((f) => ({ ...f, ...p }))}
              fileRef={fileRef}
              file={file}
              onClearFile={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
            />

            {isUploading && (
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[12px] text-brand-body/60 dark:text-white/40">
                  <span>Uploading…</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <ProgressBarRoot value={progress} minValue={0} maxValue={100} aria-label="Upload progress" color="success" size="sm">
                  <ProgressBarTrack>
                    <ProgressBarFill className="transition-all duration-200 ease-linear" />
                  </ProgressBarTrack>
                </ProgressBarRoot>
              </div>
            )}
          </ModalBody>

          <ModalFooter className="gap-2">
            <ModalCloseTrigger>
              <Button variant="outline" size="sm">Cancel</Button>
            </ModalCloseTrigger>
            <Button
              variant="default"
              size="sm"
              onClick={handleUpload}
              disabled={isUploading}
              className="gap-1.5 min-w-[140px]"
            >
              {isUploading ? (
                <><HiArrowPath size={14} className="animate-spin" /> Uploading…</>
              ) : (
                <><HiDocumentArrowUp size={14} /> Upload Material</>
              )}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </ModalRoot>
  );
}

// ── Edit modal ────────────────────────────────────────────────────────────────

function EditModal({
  state,
  target,
  onSaved,
}: {
  state:   ReturnType<typeof useOverlayState>;
  target:  Material | null;
  onSaved: (updated: Material) => void;
}) {
  const id      = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm]   = useState<MaterialForm>(EMPTY_FORM);
  const [file, setFile]   = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (target) {
      setForm({
        title:       target.title,
        description: target.description ?? "",
        type:        target.type,
        url:         target.url,
        xpReward:    target.xpReward,
      });
    }
    setFile(null);
  }, [target]);

  useEffect(() => {
    const el = fileRef.current;
    if (!el) return;
    const h = () => { if (el.files?.[0]) setFile(el.files[0]); };
    el.addEventListener("change", h);
    return () => el.removeEventListener("change", h);
  }, []);

  async function handleSave() {
    if (!form.title.trim() || !target) return;
    setIsSaving(true);
    await new Promise<void>((r) => setTimeout(r, 800));
    onSaved({ ...target, ...form, updatedAt: new Date().toISOString() });
    toast.success("Material updated", { icon: "✏️" });
    setIsSaving(false);
    state.close();
  }

  return (
    <ModalRoot state={state}>
      <ModalBackdrop />
      <ModalContainer size="md" placement="center">
        <ModalDialog>
          <ModalHeader className="flex items-center justify-between">
            <ModalHeading className="text-[16px] font-bold">Edit Material</ModalHeading>
            <ModalCloseTrigger />
          </ModalHeader>
          <ModalBody className="py-5">
            <MaterialFormBody
              id={id}
              form={form}
              onChange={(p) => setForm((f) => ({ ...f, ...p }))}
              fileRef={fileRef}
              file={file}
              onClearFile={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
            />
          </ModalBody>
          <ModalFooter className="gap-2">
            <ModalCloseTrigger>
              <Button variant="outline" size="sm">Cancel</Button>
            </ModalCloseTrigger>
            <Button variant="default" size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5 min-w-[120px]">
              {isSaving ? <><HiArrowPath size={14} className="animate-spin" /> Saving…</> : <><HiPencilSquare size={14} /> Save Changes</>}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </ModalRoot>
  );
}

// ── Delete modal ──────────────────────────────────────────────────────────────

function DeleteModal({
  state,
  target,
  onConfirm,
}: {
  state:     ReturnType<typeof useOverlayState>;
  target:    Material | null;
  onConfirm: (id: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!target) return;
    setIsDeleting(true);
    await new Promise<void>((r) => setTimeout(r, 700));
    onConfirm(target._id);
    toast.success("Material deleted", { icon: "🗑️" });
    setIsDeleting(false);
    state.close();
  }

  return (
    <ModalRoot state={state}>
      <ModalBackdrop />
      <ModalContainer size="sm" placement="center">
        <ModalDialog>
          <ModalHeader className="flex items-center justify-between">
            <ModalHeading className="text-[16px] font-bold">Delete Material</ModalHeading>
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
                  This will permanently remove the material and any associated XP records. This cannot be undone.
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="gap-2">
            <ModalCloseTrigger>
              <Button variant="outline" size="sm">Keep it</Button>
            </ModalCloseTrigger>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-1.5"
            >
              {isDeleting ? <><HiArrowPath size={14} className="animate-spin" /> Deleting…</> : <><HiTrash size={14} /> Delete</>}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </ModalRoot>
  );
}

// ── Materials table ───────────────────────────────────────────────────────────

function MaterialsTable({
  materials,
  isLoading,
  onEdit,
  onDelete,
}: {
  materials: Material[];
  isLoading: boolean;
  onEdit:    (m: Material) => void;
  onDelete:  (m: Material) => void;
}) {
  const TH = "px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-brand-body/60 dark:text-white/40 text-left whitespace-nowrap";
  const TD = "px-4 py-3 text-[13px]";

  function handleAction(key: string | number, material: Material) {
    const k = String(key);
    if (k === "edit")     onEdit(material);
    if (k === "delete")   onDelete(material);
    if (k === "download") {
      const a = document.createElement("a");
      a.href = material.url; a.download = material.title; a.target = "_blank";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      toast.success("Download started", { description: material.title, icon: "⬇️" });
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse px-4 py-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-brand-border/40 dark:bg-white/5" />
        ))}
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <HiDocumentArrowUp size={36} className="text-brand-body/20 dark:text-white/10" />
        <p className="text-[14px] font-semibold text-brand-body dark:text-white/60">No materials yet</p>
        <p className="text-[12px] text-brand-body/50 dark:text-white/30">
          Upload the first material for this course.
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
            <th className={TH}>Type</th>
            <th className={TH}>Size</th>
            <th className={TH}>XP</th>
            <th className={TH}>Uploaded</th>
            <th className={cn(TH, "text-right")}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((m) => {
            const Icon = TYPE_ICON[m.type];
            return (
              <tr
                key={m._id}
                className="border-b border-brand-border/40 dark:border-white/5 hover:bg-brand-bg dark:hover:bg-white/4 transition-colors"
              >
                <td className={TD}>
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className="text-brand-body/50 dark:text-white/35 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-brand-dark dark:text-white truncate max-w-[200px]">{m.title}</p>
                      {m.description && (
                        <p className="text-[11px] text-brand-body/55 dark:text-white/35 truncate max-w-[200px]">{m.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className={TD}>
                  <Chip color={TYPE_COLOR[m.type]} variant="soft" size="sm">
                    {m.type}
                  </Chip>
                </td>
                <td className={cn(TD, "text-brand-body dark:text-white/60 tabular-nums")}>{fmtSize(m.fileSize)}</td>
                <td className={TD}>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">+{m.xpReward} XP</span>
                </td>
                <td className={cn(TD, "text-brand-body dark:text-white/60 whitespace-nowrap")}>{fmtDate(m.createdAt)}</td>
                <td className={cn(TD, "text-right")}>
                  <Dropdown>
                    <DropdownTrigger>
                      <button
                        type="button"
                        className="w-8 h-8 inline-flex items-center justify-center rounded-md text-brand-body/55 dark:text-white/35 hover:text-brand-dark dark:hover:text-white hover:bg-brand-border/50 dark:hover:bg-white/8 transition-colors"
                        aria-label="Material actions"
                      >
                        <HiEllipsisVertical size={17} />
                      </button>
                    </DropdownTrigger>
                    <DropdownPopover>
                      <DropdownMenu onAction={(key) => handleAction(key, m)}>
                        <DropdownItem id="download">
                          <span className="flex items-center gap-2"><HiArrowDownTray size={14} /> Download</span>
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

export default function TeacherMaterialsPage() {
  const { user }                             = useAuth();
  const { courses, isLoading: coursesLoading } = useCourses({ limit: 200 });
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // Filter to this teacher's courses
  const teacherCourses = courses.filter((c: Course) =>
    c.teachers.some((t) =>
      typeof t === "string" ? t === user?._id : t._id === user?._id
    )
  );

  const { materials, isLoading: matsLoading } = useCourseMaterials(selectedCourseId);
  const [localMats, setLocalMats]             = useState<Material[]>([]);

  useEffect(() => { setLocalMats(materials); }, [materials]);

  // Auto-select first course once loaded
  useEffect(() => {
    if (!selectedCourseId && teacherCourses.length > 0) {
      setSelectedCourseId(teacherCourses[0]._id);
    }
  }, [teacherCourses, selectedCourseId]);

  const uploadModal = useOverlayState();
  const editModal   = useOverlayState();
  const deleteModal = useOverlayState();
  const [editTarget, setEditTarget]     = useState<Material | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);

  const openEdit = useCallback((m: Material) => { setEditTarget(m); editModal.open(); }, [editModal]);
  const openDelete = useCallback((m: Material) => { setDeleteTarget(m); deleteModal.open(); }, [deleteModal]);

  const selectedCourse = teacherCourses.find((c) => c._id === selectedCourseId);

  return (
    <div className="max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
            <HiDocumentArrowUp size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-brand-dark dark:text-white tracking-tight">Materials</h1>
        </div>
        <p className="text-[14px] text-brand-body dark:text-white/55 ml-12">
          Upload and manage course materials for your students.
        </p>
      </div>

      {/* ── Course selector + upload button ── */}
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
          <Button variant="default" size="sm" onClick={uploadModal.open} className="gap-1.5 h-10">
            <HiDocumentArrowUp size={15} />
            Upload Material
          </Button>
        )}
      </div>

      {/* ── Materials card ── */}
      {selectedCourseId ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-[15px]">
                {selectedCourse?.title ?? "Materials"}
              </CardTitle>
              <span className="text-[12px] text-brand-body/55 dark:text-white/35">
                {localMats.length} item{localMats.length !== 1 ? "s" : ""}
              </span>
            </div>
          </CardHeader>

          <div className="h-px bg-brand-border dark:bg-white/8" />

          <CardContent className="px-0 pb-4">
            <MaterialsTable
              materials={localMats}
              isLoading={matsLoading}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <HiDocumentArrowUp size={40} className="text-brand-body/20 dark:text-white/10" />
            <p className="text-[15px] font-semibold text-brand-body dark:text-white/60">Select a course to view its materials</p>
          </CardContent>
        </Card>
      )}

      {/* ── Modals ── */}
      <UploadModal
        state={uploadModal}
        courseId={selectedCourseId}
        onUploaded={(m) => setLocalMats((prev) => [m, ...prev])}
      />
      <EditModal
        state={editModal}
        target={editTarget}
        onSaved={(updated) =>
          setLocalMats((prev) => prev.map((m) => (m._id === updated._id ? updated : m)))
        }
      />
      <DeleteModal
        state={deleteModal}
        target={deleteTarget}
        onConfirm={(id) => setLocalMats((prev) => prev.filter((m) => m._id !== id))}
      />
    </div>
  );
}
