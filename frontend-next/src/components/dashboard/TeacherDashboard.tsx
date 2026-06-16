import { HiWrenchScrewdriver } from "react-icons/hi2";

export default function TeacherDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
        <HiWrenchScrewdriver size={32} className="text-emerald-500" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Teacher Dashboard</h1>
        <p className="text-brand-body mt-2 max-w-sm">
          This dashboard is under construction. Check back soon — course management,
          student tracking, and more are on the way.
        </p>
      </div>
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full">
        Coming Soon
      </span>
    </div>
  );
}
