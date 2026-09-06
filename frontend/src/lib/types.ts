/**
 * TypeScript mirrors of every Mongoose model and controller response shape in
 * Airecruitx-backend. Field names, optionality and enum values are copied
 * verbatim from the backend so the UI can never drift from the schema.
 *
 * Backend source of truth:
 *   shared/user/model/user.model.ts
 *   shared/job/model/job.model.ts
 *   shared/application/model/application.model.ts
 *   candidate/resume/model/resume.model.ts
 *   candidate/interview/model/interviewSession.model.ts
 *   candidate/certificate/model/certificate.model.ts
 *   shared/notification/model/notification.model.ts
 *   shared/support/model/supportTicket.model.ts
 *   admin/activity-log/model/auditLog.model.ts
 *   admin/monitoring/model/errorLog.model.ts
 *   admin/settings/model/settings.model.ts
 */

/** Mongo ObjectId as serialized over JSON. */
export type ObjectId = string;

/** A `ref` field that the backend may or may not have `.populate()`d. */
export type Populated<T> = ObjectId | T;

export function isPopulated<T>(value: Populated<T>): value is T {
  return typeof value === "object" && value !== null;
}

/** Reads a populated ref, or `null` when the backend returned a bare id. */
export function populated<T>(value: Populated<T> | undefined | null): T | null {
  return value && isPopulated(value) ? value : null;
}

/** Reads the `_id` of a ref whether or not it was populated. */
export function refId(
  value: Populated<{ _id: ObjectId }> | undefined | null,
): ObjectId | null {
  if (!value) return null;
  return isPopulated(value) ? value._id : value;
}

/* ------------------------------------------------------------------ user */

export type UserRole = "candidate" | "hr" | "admin";
export type AuthProvider = "password" | "google";

export const USER_ROLES: UserRole[] = ["candidate", "hr", "admin"];
export const AUTH_PROVIDERS: AuthProvider[] = ["password", "google"];

