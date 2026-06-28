"use client";

import { HiWrenchScrewdriver } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

export default function TeacherDashboard() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
        <HiWrenchScrewdriver size={32} className="text-emerald-500" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">{t("teacherDashboard.title")}</h1>
        <p className="text-brand-body mt-2 max-w-sm">
          {t("teacherDashboard.subtitle")}
        </p>
      </div>
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full">
        {t("teacherDashboard.comingSoon")}
      </span>
    </div>
  );
}
