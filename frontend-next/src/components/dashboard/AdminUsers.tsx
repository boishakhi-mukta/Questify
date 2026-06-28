"use client";

import { useState } from "react";
import {
  HiPlus, HiPencil, HiTrash, HiMagnifyingGlass,
  HiUsers, HiAcademicCap, HiUserCircle, HiClipboardDocument,
} from "react-icons/hi2";
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
import { useAdminUsers } from "@/hooks/api/useAdminUsers";
import { useTranslation } from "react-i18next";
import type { User } from "@/types/api-response";
import type { AdminCreateUserPayload, AdminUpdateUserPayload } from "@/services/api";

type RoleFilter = "all" | "teacher" | "student";

interface UserForm {
  firstName: string;
  lastName:  string;
  email:     string;
  role:      "teacher" | "student";
}

const emptyForm = (): UserForm => ({
  firstName: "",
  lastName:  "",
  email:     "",
  role:      "student",
});

export default function AdminUsers() {
  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  const { users, isLoading, error, create, update, remove, resetPassword } = useAdminUsers({
    limit: 100,
  });

  // Dialog state
  const [dialogOpen, setDialogOpen]   = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm]               = useState(emptyForm());
  const [isSaving, setIsSaving]       = useState(false);
  const [formError, setFormError]     = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget]   = useState<User | null>(null);
  const [isDeleting, setIsDeleting]       = useState(false);

  const [tempPasswordInfo, setTempPasswordInfo] = useState<{ name: string; password: string } | null>(null);
  const { t } = useTranslation();

  // ── Derived list ────────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const q         = search.toLowerCase();
    const matchSearch =
      !q ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q)  ||
      u.email.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function openCreate() {
    setEditingUser(null);
    setForm(emptyForm());
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setForm({
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      role:      user.role === "admin" ? "student" : user.role,
    });
    setFormError(null);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.firstName || !form.lastName || !form.email) return;
    setIsSaving(true);
    setFormError(null);
    try {
      if (editingUser) {
        const payload: AdminUpdateUserPayload = {
          firstName: form.firstName,
          lastName:  form.lastName,
          role:      form.role,
        };
        await update(editingUser._id, payload);
      } else {
        const payload: AdminCreateUserPayload = {
          firstName: form.firstName,
          lastName:  form.lastName,
          email:     form.email,
          role:      form.role,
        };
        const result = await create(payload);
        setTempPasswordInfo({ name: `${form.firstName} ${form.lastName}`, password: result.tempPassword });
      }
      setDialogOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save user");
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
      // error is surfaced by the hook
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleResetPassword(user: User) {
    try {
      const result = await resetPassword(user._id);
      setTempPasswordInfo({ name: user.fullName, password: result.tempPassword });
    } catch {
      // ignore
    }
  }

  const tabs: { key: RoleFilter; label: string; icon: React.ElementType }[] = [
    { key: "all",     label: t("adminUsers.allUsers"), icon: HiUsers },
    { key: "teacher", label: t("adminUsers.teachers"), icon: HiUserCircle },
    { key: "student", label: t("adminUsers.students"), icon: HiAcademicCap },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">{t("adminUsers.title")}</h1>
          <p className="text-sm text-brand-body mt-0.5">
            {t("adminUsers.subtitle")}
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <HiPlus size={16} />
          {t("adminUsers.addUser")}
        </Button>
      </div>

      {/* API error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 bg-brand-bg rounded-lg p-1 border border-brand-border">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setRoleFilter(key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors cursor-pointer",
                roleFilter === key
                  ? "bg-white text-brand-dark shadow-sm border border-brand-border"
                  : "text-brand-body hover:text-brand-dark"
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <HiMagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-body" />
          <Input
            placeholder={t("adminUsers.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center text-sm text-brand-body">
            {t("adminUsers.loadingUsers")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border bg-brand-bg">
                  <th className="text-left px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">{t("adminUsers.name")}</th>
                  <th className="text-left px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">{t("adminUsers.email")}</th>
                  <th className="text-left px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">{t("adminUsers.role")}</th>
                  <th className="text-right px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">{t("adminUsers.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-brand-body text-sm">
                      {t("adminUsers.noUsersFound")}
                    </td>
                  </tr>
                ) : (
                  filtered.map((user, i) => (
                    <tr
                      key={user._id}
                      className={cn(
                        "border-b border-brand-border last:border-0 transition-colors hover:bg-brand-bg/50",
                        i % 2 === 0 ? "bg-white" : "bg-brand-bg/30"
                      )}
                    >
                      <td className="px-5 py-3.5 font-semibold text-brand-dark">{user.fullName}</td>
                      <td className="px-5 py-3.5 text-brand-body">{user.email}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={user.role === "teacher" ? "teacher" : user.role === "admin" ? "blue" : "student"}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleResetPassword(user)}
                            aria-label={t("adminUsers.resetPassword")}
                            title={t("adminUsers.resetPassword")}
                          >
                            <HiClipboardDocument size={15} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(user)} aria-label={t("adminUsers.editUser")}>
                            <HiPencil size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteTarget(user)}
                            aria-label={t("adminUsers.deleteUser")}
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
            {t("adminUsers.showing", { count: filtered.length, total: users.length })}
          </div>
        )}
      </Card>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? t("adminUsers.editUserTitle") : t("adminUsers.addNewUser")}</DialogTitle>
            <DialogDescription>
              {editingUser ? t("adminUsers.editUserDesc") : t("adminUsers.addUserDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="form-first">{t("adminUsers.firstName")}</Label>
                <Input
                  id="form-first"
                  placeholder="e.g. Alice"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="form-last">{t("adminUsers.lastName")}</Label>
                <Input
                  id="form-last"
                  placeholder="e.g. Hansen"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="form-email">{t("adminUsers.email")}</Label>
              <Input
                id="form-email"
                type="email"
                placeholder="e.g. alice@questify.no"
                value={form.email}
                disabled={!!editingUser}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t("adminUsers.role")}</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm((f) => ({ ...f, role: v as "teacher" | "student" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("adminUsers.selectRole")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">{t("adminUsers.teacher")}</SelectItem>
                  <SelectItem value="student">{t("adminUsers.student")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" disabled={isSaving}>{t("adminUsers.cancel")}</Button>
            </DialogClose>
            <Button
              onClick={handleSave}
              disabled={isSaving || !form.firstName || !form.lastName || !form.email}
            >
              {isSaving ? t("adminUsers.saving") : editingUser ? t("adminUsers.saveChanges") : t("adminUsers.createUser")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Temp Password Dialog ── */}
      <Dialog open={!!tempPasswordInfo} onOpenChange={(o) => { if (!o) setTempPasswordInfo(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("adminUsers.tempPasswordTitle")}</DialogTitle>
            <DialogDescription>
              {t("adminUsers.tempPasswordDesc", { name: tempPasswordInfo?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-brand-bg border border-brand-border px-4 py-3 font-mono text-sm text-brand-dark select-all">
            {tempPasswordInfo?.password}
          </div>
          <DialogFooter>
            <Button onClick={() => setTempPasswordInfo(null)}>{t("adminUsers.done")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("adminUsers.deactivateTitle")}</DialogTitle>
            <DialogDescription>
              {t("adminUsers.deactivateDesc", { name: deleteTarget?.fullName ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              {t("adminUsers.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? t("adminUsers.deactivating") : t("adminUsers.deactivate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
