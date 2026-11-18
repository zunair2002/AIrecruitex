"use client";

import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { badgeClass } from "@/lib/format";
import type { InterviewReport } from "@/lib/types";

/**
 * Shown when an interview is failed: the model's tips plus a route into the
 * learning courses, so "try again" has something concrete in front of it.
 *
 * `weakTopics` comes from the report and matches the topic vocabulary courses
 * are tagged with, so it is passed through as a filter on the learning page.
 */
export function FailedInterviewNextSteps({
  tips,
  report,
}: {
  tips: string[];
  report?: InterviewReport;
}) {
  const weakTopics = report?.weakTopics ?? [];
  const learningHref = weakTopics.length
    ? `/candidate/learning?topic=${encodeURIComponent(weakTopics[0])}`
    : "/candidate/learning";

  return (
    <section className="min-w-0 rounded-xl border border-line bg-surface p-5 shadow-xs sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"
        >
          <GraduationCap className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-ink">
            Brush up, then try again
          </h2>
          <p className="mt-1 text-sm text-muted">
            This round didn&apos;t pass. Here&apos;s what to work on before your
            next attempt.
          </p>

          {weakTopics.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                Weak topics
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {weakTopics.map((topic) => (
                  <span key={topic} className={badgeClass("warning")}>
                    {topic.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tips.length > 0 && (
            <ul className="mt-4 space-y-2">
              {tips.map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-3 text-sm leading-6 text-body"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
                  />
                  <span className="min-w-0">{tip}</span>
                </li>
              ))}
            </ul>
          )}

          <Button
            href={learningHref}
            leadingIcon={<GraduationCap aria-hidden="true" />}
            className="mt-5 w-full sm:w-auto"
          >
            Go to courses
          </Button>
        </div>
      </div>
    </section>
  );
}
