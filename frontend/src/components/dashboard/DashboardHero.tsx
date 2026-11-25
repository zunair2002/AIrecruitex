import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The top of every portal dashboard: a dark banner in the sidebar colour with
 * the greeting, the primary actions and the headline numbers built in — so the
 * dashboards open with one confident block instead of a row of four look-alike
 * stat cards.
 *
 *   <DashboardHero
 *     eyebrow="Tuesday, 18 November"
 *     title="Welcome back, Sara"
 *     description="3 applicants are waiting for a decision."
 *     actions={<>
 *       <HeroButton href="/recruiter/jobs/create" icon={<Plus />}>Create job</HeroButton>
 *       <HeroButton href="/recruiter/applicants" variant="ghost">Review applicants</HeroButton>
 *     </>}
 *     aside={<HeroMeter value={72} label="Average match" caption="Across 12 applicants" />}
 *     stats={[{ label: "Open jobs", value: 4, detail: "1 closed", icon: <Briefcase /> }, …]}
 *   />
 */

export type HeroStat = {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  icon?: ReactNode;
  /** Colours the detail line: up = good news, down = needs attention. */
  trend?: "up" | "down" | "neutral";
};

export function DashboardHero({
  eyebrow,
  title,
  description,
  actions,
  aside,
  stats = [],
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Optional right-hand highlight on large screens (e.g. a HeroMeter). */
  aside?: ReactNode;
  stats?: HeroStat[];
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-sidebar text-white shadow-lg">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-brand-500/35 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-brand-400/15 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:36px_36px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_65%)]" />
      </div>

      <div className="relative grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
              {description}
            </p>
          )}
          {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
        </div>
        {aside && <div className="min-w-0 lg:w-72">{aside}</div>}
      </div>

      {stats.length > 0 && (
        <dl
          className={`relative grid grid-cols-2 border-t border-white/10 bg-white/[0.03] ${
            stats.length >= 4 ? "lg:grid-cols-4" : stats.length === 3 ? "lg:grid-cols-3" : ""
          }`}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="min-w-0 border-white/10 px-5 py-4 odd:border-r sm:px-8 sm:py-5 [&:nth-child(n+3)]:border-t lg:border-r lg:last:border-r-0 lg:[&:nth-child(n+3)]:border-t-0"
            >
              <dt className="flex items-center gap-2 text-xs font-medium text-white/60 sm:text-sm [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:text-brand-300">
                {stat.icon}
                <span className="truncate">{stat.label}</span>
              </dt>
              <dd className="mt-1.5 font-display text-2xl font-semibold tracking-tight tabular-nums text-white sm:text-3xl">
                {stat.value}
              </dd>
              {stat.detail && (
                <dd
                  className={`mt-1 truncate text-xs ${
                    stat.trend === "up"
                      ? "text-success-200"
                      : stat.trend === "down"
                        ? "text-warning-200"
                        : "text-white/60"
                  }`}
                >
                  {stat.detail}
                </dd>
              )}
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

const HERO_BUTTON_BASE =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar [&>svg]:h-4 [&>svg]:w-4";

const HERO_BUTTON_VARIANTS = {
  light: "bg-white text-sidebar shadow-xs hover:bg-brand-50",
  ghost: "bg-white/10 text-white ring-1 ring-inset ring-white/15 hover:bg-white/15",
} as const;

/** A button that reads well on the dark hero. */
export function HeroButton({
  href,
  onClick,
  icon,
  variant = "light",
  children,
}: {
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: keyof typeof HERO_BUTTON_VARIANTS;
  children: ReactNode;
}) {
  const className = `${HERO_BUTTON_BASE} ${HERO_BUTTON_VARIANTS[variant]}`;
  if (href) {
    return (
      <Link href={href} className={className}>
        {icon}
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {icon}
      {children}
    </button>
  );
}

/** A circular 0–100 meter for the hero's right-hand side. */
export function HeroMeter({
  value,
  label,
  caption,
  suffix = "%",
}: {
  value: number;
  label: string;
  caption?: ReactNode;
  suffix?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white/[0.06] p-4 ring-1 ring-inset ring-white/10">
      <div className="relative h-24 w-24 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="9" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--color-brand-300)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (clamped / 100) * circumference}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-semibold tabular-nums text-white">
          {clamped}
          <span className="text-sm text-white/60">{suffix}</span>
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{label}</p>
        {caption && <p className="mt-1 text-xs leading-5 text-white/60">{caption}</p>}
      </div>
    </div>
  );
}
