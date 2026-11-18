"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { badgeClass, type StatusTone } from "@/lib/format";
import { buttonClass } from "@/components/ui/Button";
import { CardHeader, KpiCard, PageHeader } from "@/components/ui/Feedback";
import { tabBarClass, tabClass, tabCountClass, tabListClass } from "@/components/ui/Tabs";

/**
 * Shared dashboard chrome for the candidate, HR and admin portals. Everything
 * here renders the same card / header / badge recipes as `components/ui`, so a
 * screen can mix the two sets freely.
 */

/** A titled card. `aside` renders the slightly denser variant for side columns. */
export function Panel({
  title,
  action,
  children,
  aside = false,
  className = "",
  description,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  aside?: boolean;
  className?: string;
  /** One line under the title. */
  description?: ReactNode;
}) {
  return (
    <section
      className={`min-w-0 rounded-xl border border-line bg-surface shadow-xs ${
        aside ? "p-5" : "p-5 sm:p-6"
      } ${className}`}
    >
      <CardHeader
        title={title}
        description={description}
        action={action}
        className={aside ? "mb-4" : "mb-5"}
      />
      {children}
    </section>
  );
}

/** "View all →" link for a panel header. */
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
      className="inline-flex shrink-0 items-center gap-1 rounded-md text-sm font-medium text-brand-700 transition-colors hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
    >
      {children}
      <ArrowRight aria-hidden="true" className="h-4 w-4" />
    </Link>
  );
}

/** Label-above-value pair for side columns. */
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted">{label}</p>
      <div className="mt-1 text-sm font-medium text-ink">{children}</div>
    </div>
  );
}

/** KPI card — same look as `StatCard`. `iconClass` tints the 40px icon tile. */
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
    <KpiCard
      label={label}
      value={value}
      detail={detail}
      icon={icon}
      iconClassName={iconClass}
    />
  );
}

/**
 * One row of an activity feed: a tinted icon tile, a title with a muted
 * timestamp, a line of detail underneath, and an optional trailing slot.
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
    <div className="flex items-start gap-3 border-b border-line-soft py-3.5 last:border-b-0">
      <span
        aria-hidden="true"
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg [&>svg]:h-4 [&>svg]:w-4 ${iconClass}`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm font-medium text-ink">
          <span className="min-w-0 truncate">{title}</span>
          {meta && (
            <span className="text-xs font-normal text-muted">{meta}</span>
          )}
        </p>
        {detail && <div className="mt-1 text-sm text-muted">{detail}</div>}
      </div>
      {trailing && <div className="shrink-0 self-center">{trailing}</div>}
    </div>
  );
}

const CHIP_TONES: Record<string, StatusTone> = {
  neutral: "neutral",
  brand: "brand",
  amber: "warning",
  emerald: "success",
  rose: "danger",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
};

/** Small status/tag pill — the Badge look. */
export function Chip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?:
    | "neutral"
    | "brand"
    | "amber"
    | "emerald"
    | "rose"
    | "success"
    | "warning"
    | "danger"
    | "info";
}) {
  const resolved = CHIP_TONES[tone] ?? "neutral";
  return <span className={badgeClass(resolved)}>{children}</span>;
}

/** Underline tab strip with counts, for filtering a panel's list. */
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
    <div className={tabBarClass}>
      <div className={tabListClass}>
        {tabs.map((tab) => {
          const isActive = tab.id === value;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(tab.id)}
              className={tabClass(isActive)}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={tabCountClass(isActive)}>{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Horizontal share-of-total bar with a legend, for status breakdowns. */
export function BreakdownBar({
  rows,
  total,
}: {
  rows: { label: string; value: number; className: string }[];
  total: number;
}) {
  return (
    <div className="space-y-4">
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-surface-3">
        {rows.map((row) =>
          row.value > 0 ? (
            <div
              key={row.label}
              className={row.className}
              style={{ width: total ? `${(row.value / total) * 100}%` : "0%" }}
              title={`${row.label}: ${row.value}`}
            />
          ) : null,
        )}
      </div>
      <ul className="space-y-2.5">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2 text-body">
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${row.className}`}
              />
              <span className="truncate">{row.label}</span>
            </span>
            <span className="shrink-0 font-medium tabular-nums text-ink">
              {row.value}
              <span className="ml-1.5 text-xs font-normal text-muted">
                {total ? Math.round((row.value / total) * 100) : 0}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Quiet one-line empty message inside a panel. */
export function EmptyLine({ children }: { children: ReactNode }) {
  return <p className="py-8 text-center text-sm text-muted">{children}</p>;
}

/**
 * The page container every portal screen sits in. The shell supplies the
 * background; this only centres the column and sets gutters + rhythm.
 */
export function PortalPage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * The header row at the top of a portal screen: icon tile, title, one-line
 * subtitle and an optional action. Same component as `PageHeader`.
 */
export function PortalHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <PageHeader icon={icon} title={title} description={subtitle} action={action} />
  );
}

/** The primary action button for a screen header (md primary Button). */
export function HeaderAction({
  href,
  onClick,
  children,
  disabled = false,
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  const className = buttonClass({ variant: "primary", size: "md" });
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}

/** A key/value row for dense definition lists inside a Panel. */
export function DataRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line-soft py-2.5 text-sm last:border-b-0">
      <span className="text-muted">{label}</span>
      <span className="min-w-0 text-right font-medium text-ink">{children}</span>
    </div>
  );
}

