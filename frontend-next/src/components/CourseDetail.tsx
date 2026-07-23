"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: CourseDetail
 *
 * WHAT IT DOES (For Non-Technical Readers):
 * A comprehensive detail view showing everything about a course (syllabus, materials,
 * instructor details, semester, and enrollment state).
 *
 * WHY IT EXISTS:
 * To allow a student to research a course before self-enrolling, and to review
 * course content once enrolled.
 *
 * HOW IT WORKS (Technical Overview):
 * Connects to the courses API service, handles self-enrollment trigger buttons,
 * and lists downloadable PDFs/lecture videos.
 * ============================================================================
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  HiCheckCircle,
  HiMapPin,
  HiAcademicCap,
  HiCalendarDays,
  HiBuildingLibrary,
  HiUserGroup,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import { cn } from "@/lib/utils";
import { useCourse } from "@/hooks/api/useCourse";
import { useAuth } from "@/hooks/useAuth";
import { useMyEnrollments } from "@/hooks/api/useMyEnrollments";
import { useEnrollCourse } from "@/hooks/api/useEnrollCourse";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface CourseDetailProps {
  id: string;
  /** Where "back to courses" links (and the post-login redirect) point —
   *  lets this component be reused for both the public /courses/[id] page
   *  and an in-dashboard catalog (e.g. /student/browse/[id]). */
  basePath?: string;
}

const LEVEL_LABELS: Record<string, string> = {
  BACHELOR: "Bachelor",
  MASTERS:  "Masters",
};

// One line in the "XP Rewards" list, e.g. "Attendance ····· +10 XP".
function XpRow({ label, xp }: { label: string; xp: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-brand-bg last:border-b-0">
      <span className="text-sm text-brand-body">{label}</span>
      <Badge variant="blue">{xp}</Badge>
    </div>
  );
}

// One small rounded "pill" in the course header showing one fact about the
// course (e.g. "Campus: Bergen") with a matching icon.
function MetaChip({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-brand-border px-3.5 py-1.5 text-[13px] text-brand-body shadow-sm">
      <Icon size={14} className="text-brand-blue shrink-0" />
      <span className="text-brand-body/55">{label}:</span>
      <span className="font-semibold text-brand-dark">{value}</span>
    </span>
  );
}

