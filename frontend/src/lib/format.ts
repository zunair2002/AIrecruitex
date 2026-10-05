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
  InterviewLevel,
  InterviewResultVerdict,
  InterviewStatus,
  JobStatus,
  ResumeStatus,
  SupportTicketStatus,
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

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds % 60}s`;
}

export function formatFileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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

export const ORG_INTERVIEW_STATUS_LABELS: Record<OrgInterviewStatus, string> = {
  invited: "Invited",
  completed: "Completed",
  expired: "Expired",
};

export const INTERVIEW_HISTORY_TYPE_LABELS: Record<InterviewHistoryType, string> = {
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

const BADGE_BASE =
  "inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full";

export const badgeClass = (tone: string) => `${BADGE_BASE} ${tone}`;

export const ROLE_BADGE: Record<UserRole, string> = {
  candidate: badgeClass("bg-blue-50 text-blue-700"),
  hr: badgeClass("bg-indigo-50 text-indigo-700"),
  admin: badgeClass("bg-purple-50 text-purple-700"),
};

export const APPLICATION_STATUS_BADGE: Record<ApplicationStatus, string> = {
  pending: badgeClass("bg-amber-50 text-amber-700"),
  selected: badgeClass("bg-emerald-50 text-emerald-700"),
  rejected: badgeClass("bg-red-50 text-red-700"),
};

export const JOB_STATUS_BADGE: Record<JobStatus, string> = {
  open: badgeClass("bg-emerald-50 text-emerald-700"),
  closed: badgeClass("bg-gray-100 text-gray-600"),
};

export const INTERVIEW_STATUS_BADGE: Record<InterviewStatus, string> = {
  in_progress: badgeClass("bg-amber-50 text-amber-700"),
  completed: badgeClass("bg-emerald-50 text-emerald-700"),
};

export const INTERVIEW_RESULT_BADGE: Record<InterviewResultVerdict, string> = {
  pass: badgeClass("bg-emerald-50 text-emerald-700"),
  fail: badgeClass("bg-red-50 text-red-700"),
};

export const ORG_INTERVIEW_STATUS_BADGE: Record<OrgInterviewStatus, string> = {
  invited: badgeClass("bg-amber-50 text-amber-700"),
  completed: badgeClass("bg-emerald-50 text-emerald-700"),
  expired: badgeClass("bg-gray-100 text-gray-600"),
};

export const INTERVIEW_HISTORY_TYPE_BADGE: Record<InterviewHistoryType, string> = {
  practice: badgeClass("bg-sky-50 text-sky-700"),
  ai_interview: badgeClass("bg-indigo-50 text-indigo-700"),
  organizational: badgeClass("bg-purple-50 text-purple-700"),
};

export const SUPPORT_STATUS_BADGE: Record<SupportTicketStatus, string> = {
  open: badgeClass("bg-amber-50 text-amber-700"),
  resolved: badgeClass("bg-emerald-50 text-emerald-700"),
};

/** `isActive` on the User schema. */
export const activeBadge = (isActive: boolean): string =>
  badgeClass(
    isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600",
  );

/** matchScore / interview score colouring, 0-100. */
export function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
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
 *  sweeper hasn't yet flipped its status to "expired". */
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
