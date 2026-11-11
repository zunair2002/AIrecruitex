"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, GripVertical } from "lucide-react";

/**
 * Shared dashboard chrome for the HR and candidate portals, so both read as one
 * product: flat white panels on a tinted page, hairline borders, small uppercase
 * labels, and tight tracking on numerals.
 */

/** A titled panel. `aside` renders the denser variant used in the side columns. */
export function Panel({
  title,
  action,
  children,
  aside = false,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  aside?: boolean;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 border border-[#e9eaf0] bg-white ${aside ? "p-4" : "p-4 sm:p-5"} ${className}`}
    >
      <div className="mb-4 flex min-h-6 items-center justify-between gap-3">
        <h2 className="flex items-center gap-1.5 text-[13px] font-bold tracking-[-0.01em] text-[#292b35]">
          <GripVertical aria-hidden="true" className="h-3.5 w-3.5 text-[#c9cbd4]" />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PanelLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-[#686b77] transition-colors hover:text-brand"
    >
      {children}
      <ArrowRight aria-hidden="true" className="h-3 w-3" />
    </Link>
  );
}

/** Label-above-value pair, as used down the reference's side columns. */
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.07em] text-[#898b96]">
        {label}
      </p>
      <div className="mt-1 text-[13px] font-medium text-[#292b35]">{children}</div>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  icon,
  iconClass,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  iconClass: string;
}) {
  return (
    <article className="flex min-h-[76px] items-center justify-between gap-3 border border-[#ececf1] bg-white px-3 py-3 sm:px-4">
      <div className="min-w-0">
        <p className="truncate text-[9px] font-semibold uppercase tracking-[0.07em] text-[#898b96]">
          {label}
        </p>
        <p className="mt-1 text-[19px] font-bold leading-none tracking-[-0.04em] text-[#292b35]">
          {value}
        </p>
        <p className="mt-1 truncate text-[9px] text-[#9698a2]">{detail}</p>
      </div>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center ${iconClass}`}
      >
        {icon}
      </span>
    </article>
  );
}

/**
 * One row of a feed: a pastel icon tile, a title with a muted timestamp, and a
 * line of detail underneath — the activity pattern from the reference.
 */
export function FeedRow({
  icon,
  iconClass,
  title,
  meta,
  detail,
  trailing,
}: {
  icon: ReactNode;
  iconClass: string;
  title: string;
  meta?: string;
  detail?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-[#f1f1f5] py-3 last:border-b-0">
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${iconClass}`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2 text-[12px] font-semibold text-[#292b35]">
          <span className="truncate">{title}</span>
          {meta && (
            <span className="text-[10px] font-normal text-[#9698a2]">{meta}</span>
          )}
        </p>
        {detail && (
          <div className="mt-0.5 text-[11px] text-[#686b77]">{detail}</div>
        )}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}

/** Small pill used for statuses and tags. */
export function Chip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "amber" | "emerald" | "rose";
}) {
  const tones = {
    neutral: "bg-[#f3f3f6] text-[#686b77]",
    brand: "bg-brand-light text-brand-dark",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** Tab strip with counts, as across the top of the reference's centre column. */
export function CountTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-[#eceef3] pb-2">
      {tabs.map((tab) => {
        const isActive = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
              isActive
                ? "bg-[#f3f3f6] text-[#292b35]"
                : "text-[#898b96] hover:text-[#292b35]"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`rounded px-1 text-[9px] font-semibold ${
                  isActive ? "bg-white text-[#686b77]" : "bg-[#f3f3f6] text-[#9698a2]"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Horizontal share-of-total bar, for status breakdowns. */
export function BreakdownBar({
  rows,
  total,
}: {
  rows: { label: string; value: number; className: string }[];
  total: number;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex h-2 overflow-hidden rounded bg-[#f3f3f6]">
        {rows.map((row) => (
          <div
            key={row.label}
            className={row.className}
            style={{ width: total ? `${(row.value / total) * 100}%` : "0%" }}
            title={`${row.label}: ${row.value}`}
          />
        ))}
      </div>
      <div className="space-y-1.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between text-[11px]"
          >
            <span className="flex items-center gap-1.5 text-[#686b77]">
              <span className={`h-2 w-2 rounded-sm ${row.className}`} />
              {row.label}
            </span>
            <span className="font-semibold text-[#292b35]">
              {row.value}
              <span className="ml-1 text-[9px] font-normal text-[#9698a2]">
                {total ? Math.round((row.value / total) * 100) : 0}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyLine({ children }: { children: ReactNode }) {
  return (
    <p className="py-6 text-center text-[11px] text-[#9698a2]">{children}</p>
  );
}
