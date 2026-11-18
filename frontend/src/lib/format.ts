/**
 * Display helpers for the backend's enum values and timestamps. Every label map
 * is keyed by the exact enum the schema stores, so an unhandled value is a
 * compile error rather than a blank cell.
 */
import type {
  ApplicationStatus,
  AuthProvider,
  InterviewHistoryType,
  OrgInterviewStatus,
  InterviewDecision,
  InterviewLevel,
  InterviewResultVerdict,
  InterviewSessionStage,
  InterviewStatus,
  JobStatus,
  ResumeStatus,
  SupportTicketStatus,
  TrackId,
  TurnVerdict,
  UserRole,
} from "./types";

/* -------------------------------------------------------------- dates */

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Formats a Date for an `<input type="datetime-local">` value (local time). */
export function toDateTimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/** `datetime-local` gives a local-time string; the backend wants an ISO stamp. */
export function fromDateTimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}

/** mm:ss for an interview countdown; clamps at zero. */
export function formatCountdown(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  return `${minutes}:${String(safe % 60).padStart(2, "0")}`;
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds % 60}s`;
}

/** Bytes → "820 B" / "245 KB" / "1.4 MB" (binary units, like the OS shows). */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

/* -------------------------------------------------------------- labels */

export const ROLE_LABELS: Record<UserRole, string> = {
  candidate: "Candidate",
  hr: "HR",
  admin: "Admin",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Pending",
  selected: "Selected",
  rejected: "Rejected",
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  open: "Open",
  closed: "Closed",
};

export const INTERVIEW_STATUS_LABELS: Record<InterviewStatus, string> = {
  in_progress: "In progress",
  completed: "Completed",
  expired: "Time expired",
};

export const INTERVIEW_RESULT_LABELS: Record<InterviewResultVerdict, string> = {
  pass: "Pass",
  fail: "Fail",
};

export const INTERVIEW_LEVEL_LABELS: Record<InterviewLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  expert: "Expert",
};

/** Short track names for compact rows; the track picker uses the backend's labels. */
export const TRACK_LABELS: Record<TrackId, string> = {
  frontend: "Frontend",
  backend: "Backend",
  fullstack: "Fullstack",
  data_ai: "Data / AI",
  software_engineer: "Software Engineer",
};

/** "Round 1 · Fullstack" for a practice round, "—" for a job interview. */
export function roundTrackLabel(session: {
  stage?: InterviewSessionStage;
  track?: TrackId;
}): string {
  const round =
    session.stage === "basic" ? "Round 1" : session.stage === "technical" ? "Round 2" : null;
  if (!round) return "—";
  return session.track
    ? `${round} · ${TRACK_LABELS[session.track] ?? session.track}`
    : round;
}

export const TURN_VERDICT_LABELS: Record<TurnVerdict, string> = {
  correct: "Correct",
  partially_correct: "Partially correct",
  incorrect: "Incorrect",
  no_answer: "No answer",
  strong: "Strong",
  adequate: "Adequate",
  weak: "Weak",
  off_topic: "Off topic",
};

export const INTERVIEW_DECISION_LABELS: Record<InterviewDecision, string> = {
  pass: "Pass",
  needs_improvement: "Needs improvement",
  round2_unlocked: "Round 2 unlocked",
  retry_round1: "Retry Round 1",
  shortlist: "Shortlist",
  hold: "Hold",
  reject: "Reject",
};

export const ORG_INTERVIEW_STATUS_LABELS: Record<OrgInterviewStatus, string> = {
  invited: "Invited",
  completed: "Completed",
  expired: "Expired",
  cancelled: "Cancelled",
};

export const INTERVIEW_HISTORY_TYPE_LABELS: Record<
  InterviewHistoryType,
  string
> = {
  practice: "Practice",
  ai_interview: "AI interview",
  organizational: "Organisational",
};

export const RESUME_STATUS_LABELS: Record<ResumeStatus, string> = {
  parsed: "Parsed",
  failed: "Failed",
};

export const AUTH_PROVIDER_LABEL: Record<AuthProvider, string> = {
  password: "Email & password",
  google: "Google",
};

export const SUPPORT_STATUS_LABELS: Record<SupportTicketStatus, string> = {
  open: "Open",
  resolved: "Resolved",
};

/* -------------------------------------------------------------- styles */

/**
 * The six status tones. Every badge, chip and status pill in the product maps
 * onto one of these through `statusTone`, so a status reads the same on every
 * screen (see DESIGN_SPEC "Status → tone mapping").
 */
export type StatusTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "brand"
  | "neutral";

/**
 * Where a status word came from — only needed for the few words that mean
 * different things in different places ("open" job vs "open" support ticket,
 * an "inactive" user vs an "inactive" course).
 */
export type StatusContext = "job" | "support" | "course" | "user";

const STATUS_TONES: Record<string, StatusTone> = {
  // success
  selected: "success",
  open: "success",
  completed: "success",
  pass: "success",
  passed: "success",
  resolved: "success",
  active: "success",
  parsed: "success",
  shortlist: "success",
  shortlisted: "success",
  correct: "success",
  strong: "success",
  round2_unlocked: "success",
  paid: "success",
  // warning
  pending: "warning",
  in_progress: "warning",
  hold: "warning",
  partially_correct: "warning",
  adequate: "warning",
  needs_improvement: "warning",
  estimated: "warning",
  // danger
  rejected: "danger",
  reject: "danger",
  fail: "danger",
  failed: "danger",
  expired: "danger",
  incorrect: "danger",
  weak: "danger",
  no_answer: "danger",
  retry_round1: "danger",
  inactive: "danger",
  deactivated: "danger",
  // info
  invited: "info",
  scheduled: "info",
  practice: "info",
  // brand
  matched: "brand",
  ai_interview: "brand",
  hr: "brand",
  // neutral
  closed: "neutral",
  off_topic: "neutral",
  organizational: "neutral",
  admin: "neutral",
  candidate: "neutral",
  draft: "neutral",
  unknown: "neutral",
};

const hasOwn = (record: object, key: string) =>
  Object.prototype.hasOwnProperty.call(record, key);

/**
 * Tone for any status/enum value ("in_progress", "Rejected", "round2_unlocked"…).
 * Unknown values are neutral. Pass `context` for words with two meanings.
 */
export function statusTone(
  status: string | null | undefined,
  context?: StatusContext,
): StatusTone {
  if (!status) return "neutral";
  const key = status.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (key === "open" && context === "support") return "warning";
  if ((key === "inactive" || key === "draft") && context === "course") {
    return "neutral";
  }
  return hasOwn(STATUS_TONES, key) ? STATUS_TONES[key] : "neutral";
}

/** Shape shared by every badge (ui/Badge renders exactly this). */
export const BADGE_BASE =
  "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";

/** Colour recipe per tone. */
export const BADGE_TONES: Record<StatusTone, string> = {
  success: "bg-success-50 text-success-700 ring-success-200",
  warning: "bg-warning-50 text-warning-700 ring-warning-200",
  danger: "bg-danger-50 text-danger-700 ring-danger-200",
  info: "bg-info-50 text-info-700 ring-info-200",
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
  neutral: "bg-surface-3 text-body ring-line",
};

/** Status dot colour per tone (badges with `dot`, legends, timelines). */
export const BADGE_DOTS: Record<StatusTone, string> = {
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  info: "bg-info-500",
  brand: "bg-brand-500",
  neutral: "bg-subtle",
};

/**
 * Full badge class for a tone: `badgeClass("success")`. A raw colour string is
 * still accepted for old call sites and is appended to the badge shape.
 */
export const badgeClass = (tone: StatusTone | string): string =>
  `${BADGE_BASE} ${hasOwn(BADGE_TONES, tone) ? BADGE_TONES[tone as StatusTone] : tone}`;

const statusBadge = (status: string, context?: StatusContext) =>
  badgeClass(statusTone(status, context));

export const ROLE_BADGE: Record<UserRole, string> = {
  candidate: statusBadge("candidate"),
  hr: statusBadge("hr"),
  admin: statusBadge("admin"),
};

export const APPLICATION_STATUS_BADGE: Record<ApplicationStatus, string> = {
  pending: statusBadge("pending"),
  selected: statusBadge("selected"),
  rejected: statusBadge("rejected"),
};

export const JOB_STATUS_BADGE: Record<JobStatus, string> = {
  open: statusBadge("open", "job"),
  closed: statusBadge("closed", "job"),
};

export const INTERVIEW_STATUS_BADGE: Record<InterviewStatus, string> = {
  in_progress: statusBadge("in_progress"),
  completed: statusBadge("completed"),
  expired: statusBadge("expired"),
};

export const INTERVIEW_RESULT_BADGE: Record<InterviewResultVerdict, string> = {
  pass: statusBadge("pass"),
  fail: statusBadge("fail"),
};

export const TURN_VERDICT_BADGE: Record<TurnVerdict, string> = {
  correct: statusBadge("correct"),
  strong: statusBadge("strong"),
  partially_correct: statusBadge("partially_correct"),
  adequate: statusBadge("adequate"),
  incorrect: statusBadge("incorrect"),
  no_answer: statusBadge("no_answer"),
  weak: statusBadge("weak"),
  off_topic: statusBadge("off_topic"),
};

export const INTERVIEW_DECISION_BADGE: Record<InterviewDecision, string> = {
  pass: statusBadge("pass"),
  round2_unlocked: statusBadge("round2_unlocked"),
  shortlist: statusBadge("shortlist"),
  hold: statusBadge("hold"),
  needs_improvement: statusBadge("needs_improvement"),
  retry_round1: statusBadge("retry_round1"),
  reject: statusBadge("reject"),
};

export const ORG_INTERVIEW_STATUS_BADGE: Record<OrgInterviewStatus, string> = {
  invited: statusBadge("invited"),
  completed: statusBadge("completed"),
  expired: statusBadge("expired"),
  cancelled: badgeClass("danger"),
};

export const INTERVIEW_HISTORY_TYPE_BADGE: Record<
  InterviewHistoryType,
  string
> = {
  practice: statusBadge("practice"),
  ai_interview: statusBadge("ai_interview"),
  organizational: statusBadge("organizational"),
};

export const SUPPORT_STATUS_BADGE: Record<SupportTicketStatus, string> = {
  open: statusBadge("open", "support"),
  resolved: statusBadge("resolved", "support"),
};

/** `isActive` on the User schema. */
export const activeBadge = (isActive: boolean): string =>
  statusBadge(isActive ? "active" : "inactive", "user");

/** matchScore / interview score colouring, 0-100. */
export function scoreColor(score: number): string {
  if (score >= 80) return "text-success-600";
  if (score >= 50) return "text-warning-600";
  return "text-danger-600";
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Turns an audit log `action` ("user.role-change") into "User role change". */
export function humanizeAction(action: string): string {
  const words = action.replace(/[.\-_]/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** True once an invite's validity window has passed, even if the server-side
 * sweeper hasn't yet flipped its status to "expired". */
export function isInviteExpired(expiresAt?: string): boolean {
  return Boolean(expiresAt && new Date(expiresAt).getTime() < Date.now());
}

/** "3 days left" / "expires today" for an org-interview invite window. */
export function timeUntil(expiresAt?: string): string {
  if (!expiresAt) return "—";
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (Number.isNaN(ms)) return "—";
  if (ms <= 0) return "expired";
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"} left`;
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 1) return `${hours} hour${hours === 1 ? "" : "s"} left`;
  return "less than an hour left";
}
