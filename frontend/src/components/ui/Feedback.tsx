"use client";

import type { ReactNode } from "react";

/**
 * Shared feedback + card chrome.
 *
 * These render in the same visual language as `components/dashboard/primitives`:
 * flat white panels on a tinted page, #e9eaf0 hairlines, small uppercase labels
 * and tight tracking on numerals. Props are unchanged from the earlier rounded
 * style, so every existing caller picks the new look up for free.
 */

export function Spinner({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${className} animate-spin rounded-full border-2 border-[#ececf1] border-t-[#6b5ce7]`}
    />
  );
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-[11px] text-[#898b96]">
      <Spinner />
      {label}
    </div>
  );
}

export function ErrorBlock({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="border border-rose-100 bg-rose-50/70 p-5 text-center"
    >
      <p className="text-[12px] font-semibold text-rose-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex h-7 items-center rounded bg-rose-600 px-3 text-[10px] font-semibold text-white transition-colors hover:bg-rose-700"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function InlineError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="border border-rose-100 bg-rose-50/70 px-3 py-2 text-[11px] text-rose-700"
    >
      {message}
    </p>
  );
}

export function InlineSuccess({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-[11px] text-emerald-700">
      {message}
    </p>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-dashed border-[#e3e4ec] bg-white p-10 text-center">
      <p className="text-[12px] font-semibold text-[#292b35]">{title}</p>
      {description && (
        <p className="mx-auto mt-1.5 max-w-md text-[11px] text-[#898b96]">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/**
 * Screen title row. Matches `PortalHeader` in dashboard/primitives — this is the
 * variant for screens that have no icon tile.
 */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex min-h-8 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-[13px] font-semibold text-[#30323b]">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-[10px] text-[#999ba4]">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

const toneAccent: Record<string, string> = {
  brand: "bg-[#efedfd] text-[#6b5ce7]",
  ink: "bg-[#f3f3f6] text-[#4b4e5a]",
  emerald: "bg-[#e7f6f1] text-[#3a9e85]",
  sky: "bg-[#e8f1fd] text-[#4c8bd4]",
  amber: "bg-[#fff4e8] text-[#e29a42]",
};

export function StatCard({
  label,
  value,
  sub,
  icon,
  gradient,
  tone = "brand",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  /** @deprecated legacy gradient string — mapped onto the flat accent tones. */
  gradient?: string;
  tone?: keyof typeof toneAccent;
}) {
  const accent =
    toneAccent[tone] ??
    (gradient?.includes("emerald")
      ? toneAccent.emerald
      : gradient?.includes("sky") || gradient?.includes("blue")
        ? toneAccent.sky
        : gradient?.includes("amber")
          ? toneAccent.amber
          : toneAccent.brand);

  return (
    <article className="flex min-h-[76px] items-center justify-between gap-3 border border-[#ececf1] bg-white px-3 py-3 sm:px-4">
      <div className="min-w-0">
        <p className="truncate text-[9px] font-semibold uppercase tracking-[0.07em] text-[#898b96]">
          {label}
        </p>
        <p className="mt-1 text-[19px] font-bold leading-none tracking-[-0.04em] text-[#292b35]">
          {value}
        </p>
        {sub && <p className="mt-1 truncate text-[9px] text-[#9698a2]">{sub}</p>}
      </div>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center text-[13px] ${accent} [&>svg]:h-4 [&>svg]:w-4`}
      >
        {icon}
      </span>
    </article>
  );
}

export function Card({
  title,
  children,
  action,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 border border-[#e9eaf0] bg-white p-4 sm:p-5 ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex min-h-6 items-center justify-between gap-3">
          {title && (
            <h2 className="text-[13px] font-bold tracking-[-0.01em] text-[#292b35]">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function SkillChips({
  skills,
  emptyLabel = "None",
  tone = "indigo",
}: {
  skills: string[];
  emptyLabel?: string;
  tone?: "indigo" | "gray";
}) {
  if (skills.length === 0) {
    return <span className="text-[10px] text-[#9698a2]">{emptyLabel}</span>;
  }
  const toneClass =
    tone === "indigo"
      ? "bg-[#efedfd] text-[#5a4bd1]"
      : "bg-[#f3f3f6] text-[#686b77]";
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <span
          key={skill}
          className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${toneClass}`}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}
