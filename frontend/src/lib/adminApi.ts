/**
 * Every `/api/admin/*` router. All of these are `requireAuth + requireRole("admin")`.
 *
 *   /api/admin/dashboard      admin/dashboard
 *   /api/admin/users          admin/user-management
 *   /api/admin/activity-logs  admin/activity-log
 *   /api/admin/content        admin/content-management
 *   /api/admin/reports        admin/reports
 *   /api/admin/notifications  admin/notification-broadcast
 *   /api/admin/settings       admin/settings
 *   /api/admin/support        admin/support-desk
 *   /api/admin/monitoring     admin/monitoring
 */
import { apiRequest } from "./api";
import type {
  AdminDashboardOverview,
  AdminMonitoringSnapshot,
  AdminReportsSummary,
  Application,
  AuditLog,
  BroadcastResult,
  Job,
  ObjectId,
  Settings,
  SettingsUpdate,
  SupportTicket,
  User,
  UserRole,
} from "./types";

/* ------------------------------------------------------------ dashboard */

/** GET /api/admin/dashboard — platform-wide counts + 10 latest audit entries. */
export function getDashboardOverview(
  token: string | null,
  signal?: AbortSignal,
): Promise<AdminDashboardOverview> {
  return apiRequest<AdminDashboardOverview>("/api/admin/dashboard", {
    token,
    signal,
  });
}

/* ------------------------------------------------------ user management */

/** GET /api/admin/users — `search` matches name OR email, case-insensitive. */
export function listUsers(
  filter: { role?: UserRole | ""; search?: string; isActive?: "true" | "false" | "" },
  token: string | null,
  signal?: AbortSignal,
): Promise<User[]> {
  return apiRequest<User[]>("/api/admin/users", {
    query: filter,
    token,
    signal,
  });
}

/** PATCH /api/admin/users/:userId/active — an admin cannot target themselves. */
export function setUserActive(
  userId: ObjectId,
  isActive: boolean,
  token: string | null,
): Promise<User> {
  return apiRequest<User>(`/api/admin/users/${userId}/active`, {
    method: "PATCH",
    body: { isActive },
    token,
  });
}

/** PATCH /api/admin/users/:userId/role — candidate | hr | admin, not self. */
export function setUserRole(
  userId: ObjectId,
  role: UserRole,
  token: string | null,
): Promise<User> {
  return apiRequest<User>(`/api/admin/users/${userId}/role`, {
    method: "PATCH",
    body: { role },
    token,
  });
}

/** DELETE /api/admin/users/:userId — not self. Answers `{ message }`. */
export function deleteUser(
  userId: ObjectId,
  token: string | null,
): Promise<{ message?: string }> {
  return apiRequest<{ message?: string }>(`/api/admin/users/${userId}`, {
    method: "DELETE",
    token,
  });
}

/* ---------------------------------------------------------- activity log */

/** GET /api/admin/activity-logs — capped at 200, newest first. */
export function listActivityLogs(
  filter: { actorId?: string; action?: string },
  token: string | null,
  signal?: AbortSignal,
): Promise<AuditLog[]> {
  return apiRequest<AuditLog[]>("/api/admin/activity-logs", {
    query: filter,
    token,
    signal,
  });
}

/* --------------------------------------------------- content management */

/** GET /api/admin/content/jobs — every job, `hrId` populated. */
export function listAllJobs(
  token: string | null,
  signal?: AbortSignal,
): Promise<Job[]> {
  return apiRequest<Job[]>("/api/admin/content/jobs", { token, signal });
}

/** PATCH /api/admin/content/jobs/:jobId/close */
export function closeJob(jobId: ObjectId, token: string | null): Promise<Job> {
  return apiRequest<Job>(`/api/admin/content/jobs/${jobId}/close`, {
    method: "PATCH",
    token,
  });
}

/** DELETE /api/admin/content/jobs/:jobId */
export function deleteJob(
  jobId: ObjectId,
  token: string | null,
): Promise<{ message?: string }> {
  return apiRequest<{ message?: string }>(
    `/api/admin/content/jobs/${jobId}`,
    { method: "DELETE", token },
  );
}

/** GET /api/admin/content/applications — `candidateId` and `jobId` populated. */
export function listAllApplications(
  token: string | null,
  signal?: AbortSignal,
): Promise<Application[]> {
  return apiRequest<Application[]>("/api/admin/content/applications", {
    token,
    signal,
  });
}

/* -------------------------------------------------------------- reports */

/** GET /api/admin/reports/summary — aggregate buckets + average match score. */
export function getReportsSummary(
  token: string | null,
  signal?: AbortSignal,
): Promise<AdminReportsSummary> {
  return apiRequest<AdminReportsSummary>("/api/admin/reports/summary", {
    token,
    signal,
  });
}

/* ------------------------------------------------ notification broadcast */

/**
 * POST /api/admin/notifications — send to one `userId` OR every user with a
 * `role`. The backend requires exactly one of them plus a non-empty message.
 */
export function broadcastNotification(
  input: { message: string; userId?: ObjectId; role?: UserRole },
  token: string | null,
): Promise<BroadcastResult> {
  return apiRequest<BroadcastResult>("/api/admin/notifications", {
    method: "POST",
    body: input,
    token,
  });
}

/* ------------------------------------------------------------- settings */

/** GET /api/admin/settings — upserts the singleton "global" document. */
export function getSettings(
  token: string | null,
  signal?: AbortSignal,
): Promise<Settings> {
  return apiRequest<Settings>("/api/admin/settings", { token, signal });
}

/** PATCH /api/admin/settings — only the keys you send are changed. */
export function updateSettings(
  input: SettingsUpdate,
  token: string | null,
): Promise<Settings> {
  return apiRequest<Settings>("/api/admin/settings", {
    method: "PATCH",
    body: input,
    token,
  });
}

/* ---------------------------------------------------------- support desk */

/** GET /api/admin/support — every ticket, `userId` populated, newest first. */
export function listSupportTickets(
  token: string | null,
  signal?: AbortSignal,
): Promise<SupportTicket[]> {
  return apiRequest<SupportTicket[]>("/api/admin/support", { token, signal });
}

/**
 * PATCH /api/admin/support/:ticketId/resolve — `adminReply` is required and
 * is pushed to the ticket author as a notification.
 */
export function resolveSupportTicket(
  ticketId: ObjectId,
  adminReply: string,
  token: string | null,
): Promise<SupportTicket> {
  return apiRequest<SupportTicket>(
    `/api/admin/support/${ticketId}/resolve`,
    { method: "PATCH", body: { adminReply }, token },
  );
}

/* ------------------------------------------------------------ monitoring */

/** GET /api/admin/monitoring — db state, uptime, 20 latest 5xx, open tickets. */
export function getMonitoringSnapshot(
  token: string | null,
  signal?: AbortSignal,
): Promise<AdminMonitoringSnapshot> {
  return apiRequest<AdminMonitoringSnapshot>("/api/admin/monitoring", {
    token,
    signal,
  });
}
