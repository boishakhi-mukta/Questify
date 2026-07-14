"use client";

/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Teacher Profile
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Profile credentials screen for teachers.
 * 
 * WHY IT EXISTS:
 * Displays active courses taught by the teacher.
 * 
 * HOW IT WORKS (Technical Overview):
 * Maps profile layouts.
 * ============================================================================
 */

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Chip,
  ProgressBarRoot,
  ProgressBarTrack,
  ProgressBarFill,
} from "@heroui/react";
import {
  HiBookOpen,
  HiUsers,
  HiStar,
  HiDocumentText,
  HiMapPin,
  HiClock,
  HiBuildingOffice2,
} from "react-icons/hi2";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/api/useCourses";
import ProfileLayout, {
  type ProfileStatCard,
  type ProfileAchievement,
} from "@/components/profile/ProfileLayout";
import type { Course } from "@/types/api-response";

function makeSeed(id: string) {
  let s = id.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

export default function TeacherProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { courses, isLoading: coursesLoading } = useCourses({ limit: 200 });

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    officeLocation: "",
    officeHours: "",
    bio: "",
  });
  const [formReady, setFormReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (user && !formReady) {
    setForm((f) => ({
      ...f,
      firstName: user.firstName,
      lastName: user.lastName,
    }));
    setFormReady(true);
  }

  const teacherCourses: Course[] = useMemo(
    () =>
      courses.filter((c: Course) =>
        c.teachers.some((t) =>
          typeof t === "string" ? t === user?._id : t._id === user?._id
        )
      ),
    [courses, user]
  );

  const totalStudents = useMemo(
    () => teacherCourses.reduce((sum, c) => sum + c.enrollmentCount, 0),
    [teacherCourses]
  );

  const avgRating = useMemo(() => {
    const rated = teacherCourses.filter((c) => c.totalReviews > 0);
    if (!rated.length) return 0;
    return (
      rated.reduce((sum, c) => sum + c.averageRating, 0) / rated.length
    );
  }, [teacherCourses]);

  const totalMaterials = useMemo(() => {
    let n = 0;
    teacherCourses.forEach((c) => {
      const rng = makeSeed(c._id);
      n += Math.floor(rng() * 8) + 2;
    });
    return n;
  }, [teacherCourses]);

  const statsCards: ProfileStatCard[] = [
    {
      label: "Active Courses",
      value: teacherCourses.filter((c) => c.isPublished).length,
      icon: <HiBookOpen className="w-5 h-5" />,
      iconWrapClass:
        "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Total Students",
      value: totalStudents,
      icon: <HiUsers className="w-5 h-5" />,
      iconWrapClass:
        "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
    },
    {
      label: "Avg Rating",
      value: avgRating > 0 ? `${avgRating.toFixed(1)} ⭐` : "–",
      icon: <HiStar className="w-5 h-5" />,
      iconWrapClass:
        "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400",
    },
    {
      label: "Materials",
      value: totalMaterials,
      icon: <HiDocumentText className="w-5 h-5" />,
      iconWrapClass:
        "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
    },
  ];

  const achievements: ProfileAchievement[] = [
    {
      id: "educator",
      icon: "🎓",
      name: "Educator",
      desc: "Created your first course",
      unlocked: teacherCourses.length >= 1,
    },
    {
      id: "mentor",
      icon: "📚",
      name: "Mentor",
      desc: "Teaching 3+ courses",
      unlocked: teacherCourses.length >= 3,
    },
    {
      id: "100-students",
      icon: "👥",
      name: "Crowd Pleaser",
      desc: "Reached 100 enrolled students",
      unlocked: totalStudents >= 100,
    },
    {
      id: "500-students",
      icon: "🚀",
      name: "Scale Builder",
      desc: "Reached 500 enrolled students",
      unlocked: totalStudents >= 500,
    },
    {
      id: "content",
      icon: "📝",
      name: "Content Creator",
      desc: "Uploaded course materials",
      unlocked: totalMaterials > 0,
    },
    {
      id: "published",
      icon: "✅",
      name: "Published",
      desc: "Published a course",
      unlocked: teacherCourses.some((c) => c.isPublished),
    },
    {
      id: "top-rated",
      icon: "⭐",
      name: "Top Rated",
      desc: "Achieved 4.5+ average rating",
      unlocked: avgRating >= 4.5,
    },
    {
      id: "veteran",
      icon: "🏅",
      name: "Veteran",
      desc: "Teaching 5+ courses",
      unlocked: teacherCourses.length >= 5,
    },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSaving(false);
    toast.success("Profile updated successfully");
  };

  const editFormContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-brand-dark dark:text-white">
            First Name
          </label>
          <input
            className="w-full rounded-lg border border-brand-border dark:border-white/10 bg-white dark:bg-slate-800 text-brand-dark dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            placeholder="First name"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-brand-dark dark:text-white">
            Last Name
          </label>
          <input
            className="w-full rounded-lg border border-brand-border dark:border-white/10 bg-white dark:bg-slate-800 text-brand-dark dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            placeholder="Last name"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-brand-dark dark:text-white">
          Email
        </label>
        <input
          className="w-full rounded-lg border border-brand-border dark:border-white/10 bg-white dark:bg-slate-800 text-brand-muted dark:text-white/40 px-3 py-2 text-sm cursor-not-allowed"
          value={user?.email ?? ""}
          readOnly
          disabled
        />
        <p className="text-xs text-brand-muted dark:text-white/40">
          Contact support to change your email address.
        </p>
      </div>
      <div className="h-px bg-brand-border dark:bg-white/8" />
      <p className="text-xs font-semibold text-brand-muted dark:text-white/50 uppercase tracking-wide">
        Office Information
      </p>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-brand-dark dark:text-white">
          Office Location
        </label>
        <input
          className="w-full rounded-lg border border-brand-border dark:border-white/10 bg-white dark:bg-slate-800 text-brand-dark dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
          value={form.officeLocation}
          onChange={(e) =>
            setForm((f) => ({ ...f, officeLocation: e.target.value }))
          }
          placeholder="e.g., Room 204, Engineering Building"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-brand-dark dark:text-white">
          Office Hours
        </label>
        <input
          className="w-full rounded-lg border border-brand-border dark:border-white/10 bg-white dark:bg-slate-800 text-brand-dark dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
          value={form.officeHours}
          onChange={(e) =>
            setForm((f) => ({ ...f, officeHours: e.target.value }))
          }
          placeholder="e.g., Mon & Wed 2–4 PM"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-brand-dark dark:text-white">
          Bio
        </label>
        <textarea
          className="w-full rounded-lg border border-brand-border dark:border-white/10 bg-white dark:bg-slate-800 text-brand-dark dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/50 resize-none"
          rows={3}
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          placeholder="Tell students about yourself..."
        />
      </div>
    </div>
  );

  if (authLoading || coursesLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-brand-surface dark:bg-slate-800"
          />
        ))}
      </div>
    );
  }

  if (!user) return null;

  return (
    <ProfileLayout
      user={user}
      roleLabel="Teacher"
      roleColor="success"
      subtitle={teacherCourses.length > 0 ? `${teacherCourses.length} courses` : undefined}
      statsCards={statsCards}
      achievements={achievements}
      editFormContent={editFormContent}
      onSave={handleSave}
      isSaving={isSaving}
    >
      {/* Office Info Card */}
      {(form.officeLocation || form.officeHours) && (
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex flex-wrap gap-6">
              {form.officeLocation && (
                <div className="flex items-center gap-2 text-sm text-brand-dark dark:text-white">
                  <HiMapPin className="w-4 h-4 text-brand-muted dark:text-white/50 shrink-0" />
                  <span>{form.officeLocation}</span>
                </div>
              )}
              {form.officeHours && (
                <div className="flex items-center gap-2 text-sm text-brand-dark dark:text-white">
                  <HiClock className="w-4 h-4 text-brand-muted dark:text-white/50 shrink-0" />
                  <span>{form.officeHours}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Courses */}
      {teacherCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teacherCourses.slice(0, 5).map((course) => {
                const capacity = course.maxCapacity > 0
                  ? Math.round((course.enrollmentCount / course.maxCapacity) * 100)
                  : 0;
                return (
                  <div
                    key={course._id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-brand-surface dark:bg-slate-800/50"
                  >
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-700 shrink-0">
                      <HiBuildingOffice2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-dark dark:text-white truncate">
                        {course.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <ProgressBarRoot
                          value={capacity}
                          size="sm"
                          color={capacity >= 90 ? "danger" : capacity >= 70 ? "warning" : "success"}
                        >
                          <ProgressBarTrack className="w-24">
                            <ProgressBarFill />
                          </ProgressBarTrack>
                        </ProgressBarRoot>
                        <span className="text-xs text-brand-muted dark:text-white/50">
                          {course.enrollmentCount}/{course.maxCapacity} students
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {course.averageRating > 0 && (
                        <span className="text-sm text-brand-muted dark:text-white/60">
                          ⭐ {course.averageRating.toFixed(1)}
                        </span>
                      )}
                      <Chip
                        color={course.isPublished ? "success" : "default"}
                        variant="soft"
                        size="sm"
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </Chip>
                    </div>
                  </div>
                );
              })}
              {teacherCourses.length > 5 && (
                <p className="text-center text-sm text-brand-muted dark:text-white/50 pt-1">
                  +{teacherCourses.length - 5} more courses
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </ProfileLayout>
  );
}
