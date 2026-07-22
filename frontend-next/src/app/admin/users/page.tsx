"use client";

/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Admin Users Directory
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Page list where admins add, update, and toggle user roles.
 * 
 * WHY IT EXISTS:
 * Gateway to manage user credentials and configurations.
 * 
 * HOW IT WORKS (Technical Overview):
 * Wrapper page launching AdminUsers components.
 * ============================================================================
 */

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Chip,
  Skeleton,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Dropdown,
  DropdownTrigger,
  DropdownPopover,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalHeading,
  ModalBody,
  ModalFooter,
  ModalCloseTrigger,
  useOverlayState,
  Alert,
  AlertIndicator,
  AlertContent,
  AlertTitle,
  AlertDescription,
} from "@heroui/react";
import {
  HiEllipsisVertical,
  HiMagnifyingGlass,
  HiXMark,
  HiExclamationTriangle,
  HiArrowPath,
  HiCheckCircle,
  HiShieldCheck,
  HiUserCircle,
  HiAcademicCap,
  HiChevronLeft,
  HiChevronRight,
  HiUser,
  HiKey,
} from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { useAdminUsers } from "@/hooks/api/useAdminUsers";
import type { User, UserRole } from "@/types/api-response";
import type {
  AdminCreateUserPayload,
  AdminUpdateUserPayload,
} from "@/services/api";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

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

type RoleFilter = "all" | UserRole;

const ROLE_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: "all",     label: "All Roles"  },
  { value: "student", label: "Student"    },
  { value: "teacher", label: "Faculty"    },
  { value: "admin",   label: "Admin"      },
];

const ROLE_CHIP_COLOR: Record<UserRole, "danger" | "warning" | "default"> = {
  admin:   "danger",
  teacher: "warning",
  student: "default",
};

const ROLE_ICON: Record<UserRole, React.ElementType> = {
  admin:   HiShieldCheck,
  teacher: HiAcademicCap,
  student: HiUserCircle,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Builds a two-letter avatar fallback from a first and last name (e.g. "JD").
function initials(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

// Turns a raw date string into a short, friendly format (e.g. "Jun 12, 2026").
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });
}

// ─── Divider ─────────────────────────────────────────────────────────────────

// A thin horizontal separator line.
function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-brand-border", className)} />;
}

// ─── Form field ──────────────────────────────────────────────────────────────

// A labeled form field wrapper — puts a label above whatever input is passed
// in, and shows a validation error message below it if there is one.
function FormField({
  label,
  error,
  children,
}: {
  label:    string;
  error?:   string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-brand-body uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && <p className="text-[13px] text-red-500">{error}</p>}
    </div>
  );
}

const INPUT_CLS =
  "w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-dark placeholder:text-brand-body/50 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-colors disabled:opacity-50";

const SELECT_CLS =
  "w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-colors";

// ─── Filter Select ────────────────────────────────────────────────────────────

