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
  /**
   * Password accounts start false and must confirm the emailed OTP before they
   * can log in. Google accounts are created already verified.
   * `emailOtp`/`emailOtpExpiresAt` are `select: false` and never reach the client.
   */
  emailVerified: boolean;
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
  emailVerified: boolean;
  /** Only present on GET /api/auth/me. */
  orgId?: ObjectId;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

/**
 * POST /api/auth/signup no longer returns a session — it emails a 6-digit OTP and
 * the session is issued by POST /api/auth/verify-email instead.
 * `devOtp` is echoed back only when the server is not running in production.
 */
export type SignupResult = {
  email: string;
  message: string;
  devOtp?: string;
};

export type ResendOtpResult = {
  message?: string;
  devOtp?: string;
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

/**
 * The organisational interview is now an emailed, token-authenticated invite the
 * candidate opens any time inside a validity window — not a fixed slot. HR sets
 * only how many days the link stays valid.
 */
export type OrgInterviewStatus = "invited" | "completed" | "expired";

export const ORG_INTERVIEW_STATUSES: OrgInterviewStatus[] = [
  "invited",
  "completed",
  "expired",
];

export type OrgInterview = {
  status?: OrgInterviewStatus;
  /** Present to HR only; it is the secret in the candidate's join link. */
  token?: string;
  expiresAt?: string;
  invitedAt?: string;
  completedAt?: string;
  notes?: string;
  /** All-day "add to calendar" link covering the validity window. */
  calendarLink?: string;
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
  /** The structured, HR-graded organisational interview session. */
  orgInterviewSessionId?: ObjectId;
  aiInterview: AiInterview;
  /**
   * Absent until HR sends an invite.
   *
   * The sub-document's fields are all optional and its default is `{}`, so
   * Mongoose's `minimize` strips it from the document entirely — the key is
   * genuinely missing from the API response, not merely empty.
   */
  orgInterview?: OrgInterview;
  createdAt: string;
  updatedAt: string;
};

/* ---------------------------------------------------------------- resume */

export type ResumeStatus = "parsed" | "failed";

/**
 * The Resume document no longer stores extracted text or skills — matching
 * re-extracts from the stored file on demand, so the client only ever sees the
 * file link and the parse status.
 */
export type ResumeUploadResult = {
  fileUrl: string;
  status: ResumeStatus;
};

/** GET /api/resume/mine — null when nothing has been uploaded yet. */
export type MyResume = {
  fileUrl: string;
  status: ResumeStatus;
  updatedAt: string;
} | null;

/* ------------------------------------------------------------- interview */

export type InterviewStatus = "in_progress" | "completed";
export type InterviewResultVerdict = "pass" | "fail";
export type InterviewLevel = "beginner" | "intermediate" | "expert";

export const INTERVIEW_LEVELS: InterviewLevel[] = [
  "beginner",
  "intermediate",
  "expert",
];

/**
 * "candidate" — practice and AI interviews; the candidate sees their own score.
 * "hidden"    — HR-graded organisational interviews; the candidate can answer but
 *               never sees feedback, score or result. The server strips them.
 */
export type InterviewVisibility = "candidate" | "hidden";

/** How the backend classifies a session in GET /api/interview/mine. */
export type InterviewHistoryType = "practice" | "ai_interview" | "organizational";

export const INTERVIEW_HISTORY_TYPES: InterviewHistoryType[] = [
  "practice",
  "ai_interview",
  "organizational",
];

/** Interviews run in two rounds; the backend tags each question with its round. */
export type InterviewRound = 1 | 2;

/**
 * A turn as the *client* sees it. `feedback` and `score` are omitted while the
 * interview is in progress, and permanently for a hidden (HR-graded) session.
 */
export type InterviewTurnView = {
  questionNumber: number;
  question: string;
  answer: string;
  feedback?: string;
  score?: number;
  round: InterviewRound;
};

/** The stored turn, as embedded in the session document HR reads. */
export type InterviewTurn = {
  questionNumber: number;
  question: string;
  answer: string;
  feedback: string;
  /** Normalised out of 10. */
  score: number;
  /** Structured org-interview turns only — HR's exact grading. */
  marksEarned?: number;
  marksPossible?: number;
};

export type InterviewMessage = {
  role: "user" | "assistant";
  content: string;
};

export type CertificatePayment = {
  paid: boolean;
  stripeSessionId?: string;
};

/** A question snapshotted onto a session at start time, with its model answer. */
export type SelectedQuestion = {
  question: string;
  referenceAnswer: string;
  marks: number;
};

/**
 * `buildSessionView()` in interview.service.ts. The branches are discriminated
 * by `status`, so narrowing on it gives the exact fields.
 */
export type InterviewSessionInProgress = {
  sessionId: ObjectId;
  status: "in_progress";
  questionNumber?: number;
  question?: string;
  round?: InterviewRound;
  turns: InterviewTurnView[];
};

export type InterviewSessionCompleted = {
  sessionId: ObjectId;
  status: "completed";
  /** Overall score 0-100; absent for a hidden session. */
  score?: number;
  result?: InterviewResultVerdict;
  feedback?: string;
  turns: InterviewTurnView[];
  certificatePaid: boolean;
  /** Returned only when a visible interview was failed. */
  elearningTips?: string[];
};

export type InterviewSessionView =
  | InterviewSessionInProgress
  | InterviewSessionCompleted;

/** One row of GET /api/interview/mine. */
export type InterviewSessionSummary = {
  sessionId: ObjectId;
  type: InterviewHistoryType;
  /** Present for application-linked sessions. */
  jobTitle?: string;
  level?: InterviewLevel;
  status: InterviewStatus;
  score?: number;
  result?: InterviewResultVerdict;
  createdAt: string;
  updatedAt: string;
};

/** The full document, as embedded in the HR application report. */
export type InterviewSession = {
  _id: ObjectId;
  userId: ObjectId;
  applicationId?: ObjectId;
  level?: InterviewLevel;
  questionSetId?: ObjectId;
  selectedQuestions?: SelectedQuestion[];
  visibility: InterviewVisibility;
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

/* ------------------------------------------ org interview question set */

/**
 * HR's question bank for a job's organisational interview, uploaded as a
 * PDF/DOCX of "Q: / A: / Marks:" blocks rather than typed in one by one.
 * `referenceAnswer` is HR-only and is never sent to a candidate.
 */
export type OrgInterviewQuestion = {
  question: string;
  referenceAnswer: string;
  marks: number;
};

export type OrgInterviewQuestionSet = {
  _id: ObjectId;
  jobId: ObjectId;
  hrId: ObjectId;
  questions: OrgInterviewQuestion[];
  /**
   * How many of the pool each candidate is actually asked, drawn at random and
   * shuffled per candidate. Unset or 0 means "ask the whole pool".
   */
  questionsPerInterview?: number;
  createdAt: string;
  updatedAt: string;
};

/**
 * GET /api/applications/org-interview/:token — public, token-authenticated, so
 * a candidate can open the emailed link without being signed in on that device.
 */
export type OrgInterviewInvite = {
  candidateName?: string;
  jobTitle?: string;
  expiresAt?: string;
  calendarLink?: string;
  /** True once the interview has been started, so the UI can resume it. */
  started: boolean;
};

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

/**
 * Errors are no longer persisted server-side (the ErrorLog model was removed),
 * so the snapshot is just liveness plus the open-ticket count.
 */
export type AdminMonitoringSnapshot = {
  /** mongoose.connection.readyState — 1 means connected. */
  dbState: number;
  uptimeSeconds: number;
  openTicketCount: number;
};

export type BroadcastResult = { recipientCount: number };

/* --------------------------------------------------------- HR aggregates */

/** GET /api/applications/:applicationId/report */
export type ApplicationReport = {
  application: Application;
  /** The AI interview (free-form, model-generated questions). */
  interviewSession: InterviewSession | null;
  /** The organisational interview, graded against HR's question set. */
  orgInterviewSession: InterviewSession | null;
};
