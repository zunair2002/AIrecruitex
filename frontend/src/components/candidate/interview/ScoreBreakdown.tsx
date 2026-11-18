type ScoreBarProps = {
  label: string;
  score: number;
  /** Legacy gradient hint, kept for callers; the bar uses the brand fill. */
  gradient: string;
};

/** A labelled 0–100 score with a progress bar (stage scores in reports). */
export function ScoreBar({ label, score }: ScoreBarProps) {
  const width = Math.max(0, Math.min(100, score));
  return (
    <div className="min-w-0 rounded-xl border border-line bg-surface p-5 shadow-xs">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="min-w-0 text-sm font-medium text-muted">{label}</p>
        <p className="font-display text-2xl font-semibold tracking-tight tabular-nums text-ink">
          {score}%
        </p>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={width}
        className="h-2 overflow-hidden rounded-full bg-surface-3"
      >
        <div
          className="h-full rounded-full bg-brand-600 transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

type FinalScoreRingProps = {
  score: number;
};

/** The big circular final score (brand gradient). */
export function FinalScoreRing({ score }: FinalScoreRingProps) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative mx-auto h-40 w-40">
      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 120 120"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-brand-500)" />
            <stop offset="100%" stopColor="var(--color-brand-700)" />
          </linearGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--color-surface-3)"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-display text-4xl font-semibold tracking-tight tabular-nums text-ink">
          {score}%
        </p>
        <p className="mt-1 text-xs font-medium text-muted">Final score</p>
      </div>
    </div>
  );
}
