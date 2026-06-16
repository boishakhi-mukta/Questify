"use client";

import { useState } from "react";
import { HiPlus, HiPencil, HiTrash, HiMagnifyingGlass, HiUsers, HiAcademicCap, HiUserCircle } from "react-icons/hi2";
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
import { seedUsers, nextUserId, type AdminUser } from "@/lib/admin-store";

type RoleFilter = "all" | "teacher" | "student";

const emptyForm = (): Omit<AdminUser, "id"> => ({
  userId: "",
  name: "",
  email: "",
  role: "student",
  password: "",
});

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>(seedUsers);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  // ── Derived list ────────────────────────────────────────
  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.userId.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  // ── Helpers ─────────────────────────────────────────────
  function openCreate() {
    setEditingUser(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(user: AdminUser) {
    setEditingUser(user);
    setForm({ userId: user.userId, name: user.name, email: user.email, role: user.role, password: user.password });
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.userId || !form.name || !form.email || !form.password) return;
    if (editingUser) {
      setUsers((prev) => prev.map((u) => u.id === editingUser.id ? { ...u, ...form } : u));
    } else {
      const newUser: AdminUser = { id: nextUserId(users), ...form };
      setUsers((prev) => [...prev, newUser]);
    }
    setDialogOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  const tabs: { key: RoleFilter; label: string; icon: React.ElementType }[] = [
    { key: "all",     label: "All Users", icon: HiUsers },
    { key: "teacher", label: "Teachers",  icon: HiUserCircle },
    { key: "student", label: "Students",  icon: HiAcademicCap },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Users</h1>
          <p className="text-sm text-brand-body mt-0.5">
            Create and manage teacher and student accounts.
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <HiPlus size={16} />
          Add User
        </Button>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Role tabs */}
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

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <HiMagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-body" />
          <Input
            placeholder="Search by name or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border bg-brand-bg">
                <th className="text-left px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">User ID</th>
                <th className="text-left px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">Role</th>
                <th className="text-right px-5 py-3 text-[12px] font-semibold text-brand-body uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-brand-body text-sm">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((user, i) => (
                  <tr
                    key={user.id}
                    className={cn("border-b border-brand-border last:border-0 transition-colors hover:bg-brand-bg/50", i % 2 === 0 ? "bg-white" : "bg-brand-bg/30")}
                  >
                    <td className="px-5 py-3.5 font-semibold text-brand-dark">{user.name}</td>
                    <td className="px-5 py-3.5 text-brand-body font-mono text-[13px]">{user.userId}</td>
                    <td className="px-5 py-3.5 text-brand-body">{user.email}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={user.role === "teacher" ? "teacher" : "student"}>
                        {user.role === "teacher" ? "Teacher" : "Student"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(user)} aria-label="Edit user">
                          <HiPencil size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteTarget(user)}
                          aria-label="Delete user"
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
            Showing {filtered.length} of {users.length} users
          </div>
        )}
      </Card>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update the user's details below." : "Fill in the details to create a new account."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="form-name">Full Name</Label>
                <Input
                  id="form-name"
                  placeholder="e.g. Alice Hansen"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="form-userid">User ID</Label>
                <Input
                  id="form-userid"
                  placeholder="e.g. teacher03"
                  value={form.userId}
                  onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="form-email">Email</Label>
              <Input
                id="form-email"
                type="email"
                placeholder="e.g. alice@questify.no"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm((f) => ({ ...f, role: v as "teacher" | "student" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="form-password">Password</Label>
                <Input
                  id="form-password"
                  type="text"
                  placeholder="Initial password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={!form.userId || !form.name || !form.email || !form.password}>
              {editingUser ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-brand-dark">{deleteTarget?.name}</span>?
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
