"use client";

import Link from "next/link";
import { HiCheckCircle } from "react-icons/hi2";
import { useCourse } from "@/hooks/api/useCourse";
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

interface CourseDetailProps {
  id: string;
}

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER:     "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED:     "Advanced",
};

function XpRow({ label, xp }: { label: string; xp: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-brand-bg">
      <span className="text-sm text-brand-body">{label}</span>
      <Badge variant="blue">{xp}</Badge>
    </div>
  );
}

export default function CourseDetail({ id }: CourseDetailProps) {
  const { course, isLoading, error } = useCourse(id);
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg">
        <div className="bg-brand-dark">
          <div className="max-w-[1100px] mx-auto px-12 pt-10 pb-12">
            <div className="h-4 w-32 bg-white/10 rounded mb-7 animate-pulse" />
            <div className="h-8 w-2/3 bg-white/10 rounded mb-5 animate-pulse" />
            <div className="h-10 w-32 bg-white/20 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold text-brand-dark">
          {error ?? t("courseDetail.courseNotFound")}
        </p>
        <Link href="/courses" className="text-sm font-semibold text-brand-blue hover:text-brand-blue-dark no-underline transition-colors">
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

  return (
    <div className="min-h-screen bg-brand-bg">

      {/* Hero section */}
      <div className="bg-brand-dark">
        <div className="max-w-[1100px] mx-auto px-12 pt-10 pb-12">

          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/65 hover:text-white no-underline transition-colors mb-7"
          >
            {t("courseDetail.backToCourses")}
          </Link>

          <div className="mb-3">
            <Badge variant="outline">{LEVEL_LABELS[course.level] ?? course.level}</Badge>
          </div>

          <h1 className="text-[32px] font-bold text-white mb-5 leading-snug max-w-[700px]">
            {course.title}
          </h1>

          <div className="flex flex-wrap gap-5 mb-8">
            {[
              { label: t("courseDetail.campus"),   value: course.campus },
              { label: t("courseDetail.credits"),  value: `${course.credits} ECTS` },
              ...(course.semester ? [{ label: t("courseDetail.semester"), value: course.semester }] : []),
              { label: t("courseDetail.category"), value: course.category },
            ].map(({ label, value }) => (
              <span key={label} className="text-sm text-white/75">
                <span className="text-white/50 mr-1">{label}:</span>
                {value}
              </span>
            ))}
          </div>

          <Button size="lg">{t("courseDetail.enrollNow")}</Button>
        </div>
      </div>

      {/* Two-column body */}
      <div className="max-w-[1100px] mx-auto px-12 pt-12 pb-20 flex gap-9 items-start">

        {/* Left column */}
        <div className="flex-1 min-w-0 flex flex-col gap-9">

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3.5">{t("courseDetail.aboutThisCourse")}</h2>
            <p className="text-[15px] text-brand-body leading-[1.8]">{course.description}</p>
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

        {/* Right column — sticky XP card */}
        <div className="w-[280px] shrink-0 sticky top-6">
          <Card>
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
                  <span className="text-[13px] font-bold text-brand-blue">0%</span>
                </div>
                <div className="w-full h-2 bg-brand-border rounded-full overflow-hidden">
                  <div className="w-0 h-full bg-brand-blue rounded-full transition-[width] duration-[600ms] ease-in-out" />
                </div>
                <p className="text-xs text-brand-body mt-2">{t("courseDetail.enrollToStart")}</p>
              </div>

              <div className="mt-5 bg-brand-bg rounded-md p-3 text-center">
                <p className="text-xs text-brand-body mb-1">{t("courseDetail.totalPotentialXp")}</p>
                <p className="text-2xl font-bold text-brand-dark">50 XP</p>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
