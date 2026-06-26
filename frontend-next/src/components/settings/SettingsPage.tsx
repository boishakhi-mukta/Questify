"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from "@heroui/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  HiUser,
  HiBell,
  HiEye,
  HiPaintBrush,
  HiShieldCheck,
  HiArrowRightOnRectangle,
  HiTrash,
  HiKey,
} from "react-icons/hi2";
import { useAuth } from "@/hooks/useAuth";
import { useChangePassword } from "@/hooks/useChangePassword";

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = "profile" | "notifications" | "privacy" | "display" | "account";

const NAV_MAIN: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile Settings", icon: HiUser },
  { id: "notifications", label: "Notifications", icon: HiBell },
  { id: "privacy", label: "Privacy", icon: HiEye },
  { id: "display", label: "Display", icon: HiPaintBrush },
];

// ── Small reusable pieces ─────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/50
        ${checked ? "bg-brand-purple" : "bg-slate-200 dark:bg-slate-700"}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg
          transition-transform duration-200
          ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

function RadioOption({
  value,
  selected,
  onSelect,
  label,
}: {
  value: string;
  selected: boolean;
  onSelect: (v: string) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg border text-left transition-all
        ${
          selected
            ? "border-brand-purple bg-brand-purple/5 dark:bg-brand-purple/10 dark:border-brand-purple/60"
            : "border-brand-border dark:border-white/10 hover:border-brand-purple/40 dark:hover:border-brand-purple/40"
        }`}
    >
      <div
        className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors
          ${selected ? "border-brand-purple" : "border-slate-300 dark:border-white/30"}`}
      >
        {selected && <div className="w-2 h-2 rounded-full bg-brand-purple" />}
      </div>
      <span
        className={`text-sm ${
          selected
            ? "font-medium text-brand-dark dark:text-white"
            : "text-brand-muted dark:text-white/60"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-brand-dark dark:text-white">
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-xs text-brand-muted dark:text-white/40">{hint}</p>
      )}
    </div>
  );
}

function NotifRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-brand-dark dark:text-white">
          {title}
        </p>
        <p className="text-xs text-brand-muted dark:text-white/50 mt-0.5">
          {desc}
        </p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ── CSS helpers ────────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-brand-border dark:border-white/10 bg-white dark:bg-slate-800 " +
  "text-brand-dark dark:text-white px-3 py-2 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-brand-purple/50 " +
  "placeholder:text-brand-muted dark:placeholder:text-white/30";

const disabledInputCls =
  "w-full rounded-lg border border-brand-border dark:border-white/10 " +
  "bg-brand-surface dark:bg-slate-900 text-brand-muted dark:text-white/40 px-3 py-2 text-sm cursor-not-allowed";

// ── Main component ─────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const { changePassword, isPending: pwPending } = useChangePassword();

  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Profile form
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    officeLocation: "",
    officeHours: "",
    bio: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile((p) => ({
        ...p,
        firstName: user.firstName,
        lastName: user.lastName,
      }));
    }
  }, [user]);

  // Notifications
  const [notifs, setNotifs] = useState({
    courseAnnouncements: true,
    assignmentReminders: true,
    xpNotifications: true,
    gradeUpdates: true,
    enrollments: false,
    emailDigest: false,
  });

  // Privacy
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showActivity: true,
    searchable: true,
  });

  // Display
  const [language, setLanguage] = useState("en");
  const [fontSize, setFontSize] = useState("normal");

  // Password
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleProfileSave = async () => {
    setProfileSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setProfileSaving(false);
    toast.success("Profile settings saved");
  };

  const handleProfileCancel = () => {
    if (user) {
      setProfile((p) => ({
        ...p,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: "",
        bio: "",
        officeLocation: "",
        officeHours: "",
      }));
    }
  };

  const handlePasswordChange = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    const result = await changePassword({
      currentPassword: pwForm.currentPassword,
      newPassword: pwForm.newPassword,
    });
    if (result.success) {
      toast.success("Password updated successfully");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      toast.error(result.error ?? "Failed to update password");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex gap-6 animate-pulse">
        <div className="w-52 h-64 rounded-xl bg-brand-surface dark:bg-slate-800 shrink-0" />
        <div className="flex-1 h-96 rounded-xl bg-brand-surface dark:bg-slate-800" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="lg:w-56 shrink-0">
        <Card>
          <CardContent className="py-3">
            <nav className="space-y-0.5">
              {NAV_MAIN.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
                    ${
                      activeTab === id
                        ? "bg-brand-purple/10 dark:bg-white/10 text-brand-purple dark:text-white"
                        : "text-brand-muted dark:text-white/60 hover:bg-brand-surface dark:hover:bg-white/5 hover:text-brand-dark dark:hover:text-white"
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </button>
              ))}

              <div className="py-1">
                <Separator />
              </div>

              <button
                onClick={() => setActiveTab("account")}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
                  ${
                    activeTab === "account"
                      ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                      : "text-brand-muted dark:text-white/60 hover:bg-brand-surface dark:hover:bg-white/5 hover:text-brand-dark dark:hover:text-white"
                  }`}
              >
                <HiShieldCheck className="w-4 h-4 shrink-0" />
                Account & Security
              </button>
            </nav>
          </CardContent>
        </Card>
      </aside>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* Profile Settings */}
        {activeTab === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name">
                  <input
                    className={inputCls}
                    value={profile.firstName}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, firstName: e.target.value }))
                    }
                    placeholder="First name"
                  />
                </Field>
                <Field label="Last Name">
                  <input
                    className={inputCls}
                    value={profile.lastName}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, lastName: e.target.value }))
                    }
                    placeholder="Last name"
                  />
                </Field>
              </div>

              <Field
                label="Email"
                hint="Contact support to change your email address."
              >
                <input
                  className={disabledInputCls}
                  value={user.email}
                  readOnly
                  disabled
                />
              </Field>

              <Field label="Phone Number">
                <input
                  className={inputCls}
                  type="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="+47 000 00 000"
                />
              </Field>

              {user.role === "teacher" && (
                <>
                  <div className="h-px bg-brand-border dark:bg-white/8" />
                  <p className="text-xs font-semibold text-brand-muted dark:text-white/50 uppercase tracking-wide">
                    Office Information
                  </p>
                  <Field label="Office Location">
                    <input
                      className={inputCls}
                      value={profile.officeLocation}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          officeLocation: e.target.value,
                        }))
                      }
                      placeholder="e.g., Room 204, Engineering Building"
                    />
                  </Field>
                  <Field label="Office Hours">
                    <input
                      className={inputCls}
                      value={profile.officeHours}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          officeHours: e.target.value,
                        }))
                      }
                      placeholder="e.g., Mon & Wed 2–4 PM"
                    />
                  </Field>
                </>
              )}

              <Field label="Bio">
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={4}
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, bio: e.target.value }))
                  }
                  placeholder="Tell others a bit about yourself..."
                />
              </Field>

              <div className="flex items-center gap-3 pt-1">
                <Button
                  onClick={handleProfileSave}
                  disabled={profileSaving}
                >
                  {profileSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="ghost"
                  disabled={profileSaving}
                  onClick={handleProfileCancel}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="divide-y divide-brand-border dark:divide-white/8">
                <NotifRow
                  title="Course Announcements"
                  desc="Receive updates when teachers post course announcements"
                  checked={notifs.courseAnnouncements}
                  onChange={(v) =>
                    setNotifs((n) => ({ ...n, courseAnnouncements: v }))
                  }
                />
                <NotifRow
                  title="Assignment Reminders"
                  desc="Get notified about upcoming assignment deadlines"
                  checked={notifs.assignmentReminders}
                  onChange={(v) =>
                    setNotifs((n) => ({ ...n, assignmentReminders: v }))
                  }
                />
                <NotifRow
                  title="XP Notifications"
                  desc="Show a toast when you earn XP points"
                  checked={notifs.xpNotifications}
                  onChange={(v) =>
                    setNotifs((n) => ({ ...n, xpNotifications: v }))
                  }
                />
                <NotifRow
                  title="Grade Updates"
                  desc="Be notified when your assignments are graded"
                  checked={notifs.gradeUpdates}
                  onChange={(v) =>
                    setNotifs((n) => ({ ...n, gradeUpdates: v }))
                  }
                />
                {(user.role === "teacher" || user.role === "admin") && (
                  <NotifRow
                    title="Student Enrollments"
                    desc="Alert when a student enrolls in your course"
                    checked={notifs.enrollments}
                    onChange={(v) =>
                      setNotifs((n) => ({ ...n, enrollments: v }))
                    }
                  />
                )}
                <NotifRow
                  title="Weekly Email Digest"
                  desc="Receive a weekly summary of your activity"
                  checked={notifs.emailDigest}
                  onChange={(v) =>
                    setNotifs((n) => ({ ...n, emailDigest: v }))
                  }
                />
              </div>
              <div className="pt-5">
                <Button
                  onClick={() => toast.success("Notification preferences saved")}
                >
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Privacy */}
        {activeTab === "privacy" && (
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="divide-y divide-brand-border dark:divide-white/8">
                <NotifRow
                  title="Public Profile"
                  desc="Make your profile visible to other users on the platform"
                  checked={privacy.profileVisible}
                  onChange={(v) =>
                    setPrivacy((p) => ({ ...p, profileVisible: v }))
                  }
                />
                <NotifRow
                  title="Show Email Address"
                  desc="Display your email on your public profile page"
                  checked={privacy.showEmail}
                  onChange={(v) =>
                    setPrivacy((p) => ({ ...p, showEmail: v }))
                  }
                />
                <NotifRow
                  title="Show Activity Status"
                  desc="Let others see when you were last active"
                  checked={privacy.showActivity}
                  onChange={(v) =>
                    setPrivacy((p) => ({ ...p, showActivity: v }))
                  }
                />
                <NotifRow
                  title="Searchable Profile"
                  desc="Allow your profile to appear in platform search results"
                  checked={privacy.searchable}
                  onChange={(v) =>
                    setPrivacy((p) => ({ ...p, searchable: v }))
                  }
                />
              </div>
              <div className="pt-5">
                <Button
                  onClick={() => toast.success("Privacy settings saved")}
                >
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Display */}
        {activeTab === "display" && (
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-6">
                <RadioOption
                  value="light"
                  selected={theme === "light"}
                  onSelect={setTheme}
                  label="☀️  Light"
                />
                <RadioOption
                  value="dark"
                  selected={theme === "dark"}
                  onSelect={setTheme}
                  label="🌙  Dark"
                />
                <RadioOption
                  value="system"
                  selected={!theme || theme === "system"}
                  onSelect={setTheme}
                  label="💻  Auto (Follow System)"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Language</CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="dark:bg-slate-800 dark:border-white/10 dark:text-white">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="no">Norwegian (Norsk)</SelectItem>
                    <SelectItem value="es">Spanish (Español)</SelectItem>
                    <SelectItem value="fr">French (Français)</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Font Size</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-6">
                <RadioOption
                  value="small"
                  selected={fontSize === "small"}
                  onSelect={setFontSize}
                  label="Small — compact, more content on screen"
                />
                <RadioOption
                  value="normal"
                  selected={fontSize === "normal"}
                  onSelect={setFontSize}
                  label="Normal — default reading size"
                />
                <RadioOption
                  value="large"
                  selected={fontSize === "large"}
                  onSelect={setFontSize}
                  label="Large — easier to read"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Account & Security */}
        {activeTab === "account" && (
          <div className="space-y-5">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HiKey className="w-5 h-5" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pb-6">
                <Field label="Current Password">
                  <input
                    className={inputCls}
                    type="password"
                    value={pwForm.currentPassword}
                    onChange={(e) =>
                      setPwForm((f) => ({
                        ...f,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                  />
                </Field>
                <Field label="New Password">
                  <input
                    className={inputCls}
                    type="password"
                    value={pwForm.newPassword}
                    onChange={(e) =>
                      setPwForm((f) => ({ ...f, newPassword: e.target.value }))
                    }
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                </Field>
                <Field label="Confirm New Password">
                  <input
                    className={inputCls}
                    type="password"
                    value={pwForm.confirmPassword}
                    onChange={(e) =>
                      setPwForm((f) => ({
                        ...f,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Repeat your new password"
                    autoComplete="new-password"
                  />
                </Field>
                <Button
                  onClick={handlePasswordChange}
                  disabled={pwPending}
                  className="mt-1"
                >
                  {pwPending ? "Updating..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="rounded-lg border border-red-200 dark:border-red-900/60 divide-y divide-red-100 dark:divide-red-900/40">
                  {/* Logout all devices */}
                  <div className="flex items-start justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-brand-dark dark:text-white">
                        Log Out All Devices
                      </p>
                      <p className="text-xs text-brand-muted dark:text-white/50 mt-0.5">
                        Revoke access from all other active sessions immediately.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0 gap-1.5"
                      onClick={() => toast.success("Logged out from all devices")}
                    >
                      <HiArrowRightOnRectangle className="w-4 h-4" />
                      Log Out All
                    </Button>
                  </div>

                  {/* Delete account */}
                  <div className="flex items-start justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        Delete Account
                      </p>
                      <p className="text-xs text-brand-muted dark:text-white/50 mt-0.5">
                        Permanently delete your account and all data. This
                        cannot be undone.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="shrink-0 gap-1.5"
                      onClick={() =>
                        toast.error(
                          "Account deletion requires support — contact support@questify.io"
                        )
                      }
                    >
                      <HiTrash className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
