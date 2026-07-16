/**
 * ============================================================================
 * QUESTIFY COMPONENT: CourseSkeleton
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Animated gray block shapes resembling course cards shown while data is downloading.
 * 
 * WHY IT EXISTS:
 * Reduces perceived wait times by indicating to users that content is loading.
 * 
 * HOW IT WORKS (Technical Overview):
 * Renders mockup card structures styled with gray flashing pulsing animations.
 * ============================================================================
 */

export function CourseSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-brand-border/40 bg-white shadow-xs animate-pulse">
      <div className="h-0.75 bg-brand-border/30" />
      <div className="px-5 pt-5 pb-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 bg-brand-bg rounded" />
          <div className="h-4 w-16 bg-brand-bg rounded-full" />
        </div>
        <div className="h-4 w-4/5 bg-brand-bg rounded" />
        <div className="h-3 w-full bg-brand-bg rounded" />
        <div className="h-3 w-2/3 bg-brand-bg rounded" />
        <div className="pt-3 border-t border-brand-border/40 flex gap-4">
          <div className="h-3 w-14 bg-brand-bg rounded" />
          <div className="h-3 w-10 bg-brand-bg rounded" />
        </div>
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