// The full course detail page: hero banner with enroll/unenroll button,
// course description, learning objectives, prerequisites, modules, and an
// XP-rewards summary card.
export default function CourseDetail({ id, basePath = "/courses" }: CourseDetailProps) {
  const { course, isLoading, error } = useCourse(id);
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const isStudent = user?.role === "student";
  const { enrollments, refetch: refetchEnrollments } = useMyEnrollments(isAuthenticated && isStudent);
  const {
    enroll,
    unenroll,
    isLoading: isEnrollActionLoading,
    error: enrollActionError,
  } = useEnrollCourse(refetchEnrollments);

  const [showUnenrollConfirm, setShowUnenrollConfirm] = useState(false);

  const myEnrollment = enrollments.find(
    (e) => e.courseId._id === id && e.status !== "DROPPED"
  );
  const isEnrolled = !!myEnrollment;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg">
        <div className="bg-white border-b border-brand-border">
          <div className="max-w-[1100px] mx-auto px-5 sm:px-8 lg:px-12 pt-10 pb-12">
            <div className="h-4 w-32 bg-brand-border/50 rounded mb-7 animate-pulse" />
            <div className="h-8 w-2/3 bg-brand-border/50 rounded mb-5 animate-pulse" />
            <div className="h-10 w-32 bg-brand-border/50 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[19px] font-semibold text-brand-dark">
          {error ?? t("courseDetail.courseNotFound")}
        </p>
        <Link href={basePath} className="text-sm font-semibold text-brand-blue hover:text-brand-blue-dark no-underline transition-colors">
          {t("courseDetail.backToCourses")}
        </Link>
      </div>
    );
  }

  const objectives = course.metadata?.objectives?.length
    ? course.metadata.objectives
    : [
        "Understand core theoretical concepts and industry-standard practices",
        "Apply problem-solving techniques to real-world scenarios",
        "Collaborate effectively in team-based project environments",
        "Analyse, evaluate, and improve existing solutions",
        "Communicate technical findings clearly in written and oral form",
      ];

  const modules = [
    { id: "m1", title: "Module 1 — Foundations", body: "Introduction to the core concepts, terminology, and historical context of the subject. Includes readings and a short quiz." },
    { id: "m2", title: "Module 2 — Core Techniques", body: "Deep-dive into primary methods and tools. Students complete lab exercises and submit a short reflective report." },
    { id: "m3", title: "Module 3 — Applied Project", body: "Hands-on group project applying all techniques learned. Culminates in a presentation and peer-review session." },
  ];

  const teacherName = (() => {
    const teacher = course.teachers[0];
    if (!teacher) return null;
    if (typeof teacher === "string") return null;
    return `${teacher.firstName} ${teacher.lastName}`;
  })();

  const progressPct = myEnrollment?.progressPercentage ?? 0;
  const xpEarned     = myEnrollment?.totalXpEarned ?? 0;

  // Runs when the enroll/unenroll button is clicked. Sends a logged-out
  // visitor to the login page (remembering to bring them back here after);
  // otherwise enrolls the student, or opens the "are you sure?" dialog if
  // they're already enrolled and want to leave the course.
  function handleEnrollClick() {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${basePath}/${id}`);
      return;
    }
    if (!isStudent || !course) return;
    if (isEnrolled) {
      setShowUnenrollConfirm(true);
    } else {
      enroll(id)
        .then(() => toast.success(t("courseDetail.enrollSuccess", { title: course.title })))
        .catch(() => {});
    }
  }

  // Runs when the student confirms they really do want to unenroll, inside
  // the confirmation dialog.
  async function confirmUnenroll() {
    if (!myEnrollment || !course) return;
    try {
      await unenroll(myEnrollment._id);
      setShowUnenrollConfirm(false);
      toast.success(t("courseDetail.unenrollSuccess", { title: course.title }));
    } catch {
      // error is surfaced via enrollActionError below the CTA
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg">

      {/* Hero section — light, modern SaaS style */}
      <div
        className="relative overflow-hidden border-b border-brand-border"
        style={{ background: "linear-gradient(180deg, #eef8f4 0%, #F2FAF7 100%)" }}
      >
        <div
          className="absolute -top-16 -right-10 w-40 h-40 sm:-top-24 sm:-right-16 sm:w-72 sm:h-72 rounded-full pointer-events-none"
          style={{ background: "rgba(37,181,133,0.08)" }}
        />
        <div
          className="absolute -bottom-12 -left-6 w-28 h-28 sm:-bottom-20 sm:-left-10 sm:w-56 sm:h-56 rounded-full pointer-events-none"
          style={{ background: "rgba(27,67,50,0.05)" }}
        />

        <div className="relative max-w-[1100px] mx-auto px-5 sm:px-8 lg:px-12 pt-8 sm:pt-10 pb-10 sm:pb-12">

          <Link
            href={basePath}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-body hover:text-brand-dark no-underline transition-colors mb-6 sm:mb-7"
          >
            {t("courseDetail.backToCourses")}
          </Link>

          <div className="flex items-center gap-2 mb-4">
            <Badge variant="blue">{LEVEL_LABELS[course.level] ?? course.level}</Badge>
            {isEnrolled && <Badge variant="student">{t("courseDetail.enrolledBadge")}</Badge>}
          </div>

          <h1 className="text-[26px] sm:text-[30px] lg:text-[34px] font-bold text-brand-dark mb-5 leading-tight max-w-[700px]">
            {course.title}
          </h1>

          <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-8">
            <MetaChip icon={HiMapPin} label={t("courseDetail.campus")} value={course.campus} />
            <MetaChip icon={HiAcademicCap} label={t("courseDetail.credits")} value={`${course.credits} ECTS`} />
            {course.semester && (
              <MetaChip icon={HiCalendarDays} label={t("courseDetail.semester")} value={course.semester} />
            )}
            <MetaChip icon={HiBuildingLibrary} label={t("courseDetail.department")} value={course.category} />
            {teacherName && (
              <MetaChip icon={HiUserGroup} label={t("courseDetail.instructor")} value={teacherName} />
            )}
          </div>

          {(!isAuthenticated || isStudent) && (
            <div className="flex flex-col gap-2 items-stretch sm:items-start">
              <Button
                size="lg"
                variant={isEnrolled ? "secondary" : "default"}
                className={cn(
                  "w-full sm:w-auto",
                  isEnrolled && "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                )}
                onClick={handleEnrollClick}
                disabled={isEnrollActionLoading}
              >
                {isEnrollActionLoading
                  ? (isEnrolled ? t("courseDetail.unenrolling") : t("courseDetail.enrolling"))
                  : (isEnrolled ? t("courseDetail.unenrollNow") : t("courseDetail.enrollNow"))}
              </Button>
              {enrollActionError && (
                <p className="text-[15px] text-red-600">{enrollActionError}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Two-column body — stacks on mobile/tablet, side-by-side from lg up */}
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 lg:px-12 pt-10 sm:pt-12 pb-16 sm:pb-20 flex flex-col lg:flex-row gap-9 items-start">

        {/* Left column */}
        <div className="flex-1 min-w-0 flex flex-col gap-9">

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3.5">{t("courseDetail.aboutThisCourse")}</h2>
            <p className="text-[16px] text-brand-body leading-[1.8]">{course.description}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-4">{t("courseDetail.whatYouWillLearn")}</h2>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <HiCheckCircle size={20} className="text-brand-blue shrink-0 mt-0.5" />
                  <span className="text-[15px] text-brand-body leading-relaxed">{obj}</span>
                </li>
              ))}
            </ul>
          </section>

          {course.metadata?.prerequisites && course.metadata.prerequisites.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-brand-dark mb-4">{t("courseDetail.prerequisites")}</h2>
              <ul className="list-none p-0 m-0 flex flex-col gap-2">
                {course.metadata.prerequisites.map((prereq, i) => (
                  <li key={i} className="text-[15px] text-brand-body">• {prereq}</li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-4">{t("courseDetail.courseModules")}</h2>
            <Accordion type="single" collapsible className="flex flex-col gap-2.5">
              {modules.map((mod) => (
                <AccordionItem key={mod.id} value={mod.id}>
                  <AccordionTrigger>{mod.title}</AccordionTrigger>
                  <AccordionContent>{mod.body}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

        </div>

        {/* Right column — sticky XP card (full-width when stacked on mobile/tablet) */}
        <div className="w-full lg:w-[280px] shrink-0 lg:sticky lg:top-6">
          <Card className="overflow-hidden">
            <div className="h-1" style={{ background: "linear-gradient(90deg, #30d99a 0%, #25B585 55%, #1B4332 100%)" }} />
            <CardHeader className="pb-0">
              <CardTitle>{t("courseDetail.xpRewards")}</CardTitle>
              <CardDescription>{t("courseDetail.xpRewardsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">

              <XpRow label={t("courseDetail.attendance")}  xp="+10 XP" />
              <XpRow label={t("courseDetail.assignments")} xp="+25 XP" />
              <XpRow label={t("courseDetail.reading")}     xp="+15 XP" />

              <div className="mt-5">
                <div className="flex justify-between mb-1.5">
                  <span className="text-[13px] font-semibold text-brand-dark">{t("courseDetail.yourProgress")}</span>
                  <span className="text-[13px] font-bold text-brand-blue">{progressPct}%</span>
                </div>
                <div className="w-full h-2 bg-brand-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-[600ms] ease-in-out"
                    style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #30d99a 0%, #25B585 100%)" }}
                  />
                </div>
                <p className="text-[13px] text-brand-body mt-2">
                  {isEnrolled ? `${xpEarned} XP earned so far` : t("courseDetail.enrollToStart")}
                </p>
              </div>

              <div className="mt-5 bg-brand-bg rounded-md p-3 text-center">
                <p className="text-[13px] text-brand-body mb-1">{t("courseDetail.totalPotentialXp")}</p>
                <p className="text-[25px] font-bold text-brand-dark">50 XP</p>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

      {/* Unenroll confirmation */}
      <Dialog
        open={showUnenrollConfirm}
        onOpenChange={(open) => { if (!open) setShowUnenrollConfirm(false); }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("courseDetail.unenrollConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("courseDetail.unenrollConfirmBody", { title: course.title })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" disabled={isEnrollActionLoading}>
                {t("courseDetail.cancel")}
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmUnenroll} disabled={isEnrollActionLoading}>
              {isEnrollActionLoading ? t("courseDetail.unenrolling") : t("courseDetail.unenrollNow")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
