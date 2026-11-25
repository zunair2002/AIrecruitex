"use client";

import type { ReactNode } from "react";
import { ScanSearch } from "lucide-react";
import { Spinner } from "@/components/ui/Feedback";

/**
 * Shared chrome for the interview screens (practice / scheduled runner and the
 * emailed organisational interview): a calm, focused column with a progress
 * header, a prominent question card and a time-up notice.
 */

/** The narrow, centred column every interview screen sits in. */
export function InterviewColumn({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * The live-interview layout: the question and answer on the left, the
 * interviewer on the right. Collapses to one column below `lg`, with the
 * interviewer first so a phone still shows who is asking before the question.
 */
export function InterviewStage({
  children,
  aside,
}: {
  children: ReactNode;
  aside: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="order-2 min-w-0 space-y-6 lg:order-1">{children}</div>
        <div className="order-1 lg:order-2">{aside}</div>
      </div>
    </div>
  );
}

/** Title row + "Question n of m" + timer pill + progress bar. */
export function InterviewProgressHeader({
  eyebrow,
  title,
  description,
  progressLabel,
  answered,
  total,
  timer,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  progressLabel: ReactNode;
  answered: number;
  total?: number;
  /** Usually an <InterviewTimer />; renders nothing for untimed sessions. */
  timer?: ReactNode;
}) {
  const percent =
    total && total > 0 ? Math.min(100, Math.round((answered / total) * 100)) : null;

  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-xs font-medium uppercase tracking-wider text-brand-700">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-1 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted">{description}</p>
          )}
        </div>
        {timer}
      </div>
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
          <span className="font-medium text-body">{progressLabel}</span>
          {percent !== null && (
            <span className="text-xs tabular-nums text-muted">
              {answered} of {total} answered
            </span>
          )}
        </div>
        <div
          role="progressbar"
          aria-label="Interview progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent ?? undefined}
          className="h-2 overflow-hidden rounded-full bg-surface-3"
        >
          <div
            className="h-full rounded-full bg-brand-600 transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${percent ?? 0}%` }}
          />
        </div>
      </div>
    </header>
  );
}

/** The current question, big and calm. */
export function QuestionCard({
  eyebrow,
  question,
  badge = "AI",
}: {
  eyebrow: ReactNode;
  question: ReactNode;
  /** Short text in the tile (e.g. "Q3"); defaults to an AI sparkle. */
  badge?: ReactNode;
}) {
  return (
    <section
      aria-label="Current question"
      className="rounded-xl border border-line bg-surface p-5 shadow-xs sm:p-6"
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700 ring-1 ring-inset ring-brand-600/10"
        >
          {badge === "AI" ? <ScanSearch className="h-5 w-5" /> : badge}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            {eyebrow}
          </p>
          <h2 className="mt-1.5 font-display text-lg font-semibold leading-snug tracking-tight text-ink sm:text-xl">
            {question}
          </h2>
        </div>
      </div>
    </section>
  );
}

/** Amber "time's up" banner shown while the server closes the session. */
export function TimeUpNotice({
  title,
  detail,
}: {
  title: ReactNode;
  detail: ReactNode;
}) {
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4"
    >
      <Spinner className="mt-0.5 h-4 w-4" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-brand-700">{title}</p>
        <p className="mt-0.5 text-sm text-brand-600">{detail}</p>
      </div>
    </div>
  );
}
