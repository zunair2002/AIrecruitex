"use client";

import { Mic, Volume2 } from "lucide-react";

/**
 * The interviewer panel that sits beside the question during a live interview.
 *
 * A face to address makes the session read as an interview rather than a form.
 * It is drawn rather than photographed on purpose: a stock photo of a person
 * who does not exist would imply a real human is watching, and the candidate
 * is talking to a model.
 *
 * The figure reacts to the two states the candidate needs to track — the
 * interviewer reading the question aloud, and the mic being live — so the
 * cue is visible without reading the small print under the textarea.
 */
export function InterviewerAvatar({
  speaking = false,
  listening = false,
  name = "AiRecruitex Interviewer",
  caption,
}: {
  speaking?: boolean;
  listening?: boolean;
  name?: string;
  caption?: string;
}) {
  const state = speaking
    ? { label: "Speaking", tone: "text-brand-700", dot: "bg-brand-500" }
    : listening
      ? { label: "Listening", tone: "text-emerald-700", dot: "bg-emerald-500" }
      : { label: "Ready", tone: "text-muted", dot: "bg-subtle" };

  return (
    <aside
      aria-label="Interviewer"
      className="rounded-xl border border-line bg-surface p-5 shadow-xs sm:p-6 lg:sticky lg:top-6"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          {/* Halo pulses only while the interviewer is actually speaking. */}
          <span
            aria-hidden="true"
            className={`absolute inset-0 rounded-full ${
              speaking
                ? "animate-ping bg-brand-500/20"
                : listening
                  ? "bg-emerald-500/10"
                  : "bg-transparent"
            }`}
          />
          <AvatarFigure speaking={speaking} listening={listening} />
        </div>

        <p className="mt-4 text-sm font-semibold text-ink">{name}</p>

        <p
          className={`mt-1 inline-flex items-center gap-1.5 text-xs font-medium ${state.tone}`}
        >
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${state.dot}`}
          />
          {state.label}
        </p>

        {caption && (
          <p className="mt-4 border-t border-line-soft pt-4 text-xs leading-relaxed text-muted">
            {caption}
          </p>
        )}

        <div className="mt-5 grid w-full grid-cols-2 gap-2 border-t border-line-soft pt-4 text-left">
          <Hint
            icon={<Volume2 aria-hidden="true" className="h-3.5 w-3.5" />}
            label="Read aloud"
            detail="Hear the question"
          />
          <Hint
            icon={<Mic aria-hidden="true" className="h-3.5 w-3.5" />}
            label="Dictate"
            detail="Speak your answer"
          />
        </div>
      </div>
    </aside>
  );
}

function Hint({
  icon,
  label,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-3 text-muted">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium text-ink">{label}</span>
        <span className="block text-[11px] text-muted">{detail}</span>
      </span>
    </div>
  );
}

/**
 * A flat, brand-coloured portrait. Inline SVG so it inherits the theme tokens
 * and costs no extra request, and `currentColor` is avoided in favour of the
 * palette so it reads the same in every portal.
 */
function AvatarFigure({
  speaking,
  listening,
}: {
  speaking: boolean;
  listening: boolean;
}) {
  const accent = speaking ? "#6b5ce7" : listening ? "#3a9e85" : "#8b8fa3";
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-hidden="true"
      className="relative h-28 w-28 sm:h-32 sm:w-32"
    >
      <circle cx="60" cy="60" r="58" fill="#f4f1fb" />
      <circle cx="60" cy="60" r="58" fill="none" stroke="#e0d6ea" strokeWidth="2" />
      {/* shoulders */}
      <path d="M22 112a38 30 0 0 1 76 0z" fill="#4a148c" />
      <path d="M52 86h16v12a8 8 0 0 1-16 0z" fill="#e8d7c3" />
      {/* collar */}
      <path d="M52 92l8 9 8-9 6 4-14 15-14-15z" fill="#ffffff" />
      {/* head */}
      <ellipse cx="60" cy="62" rx="23" ry="26" fill="#f0ddc8" />
      {/* hair */}
      <path
        d="M37 60c0-15 10-25 23-25s23 10 23 25c0-8-6-12-23-12s-23 4-23 12z"
        fill="#2e2a35"
      />
      {/* eyes */}
      <circle cx="51" cy="60" r="2.6" fill="#2e2a35" />
      <circle cx="69" cy="60" r="2.6" fill="#2e2a35" />
      {/* mouth: open while speaking, a level line otherwise */}
      {speaking ? (
        <ellipse cx="60" cy="74" rx="6" ry="4.5" fill="#8a5a5a" />
      ) : (
        <path
          d="M54 74q6 4 12 0"
          stroke="#8a5a5a"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {/* headset — signals an interview session without needing a caption */}
      <path
        d="M35 62a25 25 0 0 1 50 0"
        stroke={accent}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="30" y="60" width="9" height="15" rx="4.5" fill={accent} />
      <rect x="81" y="60" width="9" height="15" rx="4.5" fill={accent} />
      <path
        d="M35 75v6a6 6 0 0 0 6 6h6"
        stroke={accent}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="49" cy="87" r="3.2" fill={accent} />
    </svg>
  );
}
