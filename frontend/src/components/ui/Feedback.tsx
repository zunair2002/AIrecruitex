"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  Inbox,
  RotateCw,
} from "lucide-react";
import { buttonClass } from "./Button";
import { Skeleton } from "./Skeleton";

/**
 * Shared feedback + card chrome: spinners, loading/error/empty states, page
 * headers, KPI cards and cards. `components/dashboard/primitives` renders the
 * same look, so either set can be used on any screen.
 */

/* ------------------------------------------------------------- loading */

export function Spinner({
  className = "h-7 w-7",
  label = "Loading",
}: {
  /** Size classes, e.g. "h-4 w-4". */
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block shrink-0 animate-spin rounded-full border-2 border-brand-100 border-t-brand-600 ${className}`}
    />
  );
}

export function LoadingBlock({
  label = "Loading…",
  variant = "spinner",
  rows = 3,
}: {
  label?: string;
  /** `skeleton` shows placeholder rows instead of a spinner. */
  variant?: "spinner" | "skeleton";
  rows?: number;
}) {
  if (variant === "skeleton") {
    return (
      <div role="status" aria-label={label} className="space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-sm text-muted">
      <Spinner className="h-8 w-8" label={label} />
      <span aria-hidden="true">{label}</span>
    </div>
  );
}

/* ---------------------------------------------------- errors / notices */

export function ErrorBlock({
  message,
  onRetry,
  title,
}: {
  message: string;
  onRetry?: () => void;
  /** Optional bold first line above the message. */
  title?: string;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-start gap-3">
        <CircleAlert
          aria-hidden="true"
          className="mt-0.5 h-5 w-5 shrink-0 text-rose-600"
        />
        <div className="min-w-0">
          {title && <p className="font-semibold text-rose-900">{title}</p>}
          <p className={`break-words ${title ? "mt-0.5" : "font-medium"}`}>
            {message}
          </p>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={buttonClass({
            variant: "secondary",
            size: "sm",
            className: "self-start sm:self-auto",
          })}
        >
          <RotateCw aria-hidden="true" />
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
      className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/15"
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="min-w-0 break-words">{message}</span>
    </p>
  );
}

export function InlineSuccess({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="status"
      className="flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-sm text-brand-700 ring-1 ring-inset ring-brand-600/15"
    >
      <CircleCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="min-w-0 break-words">{message}</span>
    </p>
  );
}

/* ---------------------------------------------------------------- empty */

export function EmptyState({
  title,
  description,
  action,
  icon,
  bare = false,
}: {
  title: string;
  description?: string;
  /** Usually a <Button>. */
  action?: ReactNode;
  /** A lucide icon element; defaults to an inbox. */
  icon?: ReactNode;
  /** Drop the card frame (inside a Card/Panel that already frames it). */
  bare?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-12 text-center ${
        bare ? "" : "rounded-xl border border-line bg-surface shadow-xs"
      }`}
    >
      <span
        aria-hidden="true"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-3 text-subtle [&>svg]:h-6 [&>svg]:w-6"
      >
        {icon ?? <Inbox />}
      </span>
      <p className="mt-4 text-sm font-semibold text-ink">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      )}
      {action && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {action}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- header */

/**
 * The title row at the top of every portal screen: h1 + one-line description
 * on the left, actions on the right (stacked under the title on phones).
 */
export function PageHeader({
  title,
  description,
  action,
  icon,
  backHref,
  backLabel = "Back",
}: {
  title: ReactNode;
  description?: ReactNode;
  /** Primary action(s) — a Button, or a fragment of Buttons. */
  action?: ReactNode;
  /** Optional lucide icon, shown in a 40px brand tile. */
  icon?: ReactNode;
  /** Renders a small "← Back" link above the title. */
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="mb-6">
      {backHref && (
        <Link
          href={backHref}
          className={buttonClass({
            variant: "ghost",
            size: "sm",
            className: "-ml-3 mb-3 text-muted",
          })}
        >
          <ArrowLeft aria-hidden="true" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {icon && (
            <span
              aria-hidden="true"
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/10 sm:flex [&>svg]:h-5 [&>svg]:w-5"
            >
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-muted">{description}</p>
            )}
          </div>
        </div>
        {action && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
            {action}
          </div>
        )}
      </div>
    </header>
  );
}

/* ------------------------------------------------------------ KPI cards */

const TONE_TILES = {
  brand: "bg-brand-50 text-brand-700",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  danger: "bg-danger-50 text-danger-600",
  info: "bg-info-50 text-info-600",
  neutral: "bg-surface-3 text-body",
  // legacy names
  ink: "bg-surface-3 text-body",
  emerald: "bg-success-50 text-success-600",
  sky: "bg-info-50 text-info-600",
  amber: "bg-warning-50 text-warning-600",
  rose: "bg-danger-50 text-danger-600",
} as const;

export type StatTone = keyof typeof TONE_TILES;

function toneFromGradient(gradient?: string): StatTone {
  if (!gradient) return "brand";
  if (gradient.includes("emerald") || gradient.includes("green")) return "success";
  if (gradient.includes("red") || gradient.includes("rose")) return "danger";
  if (gradient.includes("amber") || gradient.includes("orange")) return "warning";
  if (gradient.includes("sky") || gradient.includes("blue")) return "info";
  if (gradient.includes("zinc") || gradient.includes("gray") || gradient.includes("slate")) {
    return "neutral";
  }
  return "brand";
}

/**
 * The KPI card both `StatCard` and `MetricCard` render: label, big number,
 * optional detail line, and a 40px tinted icon tile (hidden on phones, where
 * cards sit two to a row).
 */
export function KpiCard({
  label,
  value,
  detail,
  icon,
  iconClassName = TONE_TILES.brand,
  className = "",
}: {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
  icon?: ReactNode;
  /** Tile colours, e.g. "bg-brand-50 text-brand-600". */
  iconClassName?: string;
  className?: string;
}) {
  return (
    <article
      className={`min-w-0 rounded-xl border border-line bg-surface p-4 shadow-xs sm:p-5 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-1.5 font-display text-xl font-semibold tracking-tight tabular-nums text-ink sm:mt-2 sm:text-3xl">
            {value}
          </p>
        </div>
        {icon && (
          <span
            aria-hidden="true"
            className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg sm:flex [&>svg]:h-5 [&>svg]:w-5 ${iconClassName}`}
          >
            {icon}
          </span>
        )}
      </div>
      {detail && <p className="mt-1 text-xs text-muted">{detail}</p>}
    </article>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  gradient,
  tone,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  /** @deprecated legacy gradient string — mapped onto a tone when `tone` is unset. */
  gradient?: string;
  tone?: StatTone;
}) {
  const resolved = tone ?? toneFromGradient(gradient);
  return (
    <KpiCard
      label={label}
      value={value}
      detail={sub}
      icon={icon}
      iconClassName={TONE_TILES[resolved] ?? TONE_TILES.brand}
    />
  );
}

