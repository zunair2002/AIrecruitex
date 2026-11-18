import type { ReactNode } from "react";
import {
  BADGE_DOTS,
  BADGE_TONES,
  badgeClass,
  humanizeAction,
  statusTone,
  type StatusContext,
  type StatusTone,
} from "@/lib/format";

/**
 * Status pills. One shape, six tones:
 *
 *   <Badge tone="success">Selected</Badge>
 *   <Badge tone="warning" dot>Pending</Badge>
 *   <StatusBadge status={application.status} />      // tone picked by statusTone()
 *   <span className={APPLICATION_STATUS_BADGE[s]}>…</span>  // same look, from lib/format
 */

export type BadgeTone = StatusTone;

export { BADGE_DOTS, BADGE_TONES, badgeClass, statusTone };
export type { StatusContext, StatusTone };

export function Badge({
  tone = "neutral",
  dot = false,
  icon,
  title,
  className = "",
  children,
}: {
  tone?: BadgeTone;
  /** A small coloured dot before the label. */
  dot?: boolean;
  /** Optional leading icon (sized to 14px). */
  icon?: ReactNode;
  title?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      title={title}
      className={`${badgeClass(tone)} [&_svg]:size-3.5 [&_svg]:shrink-0 ${className}`}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${BADGE_DOTS[tone]}`}
        />
      )}
      {icon}
      {children}
    </span>
  );
}

/**
 * Badge for a raw status value — tone from `statusTone`, label humanised
 * ("in_progress" → "In progress") unless you pass `label`.
 */
export function StatusBadge({
  status,
  label,
  context,
  dot = false,
  className,
}: {
  status: string | null | undefined;
  label?: ReactNode;
  /** Disambiguates words like "open" (job vs support ticket). */
  context?: StatusContext;
  dot?: boolean;
  className?: string;
}) {
  return (
    <Badge tone={statusTone(status, context)} dot={dot} className={className}>
      {label ?? humanizeAction(status || "unknown")}
    </Badge>
  );
}

/** Tone for a 0–100 score, matching `scoreColor` (≥80 success, ≥50 warning). */
export function scoreTone(score: number): BadgeTone {
  if (score >= 80) return "success";
  if (score >= 50) return "warning";
  return "danger";
}