/** Full User document — returned by the admin user-management endpoints. */
export type User = {
  _id: ObjectId;
  firebaseUid?: string;
  name: string;
  email: string;
  role: UserRole;
  orgId?: ObjectId;
  authProvider: AuthProvider;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/** `toPublicUser()` in auth.controller.ts — note `id`, not `_id`. */
export type AuthUser = {
  id: ObjectId;
  name: string;
  email: string;
  role: UserRole;
  authProvider: AuthProvider;
  avatarUrl?: string;
  /** Only present on GET /api/auth/me. */
  orgId?: ObjectId;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

/** Minimal projection used by every `.populate("...Id", "name email")` call. */
export type UserRef = {
  _id: ObjectId;
  name: string;
  email: string;
  /** Only on `.populate(..., "name email role")` (activity logs, dashboard). */
  role?: UserRole;
};

/* ------------------------------------------------------------------- job */

export type JobStatus = "open" | "closed";
export const JOB_STATUSES: JobStatus[] = ["open", "closed"];

export type Job = {
  _id: ObjectId;
  /** Populated with `{ name, email }` by the admin content endpoints. */
  hrId: Populated<UserRef>;
  title: string;
  description: string;
  requiredSkills: string[];
  jdFileUrl?: string;
  jdRawText?: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
};

/** `.populate("jobId", "title description")` on candidate applications. */
export type JobRef = {
  _id: ObjectId;
  title: string;
  /** Absent on the admin `.populate("jobId", "title")` projection. */
  description?: string;
};

/* ----------------------------------------------------------- application */

export type ApplicationStatus = "pending" | "selected" | "rejected";
export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "pending",
  "selected",
  "rejected",
];

export type AiInterview = {
  scheduled: boolean;
  dateTime?: string;
  message?: string;
  calendarLink?: string;
};

export type OrgInterview = {
  scheduled: boolean;
  dateTime?: string;
  location?: string;
  notes?: string;
};

export type Application = {
  _id: ObjectId;
  jobId: Populated<JobRef>;
  candidateId: Populated<UserRef>;
  resumeSnapshotSkills: string[];
  matchScore: number;
  matched: boolean;
  status: ApplicationStatus;
  interviewSessionId?: ObjectId;
  aiInterview: AiInterview;
  orgInterview: OrgInterview;
  createdAt: string;
  updatedAt: string;
};

/* ---------------------------------------------------------------- resume */

export type ResumeStatus = "parsed" | "failed";

/** POST /api/resume/upload returns this projection, not the whole document. */
export type ResumeUploadResult = {
  fileUrl: string;
  skills: string[];
  status: ResumeStatus;
};

/* ------------------------------------------------------------- interview */

export type InterviewStatus = "in_progress" | "completed";
export type InterviewResultVerdict = "pass" | "fail";
export type InterviewLevel = "beginner" | "intermediate" | "expert";

export const INTERVIEW_LEVELS: InterviewLevel[] = [
  "beginner",
  "intermediate",
  "expert",
];

export type InterviewTurn = {
  questionNumber: number;
  question: string;
  answer: string;
  feedback: string;
  /** Scored out of 10 by the model, live, per answer. */
  score: number;
};

export type InterviewMessage = {
  role: "user" | "assistant";
  content: string;
};

export type CertificatePayment = {
  paid: boolean;
  stripeSessionId?: string;
};

/**
 * `toSessionView()` in interview.controller.ts. The two branches are
 * discriminated by `status`, so narrowing on it gives the exact fields.
 */
export type InterviewSessionInProgress = {
  sessionId: ObjectId;
  status: "in_progress";
  questionNumber?: number;
  question?: string;
  turns: InterviewTurn[];
};

export type InterviewSessionCompleted = {
  sessionId: ObjectId;
  status: "completed";
  /** Overall score, 0-100. */
  score?: number;
  result?: InterviewResultVerdict;
  feedback?: string;
  turns: InterviewTurn[];
  certificatePaid: boolean;
};

export type InterviewSessionView =
  | InterviewSessionInProgress
  | InterviewSessionCompleted;

/** The full document, as embedded in the HR application report. */
export type InterviewSession = {
  _id: ObjectId;
  userId: ObjectId;
  applicationId?: ObjectId;
  level?: InterviewLevel;
  status: InterviewStatus;
  messages: InterviewMessage[];
  turns: InterviewTurn[];
  currentQuestionNumber?: number;
  currentQuestion?: string;
  score?: number;
  result?: InterviewResultVerdict;
  feedback?: string;
  certificatePayment: CertificatePayment;
  createdAt: string;
  updatedAt: string;
};

/* ----------------------------------------------------------- certificate */

/** Projection returned by both POST /generate and GET /:sessionId. */
export type CertificateView = {
  certificateUrl: string;
  certId: string;
  score: number;
};

export type CheckoutResult = { checkoutUrl: string };
export type PaymentConfirmation = { paid: boolean };

/* ---------------------------------------------------------- notification */

export type Notification = {
  _id: ObjectId;
  userId: ObjectId;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

/* -------------------------------------------------------- support ticket */

export type SupportTicketStatus = "open" | "resolved";
export const SUPPORT_TICKET_STATUSES: SupportTicketStatus[] = ["open", "resolved"];

export type SupportTicket = {
  _id: ObjectId;
  /** Populated with `{ name, email }` on the admin support desk. */
  userId: Populated<UserRef>;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
};

/* ------------------------------------------------------------ audit log */

export type AuditLog = {
  _id: ObjectId;
  /** Populated with `{ name, email, role }`. */
  actorId: Populated<UserRef>;
  actorRole: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

/* ------------------------------------------------------------- error log */

export type ErrorLog = {
  _id: ObjectId;
  message: string;
  statusCode: number;
  path: string;
  method: string;
  createdAt: string;
};

/* -------------------------------------------------------------- settings */

export type Settings = {
  /** The settings document uses a fixed string `_id` of "global". */
  _id: string;
  siteName: string;
  /** Percent (0-100) an application's matchScore must reach to be `matched`. */
  matchThreshold: number;
  allowSignups: boolean;
  maxResumeSizeMB: number;
  createdAt: string;
  updatedAt: string;
};

export type SettingsUpdate = Partial<
  Pick<Settings, "siteName" | "matchThreshold" | "allowSignups" | "maxResumeSizeMB">
>;

/* ------------------------------------------------------- admin aggregates */

export type AdminDashboardOverview = {
  totalUsers: number;
  totalCandidates: number;
  totalHr: number;
  totalAdmins: number;
  activeUsers: number;
  totalJobs: number;
  openJobs: number;
  totalApplications: number;
  matchedApplications: number;
  totalInterviewSessions: number;
  completedInterviews: number;
  recentActivity: AuditLog[];
};

/** `$group` buckets — `_id` is the grouped field value. */
export type CountBucket<T extends string = string> = {
  _id: T;
  count: number;
};

export type AdminReportsSummary = {
  usersByRole: CountBucket<UserRole>[];
  applicationsByStatus: CountBucket<ApplicationStatus>[];
  jobsByStatus: CountBucket<JobStatus>[];
  averageMatchScore: number;
};

export type AdminMonitoringSnapshot = {
  /** mongoose.connection.readyState — 1 means connected. */
  dbState: number;
  uptimeSeconds: number;
  recentErrors: ErrorLog[];
  openTicketCount: number;
};

export type BroadcastResult = { recipientCount: number };

/* --------------------------------------------------------- HR aggregates */

/** GET /api/applications/:applicationId/report */
export type ApplicationReport = {
  application: Application;
  interviewSession: InterviewSession | null;
};