/* ---------------------------------------------------------------- cards */

/** Title (+ description) on the left, action on the right. */
export function CardHeader({
  title,
  description,
  action,
  className = "mb-5",
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-start justify-between gap-x-4 gap-y-2 ${className}`}
    >
      <div className="min-w-0">
        {title && (
          <h2 className="text-base font-semibold text-ink">{title}</h2>
        )}
        {description && (
          <p className="mt-1 text-sm text-muted">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex shrink-0 items-center gap-2">{action}</div>
      )}
    </div>
  );
}

export function Card({
  title,
  children,
  action,
  className = "",
  description,
  padding = "md",
  as: Tag = "section",
}: {
  title?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  description?: ReactNode;
  /** `none`: children sit flush (tables, lists); the header keeps its padding. */
  padding?: "none" | "sm" | "md";
  as?: "section" | "div" | "article";
}) {
  const hasHeader = Boolean(title || action || description);
  const pad =
    padding === "none" ? "overflow-hidden" : padding === "sm" ? "p-4" : "p-5 sm:p-6";
  return (
    <Tag
      className={`min-w-0 rounded-xl border border-line bg-surface shadow-xs ${pad} ${className}`}
    >
      {hasHeader &&
        (padding === "none" ? (
          <div className="px-5 pt-5 sm:px-6 sm:pt-6">
            <CardHeader title={title} description={description} action={action} className="mb-4" />
          </div>
        ) : (
          <CardHeader
            title={title}
            description={description}
            action={action}
            className={padding === "sm" ? "mb-4" : "mb-5"}
          />
        ))}
      {children}
    </Tag>
  );
}

/* ---------------------------------------------------------------- chips */

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
    return <span className="text-sm text-muted">{emptyLabel}</span>;
  }
  const toneClass =
    tone === "indigo"
      ? "bg-brand-50 text-brand-700 ring-brand-600/20"
      : "bg-surface-3 text-body ring-line";
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <span
          key={skill}
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${toneClass}`}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}
