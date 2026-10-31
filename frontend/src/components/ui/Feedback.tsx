"use client";

import type { ReactNode } from "react";

export function Spinner({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${className} animate-spin rounded-full border-2 border-zinc-200 border-t-brand`}
    />
  );
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-zinc-500">
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
      className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center"
    >
      <p className="text-sm font-semibold text-red-800">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
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
      className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {message}
    </p>
  );
}

export function InlineSuccess({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
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
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/80 p-12 text-center ">
      <p className="font-medium text-zinc-700">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

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
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
          {title}
        </h1>
        {description && <p className="mt-1.5 text-zinc-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

const toneSolid: Record<string, string> = {
  brand: "bg-brand",
  ink: "bg-navy",
  emerald: "bg-emerald-600",
  sky: "bg-sky-600",
  amber: "bg-amber-500",
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
  icon: string;
  /** @deprecated kept for callers — maps to solid tone instead of gradient */
  gradient?: string;
  tone?: keyof typeof toneSolid;
}) {
  const solid =
    toneSolid[tone] ??
    (gradient?.includes("emerald")
      ? toneSolid.emerald
      : gradient?.includes("sky") || gradient?.includes("blue")
        ? toneSolid.sky
        : gradient?.includes("amber")
          ? toneSolid.amber
          : toneSolid.brand);

  return (
    <div className="lift-card relative border border-[#e0d6ea] bg-white p-6">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-sm ${solid} text-lg text-white`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-zinc-500">{label}</p>
          <p className="mt-1 font-display text-3xl font-bold tracking-tight text-ink">
            {value}
          </p>
          {sub && (
            <p className="mt-1 text-xs font-semibold text-brand">{sub}</p>
          )}
        </div>
      </div>
    </div>
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
      className={`rounded-2xl border border-zinc-200/90 bg-white p-6 ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && (
            <h2 className="font-display text-lg font-bold tracking-tight text-ink">
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
    return <span className="text-xs text-zinc-400">{emptyLabel}</span>;
  }
  const toneClass =
    tone === "indigo"
      ? "border-brand-light bg-brand-light text-brand-dark"
      : "border-zinc-200 bg-zinc-50 text-zinc-600";
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <span
          key={skill}
          className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${toneClass}`}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}
