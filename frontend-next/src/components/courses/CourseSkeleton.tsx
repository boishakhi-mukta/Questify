export function CourseSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-brand-border p-5 flex flex-col gap-3 animate-pulse">
      {/* Badges */}
      <div className="flex gap-1.5">
        <div className="w-24 h-5 rounded-full bg-brand-bg" />
        <div className="w-16 h-5 rounded-full bg-brand-bg" />
      </div>
      {/* Title */}
      <div className="space-y-1.5">
        <div className="w-full h-5 rounded bg-brand-bg" />
        <div className="w-3/4 h-5 rounded bg-brand-bg" />
      </div>
      {/* Instructor */}
      <div className="w-1/3 h-4 rounded bg-brand-bg" />
      {/* Description */}
      <div className="space-y-1.5">
        <div className="w-full h-4 rounded bg-brand-bg" />
        <div className="w-5/6 h-4 rounded bg-brand-bg" />
      </div>
      {/* Rating */}
      <div className="w-1/2 h-4 rounded bg-brand-bg" />
      {/* Bottom row */}
      <div className="flex items-center justify-between pt-3 border-t border-brand-border mt-auto">
        <div className="flex gap-2">
          <div className="w-16 h-5 rounded-full bg-brand-bg" />
          <div className="w-12 h-5 rounded bg-brand-bg" />
        </div>
        <div className="w-10 h-5 rounded bg-brand-bg" />
      </div>
    </div>
  );
}

export function CourseSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <CourseSkeleton key={i} />
      ))}
    </div>
  );
}
