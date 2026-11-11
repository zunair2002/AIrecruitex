"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
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
    <section className="border border-[#e9eaf0] bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-light">
          <GraduationCap aria-hidden="true" className="h-4 w-4 text-brand" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[14px] font-bold tracking-[-0.01em] text-[#292b35]">
            Brush up, then try again
          </h2>
          <p className="mt-1 text-[12px] text-[#686b77]">
            This round didn&apos;t pass. Here&apos;s what to work on before your
            next attempt.
          </p>

          {weakTopics.length > 0 && (
            <div className="mt-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.07em] text-[#898b96]">
                Weak topics
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {weakTopics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded bg-[#f3f3f6] px-2 py-0.5 text-[10px] font-medium text-[#686b77]"
                  >
                    {topic.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tips.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {tips.map((tip) => (
                <li
                  key={tip}
                  className="flex gap-2 text-[12px] leading-5 text-[#4a4c57]"
                >
                  <span aria-hidden="true" className="text-brand">
                    •
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}

          <Link
            href={learningHref}
            className="mt-4 inline-flex items-center gap-1.5 rounded bg-brand px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <GraduationCap aria-hidden="true" className="h-3.5 w-3.5" />
            Go to courses
          </Link>
        </div>
      </div>
    </section>
  );
}
