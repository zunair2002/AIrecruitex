/**
 * Loading placeholders. Use them where the real layout is known, so the page
 * doesn't jump when data arrives; use `LoadingBlock` (ui/Feedback) otherwise.
 *
 *   <Skeleton className="h-4 w-40" />
 *   <SkeletonText lines={3} />
 *   <SkeletonCard />
 *   <PageSkeleton />          // header + KPI row + two panels
 */

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-surface-3 ${className}`}
    />
  );
}

const LINE_WIDTHS = ["w-full", "w-11/12", "w-4/5", "w-5/6", "w-3/4"];

export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={`h-3.5 ${
            index === lines - 1 && lines > 1
              ? "w-3/5"
              : LINE_WIDTHS[index % LINE_WIDTHS.length]
          }`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-xl border border-line bg-surface p-5 shadow-xs sm:p-6 ${className}`}
    >
      <Skeleton className="h-5 w-40" />
      <SkeletonText lines={lines} className="mt-5" />
    </div>
  );
}

/** Whole-page placeholder for dashboards: header, KPI row, 2/3 + 1/3 panels. */
export function PageSkeleton({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-xl border border-line bg-surface p-4 shadow-xs sm:p-5"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <SkeletonCard lines={5} className="lg:col-span-2" />
        <SkeletonCard lines={5} />
      </div>
    </div>
  );
}