// A simple styled dropdown built on the browser's native <select>.
function NativeSelect({
  value,
  onChange,
  options,
  className,
}: {
  value:    string;
  onChange: (v: string) => void;
  options:  { value: string; label: string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(SELECT_CLS, className)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ─── User form modal ──────────────────────────────────────────────────────────

interface UserFormData {
  firstName:  string;
  lastName:   string;
  email:      string;
  role:       "student" | "teacher" | "admin";
  department: string;
  isActive:   boolean;
}

const DEFAULT_FORM: UserFormData = {
  firstName:  "",
  lastName:   "",
  email:      "",
  role:       "student",
  department: "",
  isActive:   true,
};

// The popup form for creating a brand-new user or editing an existing one
// (the same form handles both, switching behavior based on `mode`).
function UserFormModal({
  isOpen,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
}: {
  isOpen:      boolean;
  onOpenChange: (open: boolean) => void;
  mode:        "create" | "edit";
  initialData?: Partial<UserFormData>;
  onSubmit:    (data: UserFormData) => Promise<void>;
}) {
  const [form,       setForm]       = useState<UserFormData>({ ...DEFAULT_FORM, ...initialData });
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [errors,     setErrors]     = useState<Partial<Record<keyof UserFormData, string>>>({});

  useEffect(() => {
    if (isOpen) {
      setForm({ ...DEFAULT_FORM, ...initialData });
      setError(null);
      setErrors({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Updates one field of the form and clears any error shown for that field.
  function patch(key: keyof UserFormData, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  // Checks that required fields are filled in and the email looks valid.
  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.lastName.trim())  errs.lastName  = "Required";
    if (!form.email.trim())     errs.email     = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // Validates the form, then creates or updates the user (depending on mode).
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const roleOptions = mode === "create"
    ? [{ value: "student", label: "Student" }, { value: "teacher", label: "Faculty" }]
    : [{ value: "student", label: "Student" }, { value: "teacher", label: "Faculty" }, { value: "admin", label: "Admin" }];

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalBackdrop isDismissable>
        <ModalContainer size="md">
          <ModalDialog>
            <ModalHeader className="flex items-center justify-between pr-3">
              <ModalHeading className="text-lg font-bold text-brand-dark">
                {mode === "create" ? "Create New User" : "Edit User"}
              </ModalHeading>
              <ModalCloseTrigger className="text-brand-body hover:text-brand-dark transition-colors">
                <HiXMark size={18} />
              </ModalCloseTrigger>
            </ModalHeader>

            <Divider />

            <form onSubmit={handleSubmit}>
              <ModalBody className="flex flex-col gap-4 py-5">
                {error && (
                  <Alert status="danger">
                    <AlertIndicator><HiExclamationTriangle size={15} /></AlertIndicator>
                    <AlertContent>
                      <AlertDescription>{error}</AlertDescription>
                    </AlertContent>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="First Name" error={errors.firstName}>
                    <input
                      className={INPUT_CLS}
                      value={form.firstName}
                      onChange={(e) => patch("firstName", e.target.value)}
                      placeholder="John"
                      disabled={submitting}
                    />
                  </FormField>
                  <FormField label="Last Name" error={errors.lastName}>
                    <input
                      className={INPUT_CLS}
                      value={form.lastName}
                      onChange={(e) => patch("lastName", e.target.value)}
                      placeholder="Doe"
                      disabled={submitting}
                    />
                  </FormField>
                </div>

                <FormField label="Email Address" error={errors.email}>
                  <input
                    type="email"
                    className={INPUT_CLS}
                    value={form.email}
                    onChange={(e) => patch("email", e.target.value)}
                    placeholder="john.doe@university.edu"
                    disabled={submitting || mode === "edit"}
                  />
                  {mode === "edit" && (
                    <p className="text-[13px] text-brand-body">Email cannot be changed after creation.</p>
                  )}
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Role">
                    <NativeSelect
                      value={form.role}
                      onChange={(v) => patch("role", v)}
                      options={roleOptions}
                    />
                  </FormField>
                  <FormField label="Department">
                    <select
                      className={SELECT_CLS}
                      value={form.department}
                      onChange={(e) => patch("department", e.target.value)}
                      disabled={submitting}
                    >
                      <option value="">— Select department —</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </FormField>
                </div>

                {mode === "edit" && (
                  <FormField label="Account Status">
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.isActive}
                          onChange={(e) => patch("isActive", e.target.checked)}
                          className="sr-only peer"
                          disabled={submitting}
                        />
                        <div className="w-10 h-6 bg-brand-border peer-checked:bg-brand-blue rounded-full peer transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-[transform] peer-checked:after:translate-x-4" />
                        <span className="ml-3 text-sm font-medium text-brand-dark">
                          {form.isActive ? "Active" : "Inactive"}
                        </span>
                      </label>
                    </div>
                  </FormField>
                )}
              </ModalBody>

              <Divider />

              <ModalFooter className="flex justify-end gap-3 py-4">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={submitting}
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? mode === "create" ? "Creating…" : "Saving…"
                    : mode === "create" ? "Create User" : "Save Changes"}
                </Button>
              </ModalFooter>
            </form>
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </Modal>
  );
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────

// The "Are you sure you want to delete this user?" confirmation popup.
function DeleteConfirmModal({
  user,
  isOpen,
  onOpenChange,
  onConfirm,
}: {
  user:         User | null;
  isOpen:       boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm:    () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => { if (isOpen) setError(null); }, [isOpen]);

  // Actually deletes the user after the admin confirms.
  async function handleConfirm() {
    setDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalBackdrop isDismissable={!deleting}>
        <ModalContainer size="sm">
          <ModalDialog>
            <ModalHeader className="flex items-center justify-between pr-3">
              <ModalHeading className="text-lg font-bold text-brand-dark">
                Delete User
              </ModalHeading>
              <ModalCloseTrigger className="text-brand-body hover:text-brand-dark transition-colors">
                <HiXMark size={18} />
              </ModalCloseTrigger>
            </ModalHeader>
            <Divider />
            <ModalBody className="py-5 flex flex-col gap-3">
              <p className="text-[15px] text-brand-dark">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{user?.fullName}</span>? This
                action cannot be undone and will remove all their data.
              </p>
              {error && (
                <p className="text-[15px] text-red-600">{error}</p>
              )}
            </ModalBody>
            <Divider />
            <ModalFooter className="flex justify-end gap-3 py-4">
              <Button
                variant="secondary"
                disabled={deleting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleting}
                onClick={handleConfirm}
              >
                {deleting ? "Deleting…" : "Delete User"}
              </Button>
            </ModalFooter>
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </Modal>
  );
}

// ─── Temp password modal ──────────────────────────────────────────────────────

// A popup showing a newly generated temporary password after creating a
// user or resetting someone's password, with a one-click "Copy" button.
function TempPasswordModal({
  title,
  description,
  tempPassword,
  isOpen,
  onOpenChange,
}: {
  title:        string;
  description:  string;
  tempPassword: string;
  isOpen:       boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);

  // Copies the temporary password to the clipboard and briefly shows "Copied!".
  function handleCopy() {
    navigator.clipboard.writeText(tempPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalBackdrop isDismissable>
        <ModalContainer size="sm">
          <ModalDialog>
            <ModalHeader className="flex items-center justify-between pr-3">
              <ModalHeading className="text-lg font-bold text-brand-dark">
                {title}
              </ModalHeading>
              <ModalCloseTrigger className="text-brand-body hover:text-brand-dark transition-colors">
                <HiXMark size={18} />
              </ModalCloseTrigger>
            </ModalHeader>
            <Divider />
            <ModalBody className="py-5 flex flex-col gap-4">
              <Alert status="success">
                <AlertIndicator><HiCheckCircle size={15} /></AlertIndicator>
                <AlertContent>
                  <AlertDescription>{description}</AlertDescription>
                </AlertContent>
              </Alert>
              <div>
                <label className="text-xs font-semibold text-brand-body uppercase tracking-wide block mb-2">
                  Temporary Password
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-sm bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-brand-dark select-all">
                    {tempPassword}
                  </code>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopy}
                    className="shrink-0"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <p className="text-[13px] text-brand-body mt-2">
                  Share this password securely. The user will be prompted to change it on first login.
                </p>
              </div>
            </ModalBody>
            <Divider />
            <ModalFooter className="py-4 flex justify-end">
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </ModalFooter>
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </Modal>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

// Previous/Next + numbered page buttons for the user table.
function PaginationStrip({
  page,
  total,
  onPage,
}: {
  page:   number;
  total:  number;
  onPage: (p: number) => void;
}) {
  if (total <= 1) return null;
  const half  = 2;
  const start = Math.max(1, Math.min(page - half, total - half * 2));
  const end   = Math.min(total, start + half * 2);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => i + start);

  return (
    <div className="flex items-center justify-center gap-1.5 mt-4">
      <button
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-brand-border text-sm text-brand-body hover:bg-brand-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <HiChevronLeft size={14} /> Prev
      </button>
      {start > 1 && <span className="text-brand-body text-sm px-1">…</span>}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={cn(
            "w-8 h-8 rounded-md text-sm font-medium transition-colors",
            p === page ? "bg-brand-blue text-white" : "text-brand-dark hover:bg-brand-bg"
          )}
        >
          {p}
        </button>
      ))}
      {end < total && <span className="text-brand-body text-sm px-1">…</span>}
      <button
        disabled={page >= total}
        onClick={() => onPage(page + 1)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-brand-border text-sm text-brand-body hover:bg-brand-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next <HiChevronRight size={14} />
      </button>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

// Grey placeholder rows shown while the user list is still loading.
function TableSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-md" />
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

// The full admin "User Management" page: stat cards, a search + role
// filter, a paginated table of every account, and the create/edit/delete/
// reset-password dialogs that go with it.
export default function AdminUsersPage() {
  // Filter / pagination state
  const [page,          setPage]          = useState(1);
  const [searchInput,   setSearchInput]   = useState("");
  const [search,        setSearch]        = useState("");
  const [roleFilter,    setRoleFilter]    = useState<RoleFilter>("all");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // API params
  const params = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    role:   roleFilter !== "all" ? roleFilter as UserRole : undefined,
  }), [page, search, roleFilter]);

  const {
    users, pagination, isLoading, error, refetch,
    create, update, remove, resetPassword,
  } = useAdminUsers(params);

  // Modal states
  const createModal   = useOverlayState();
  const editModal     = useOverlayState();
  const deleteModal   = useOverlayState();
  const tempPwModal   = useOverlayState();

  // Selected user + temp password
  const [selectedUser,  setSelectedUser]  = useState<User | null>(null);
  const [tempPassword,  setTempPassword]  = useState("");
  const [tempPwTitle,   setTempPwTitle]   = useState("");
  const [tempPwDesc,    setTempPwDesc]    = useState("");
  const [actionError,   setActionError]   = useState<string | null>(null);

  // ── Row action handlers ────────────────────────────────────────────────────

  // Opens the edit dialog pre-filled with this user's info.
  function openEdit(user: User) {
    setSelectedUser(user);
    editModal.open();
  }

  // Opens the delete-confirmation dialog for this user.
  function openDelete(user: User) {
    setSelectedUser(user);
    deleteModal.open();
  }

  // Generates a new temporary password for this user and shows it in a popup.
  async function handleResetPassword(user: User) {
    setActionError(null);
    try {
      const result = await resetPassword(user._id);
      setTempPassword(result.tempPassword);
      setTempPwTitle("Password Reset");
      setTempPwDesc(`Password for ${user.fullName} has been reset.`);
      tempPwModal.open();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reset password");
    }
  }

  // ── Create submit ─────────────────────────────────────────────────────────
  // Creates the new user, then shows their auto-generated temporary password.
  async function handleCreate(data: UserFormData) {
    const payload: AdminCreateUserPayload = {
      firstName:  data.firstName,
      lastName:   data.lastName,
      email:      data.email,
      role:       data.role as "teacher" | "student",
      department: data.department || undefined,
    };
    const result = await create(payload);
    setTempPassword(result.tempPassword);
    setTempPwTitle("User Created");
    setTempPwDesc(`${result.user.fullName} has been created successfully.`);
    tempPwModal.open();
  }

  // ── Edit submit ────────────────────────────────────────────────────────────
  // Saves the edited fields for the currently selected user.
  async function handleEdit(data: UserFormData) {
    if (!selectedUser) return;
    const payload: AdminUpdateUserPayload = {
      firstName:  data.firstName  || undefined,
      lastName:   data.lastName   || undefined,
      role:       data.role,
      isActive:   data.isActive,
      department: data.department || undefined,
    };
    await update(selectedUser._id, payload);
  }

  // ── Delete confirm ─────────────────────────────────────────────────────────
  // Deletes the currently selected user.
  async function handleDelete() {
    if (!selectedUser) return;
    await remove(selectedUser._id);
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  const total   = pagination?.total  ?? 0;
  const pages   = pagination?.pages  ?? 1;
  const active  = users.filter((u) => u.isActive).length;
  const inactive = users.filter((u) => !u.isActive).length;

  const editInitial: Partial<UserFormData> = selectedUser
    ? {
        firstName:  selectedUser.firstName,
        lastName:   selectedUser.lastName,
        email:      selectedUser.email,
        role:       selectedUser.role,
        department: selectedUser.profile.department ?? "",
        isActive:   selectedUser.isActive,
      }
    : {};

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">User Management</h1>
          <p className="text-[15px] text-brand-body mt-1">
            Manage student, faculty, and admin accounts.
          </p>
        </div>
        <Button className="gap-2" onClick={createModal.open}>
          <HiUser size={15} />
          Create User
        </Button>
      </div>

      {/* ── API / action error ── */}
      {(error || actionError) && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <HiExclamationTriangle size={16} className="shrink-0" />
          <span className="flex-1">{error ?? actionError}</span>
          <button
            onClick={() => { refetch(); setActionError(null); }}
            className="flex items-center gap-1 font-semibold shrink-0 hover:text-red-900 transition-colors"
          >
            <HiArrowPath size={14} /> Retry
          </button>
        </div>
      )}

      {/* ── Stats row ── */}
      {!isLoading && pagination && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Users",   value: total,                 color: "text-brand-dark"    },
            { label: "On This Page",  value: users.length,          color: "text-brand-dark"    },
            { label: "Active",        value: active,                color: "text-emerald-600"   },
            { label: "Inactive",      value: inactive,              color: "text-brand-body"    },
          ].map(({ label, value, color }) => (
            <Card key={label} className="bg-white">
              <CardContent className="pt-3 pb-3">
                <p className="text-[13px] text-brand-body uppercase tracking-wide font-medium">{label}</p>
                <p className={cn("text-[25px] font-black mt-0.5", color)}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Filters row ── */}
      <div className="flex gap-3 flex-wrap items-end">
        {/* Search */}
        <div className="flex flex-col gap-1 min-w-[200px] flex-1">
          <label className="text-xs font-semibold text-brand-body uppercase tracking-wide">
            Search
          </label>
          <div className="relative">
            <HiMagnifyingGlass
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-body pointer-events-none"
            />
            <input
              type="text"
              className={cn(INPUT_CLS, "pl-9 pr-8")}
              placeholder="Name or email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-body hover:text-brand-dark transition-colors"
              >
                <HiXMark size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Role filter */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-xs font-semibold text-brand-body uppercase tracking-wide">Role</label>
          <NativeSelect
            value={roleFilter}
            onChange={(v) => { setRoleFilter(v as RoleFilter); setPage(1); }}
            options={ROLE_OPTIONS}
          />
        </div>

        {/* Clear filters */}
        {(search || roleFilter !== "all") && (
          <button
            onClick={() => { setSearchInput(""); setSearch(""); setRoleFilter("all"); setPage(1); }}
            className="text-xs font-semibold text-brand-blue hover:text-brand-blue-dark transition-colors self-end pb-2.5"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="rounded-xl border border-brand-border overflow-hidden bg-white">
        {/* Table header bar */}
        <div className="bg-brand-bg border-b border-brand-border px-4 py-2.5 flex items-center justify-between">
          <p className="text-[13px] font-bold uppercase tracking-wider text-brand-body">
            {search || roleFilter !== "all"
              ? `Filtered results`
              : "All Users"}
          </p>
          {pagination && (
            <p className="text-[13px] text-brand-body">
              Page <span className="font-semibold text-brand-dark">{page}</span> of{" "}
              <span className="font-semibold text-brand-dark">{pages}</span>
              {" · "}
              <span className="font-semibold text-brand-dark">{total}</span> total
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="p-4">
            <TableSkeleton />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <HiUserCircle size={40} className="text-brand-body/30" />
            <p className="text-[17px] font-semibold text-brand-dark">No users found</p>
            <p className="text-[15px] text-brand-body">
              {search || roleFilter !== "all"
                ? "Try adjusting your filters."
                : "Create the first user to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border">
                  {["Name", "Email", "Role", "Department", "Status", "Joined", "Actions"].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-brand-body"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {users.map((user) => {
                  const RoleIcon = ROLE_ICON[user.role];
                  return (
                    <tr key={user._id} className="hover:bg-brand-bg/50 transition-colors">
                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar size="sm" color="default">
                            {user.avatar ? (
                              <AvatarImage src={user.avatar} alt={user.fullName} />
                            ) : null}
                            <AvatarFallback>
                              {initials(user.firstName, user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold text-brand-dark truncate text-[17px]">
                              {user.fullName}
                            </p>
                            {user.requiresPasswordChange && (
                              <p className="text-[11px] text-amber-600 flex items-center gap-0.5">
                                <HiKey size={10} />
                                Needs pw change
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-brand-body truncate max-w-[180px]">
                        {user.email}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <Chip
                          size="sm"
                          variant="soft"
                          color={ROLE_CHIP_COLOR[user.role]}
                          className="text-xs capitalize"
                        >
                          <span className="flex items-center gap-1">
                            <RoleIcon size={11} />
                            {user.role}
                          </span>
                        </Chip>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3 text-brand-body text-xs truncate max-w-[120px]">
                        {user.profile.department ?? "—"}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <Chip
                          size="sm"
                          variant="soft"
                          color={user.isActive ? "success" : "default"}
                          className="text-xs"
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Chip>
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3 text-xs text-brand-body whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <Dropdown>
                          <DropdownTrigger className="w-8 h-8 flex items-center justify-center rounded-md text-brand-body hover:bg-brand-bg transition-colors">
                            <HiEllipsisVertical size={18} />
                          </DropdownTrigger>
                          <DropdownPopover className="z-50 min-w-[160px] rounded-md border border-brand-border bg-white shadow-md p-1">
                            <DropdownMenu
                              className="outline-none"
                              onAction={(key) => {
                                const k = key as string;
                                if (k === "edit")  openEdit(user);
                                if (k === "reset") handleResetPassword(user);
                                if (k === "delete") openDelete(user);
                              }}
                            >
                              <DropdownItem
                                id="edit"
                                className="flex items-center gap-2 px-3 py-2 text-sm rounded-sm cursor-pointer outline-none text-brand-dark hover:bg-brand-bg transition-colors"
                              >
                                Edit User
                              </DropdownItem>
                              <DropdownItem
                                id="reset"
                                className="flex items-center gap-2 px-3 py-2 text-sm rounded-sm cursor-pointer outline-none text-brand-dark hover:bg-brand-bg transition-colors"
                              >
                                Reset Password
                              </DropdownItem>
                              <DropdownItem
                                id="delete"
                                className="flex items-center gap-2 px-3 py-2 text-sm rounded-sm cursor-pointer outline-none text-red-600 hover:bg-red-50 transition-colors"
                              >
                                Delete User
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
        )}

        {/* Table footer */}
        {!isLoading && users.length > 0 && pagination && (
          <div className="border-t border-brand-border bg-brand-bg/50 px-4 py-2.5 text-xs text-brand-body">
            Showing{" "}
            <span className="font-semibold text-brand-dark">
              {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-brand-dark">{total}</span>{" "}
            users
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      <PaginationStrip page={page} total={pages} onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />

      {/* ── Create User modal ── */}
      <UserFormModal
        isOpen={createModal.isOpen}
        onOpenChange={createModal.setOpen}
        mode="create"
        onSubmit={handleCreate}
      />

      {/* ── Edit User modal ── */}
      <UserFormModal
        isOpen={editModal.isOpen}
        onOpenChange={editModal.setOpen}
        mode="edit"
        initialData={editInitial}
        onSubmit={handleEdit}
      />

      {/* ── Delete confirm modal ── */}
      <DeleteConfirmModal
        user={selectedUser}
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.setOpen}
        onConfirm={handleDelete}
      />

      {/* ── Temp password result modal ── */}
      <TempPasswordModal
        title={tempPwTitle}
        description={tempPwDesc}
        tempPassword={tempPassword}
        isOpen={tempPwModal.isOpen}
        onOpenChange={tempPwModal.setOpen}
      />
    </div>
  );
}
