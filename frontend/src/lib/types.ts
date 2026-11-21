/**
 * TypeScript mirrors of every Mongoose model and controller response shape in
 * Airecruitx-backend. Field names, optionality and enum values are copied
 * verbatim from the backend so the UI can never drift from the schema.
 *
 * Backend source of truth:
 * shared/user/model/user.model.ts
 * shared/job/model/job.model.ts
 * shared/application/model/application.model.ts
 * candidate/resume/model/resume.model.ts
 * candidate/interview/model/interviewSession.model.ts
 * candidate/certificate/model/certificate.model.ts
 * shared/notification/model/notification.model.ts
 * shared/support/model/supportTicket.model.ts
 * admin/activity-log/model/auditLog.model.ts
 * admin/monitoring/model/errorLog.model.ts
 * admin/settings/model/settings.model.ts
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
/** Candidate subscription tier — gates premium courses and the daily practice allowance. */
export type UserPlan = "free" | "premium";

export const USER_ROLES: UserRole[] = ["candidate", "hr", "admin"];
export const USER_PLANS: UserPlan[] = ["free", "premium"];

/** The Stripe subscription fields stored on a user (admin user list). */
export type UserSubscriptionSnapshot = {
  status?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
};
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
  headline?: string;
  about?: string;
  interests?: string[];
  /** Missing on older accounts — treat as "free". */
  plan?: UserPlan;
  /** When a Premium plan ends; absent/null = no end date (or not Premium). */
  planExpiresAt?: string | null;
  /** Stripe subscription snapshot, when the candidate has ever subscribed. */
  subscription?: UserSubscriptionSnapshot;
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
  headline?: string;
  about?: string;
  interests?: string[];
  emailVerified: boolean;
  /** Missing on older accounts — treat as "free". */
  plan?: UserPlan;
  /** Only present on GET /api/auth/me. */
  orgId?: ObjectId;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

/**
 * POST /api/auth/signup no longer returns a session — it emails a 6-digit OTP and
 * the session is issued by POST /api/auth/verify-email instead. The code itself
 * is only ever delivered by email.
 */
export type SignupResult = {
  email: string;
  message: string;
};

export type ResendOtpResult = {
  message?: string;
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
export type OrgInterviewStatus = "invited" | "completed" | "expired" | "cancelled";

export const ORG_INTERVIEW_STATUSES: OrgInterviewStatus[] = [
  "invited",
  "completed",
  "expired",
  "cancelled",
];

/** A proctoring event the candidate's browser reported during the org interview. */
export type OrgInterviewViolationType =
  | "tab_hidden"
  | "window_blur"
  | "fullscreen_exit"
  | "camera_off";

export type OrgInterviewViolation = {
  type: OrgInterviewViolationType;
  at: string;
};

export type OrgInterview = {
  status?: OrgInterviewStatus;
  /** Present to HR only; it is the secret in the candidate's join link. */
  token?: string;
  expiresAt?: string;
  invitedAt?: string;
  completedAt?: string;
  /** When the candidate first opened the interview session. */
  startedAt?: string;
  /** Set with status "cancelled" (proctoring policy or HR). */
  cancelledAt?: string;
  cancelReason?: string;
  cancelledBy?: "proctoring" | "hr";
  /** Proctoring violations, oldest first; the 3rd cancels the interview. */
  violations?: OrgInterviewViolation[];
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
  mimeType?: string;
  originalName?: string;
  fileSize?: number;
  createdAt?: string;
  updatedAt?: string;
};

/** GET /api/resume/mine — null when nothing has been uploaded yet. */
export type MyResume = {
  fileUrl: string;
  status: ResumeStatus;
  mimeType?: string;
  originalName?: string;
  fileSize?: number;
  createdAt?: string;
  updatedAt: string;
} | null;

/* ------------------------------------------------------------- interview */

/**
 * "expired" — the session's time limit ran out. The backend finishes the session
 * itself (unanswered questions score 0) and reports it through the same finished
 * branch as "completed", so both must be narrowed together.
 */
export type InterviewStatus = "in_progress" | "completed" | "expired";

/**
 * Per-answer evaluation state. "pending_eval" means the first evaluation failed
 * and is being retried; "estimated" means it never succeeded and the score is a
 * fallback. "failed" is legacy and is excluded from scoring by the backend.
 */
export type EvalStatus =
  | "pending"
  | "pending_eval"
  | "done"
  | "estimated"
  | "failed";
export type InterviewResultVerdict = "pass" | "fail";
export type InterviewLevel = "beginner" | "intermediate" | "expert";

export const INTERVIEW_LEVELS: InterviewLevel[] = [
  "beginner",
  "intermediate",
  "expert",
];

/**
 * "candidate" — practice and AI interviews; the candidate sees their own score.
 * "hidden" — HR-graded organisational interviews; the candidate can answer but
 * never sees feedback, score or result. The server strips them.
 */
export type InterviewVisibility = "candidate" | "hidden";

/** How the backend classifies a session in GET /api/interview/mine. */
export type InterviewHistoryType =
  | "practice"
  | "ai_interview"
  | "organizational";

export const INTERVIEW_HISTORY_TYPES: InterviewHistoryType[] = [
  "practice",
  "ai_interview",
  "organizational",
];

/** Interviews run in two rounds; the backend tags each question with its round. */
export type InterviewRound = 1 | 2;

/**
 * Practice is split into two sessions: Round 1 "basic" and Round 2
 * "technical" (unlocked by the Round 1 score). Job interviews are "combined".
 */
export type InterviewStage = "basic" | "technical";
export type InterviewSessionStage = InterviewStage | "combined";

/** `TRACKS` in ai/topics.ts — the practice track decides the technical topics. */
export type TrackId =
  | "frontend"
  | "backend"
  | "fullstack"
  | "data_ai"
  | "software_engineer";

/** GET /api/interview/tracks */
export type InterviewTrack = {
  id: TrackId;
  label: string;
  topics: string[];
};

/**
 * Per-answer model verdict. Technical answers use correct / partially_correct /
 * incorrect / off_topic; basic answers use strong / adequate / weak / off_topic.
 * Stored as a free string on the backend, so it may also be "".
 */
export type TurnVerdict =
  | "correct"
  | "partially_correct"
  | "incorrect"
  | "no_answer"
  | "strong"
  | "adequate"
  | "weak"
  | "off_topic";

/** `AnswerEvaluation` in ai/ai.service.ts — POST /api/ai/evaluate. */
export type AnswerEvaluation = {
  verdict: TurnVerdict;
  /** Per-criterion 0-10 scores from the model. */
  scores: Record<string, number>;
  feedback: string;
  improvementTip: string;
  weakTopics: string[];
  /** 0-10, the weighted criteria (computed by the backend). */
  questionScore: number;
};

/**
 * candidate report: pass | needs_improvement (Round 1: round2_unlocked | retry_round1)
 * hr report (hidden org interviews): shortlist | hold | reject
 */
export type InterviewDecision =
  | "pass"
  | "needs_improvement"
  | "round2_unlocked"
  | "retry_round1"
  | "shortlist"
  | "hold"
  | "reject";

/** `IInterviewReport` — numbers by the backend, narrative by the model or fallback. */
export type InterviewReport = {
  reportType: "candidate" | "hr";
  /** 0-10 */
  basicScore?: number;
  /** 0-10 */
  technicalScore?: number;
  /** 0-10 (session.score = overallScore * 10) */
  overallScore: number;
  decision: InterviewDecision;
  summary: string;
  strengths: string[];
  areasToImprove?: string[];
  learningPlan?: string[];
  concerns?: string[];
  recommendation?: string;
  weakTopics: string[];
  generatedBy: "model" | "fallback";
  /** Answers scored by fallback because AI evaluation was unavailable. */
  estimatedCount?: number;
};

/**
 * A turn as the *client* sees it. The judgement fields are omitted while the
 * interview is in progress, and permanently for a hidden (HR-graded) session.
 */
export type InterviewTurnView = {
  questionNumber: number;
  question: string;
  answer: string;
  feedback?: string;
  score?: number;
  verdict?: TurnVerdict | "";
  /** Per-criterion 0-10 scores from the model. */
  criteria?: Record<string, number>;
  improvementTip?: string;
  /** True when this answer's score is a fallback estimate, not a model score. */
  estimated?: boolean;
  /** True when the clock ran out before this question was answered (scores 0). */
  unanswered?: boolean;
  stage?: InterviewStage;
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
  stage?: InterviewStage;
  topic?: string;
  verdict?: TurnVerdict | "";
  criteria?: Record<string, number>;
  improvementTip?: string;
  weakTopics?: string[];
  /** The model's original per-criterion scores, before calibration. */
  rawScores?: Record<string, number>;
  evalStatus?: EvalStatus;
  /** True when the clock ran out before this question was answered. */
  unanswered?: boolean;
  /** Structured org-interview turns only — HR's exact grading. */
  marksEarned?: number;
  marksPossible?: number;
  /**
   * Org interviews with warm-ups: this turn's number among the scored pool
   * questions (1-based). `questionNumber` counts the whole interview, warm-ups
   * included, so show this one. Absent on older sessions.
   */
  poolQuestionNumber?: number;
};

/** Org interviews: "warmup" questions are asked first and never scored. */
export type OrgQuestionKind = "warmup" | "pool";

/** One unscored warm-up answer on an org interview (HR report only). */
export type InterviewIntroductionItem = {
  questionNumber: number;
  question: string;
  answer: string;
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
  /** Org interviews: warm-up (unscored) or pool question. Absent on older sessions. */
  kind?: OrgQuestionKind;
};

/**
 * `buildSessionView()` in interview.service.ts. The branches are discriminated
 * by `status`, so narrowing on it gives the exact fields.
 */
export type InterviewSessionInProgress = {
  sessionId: ObjectId;
  status: "in_progress";
  stage?: InterviewSessionStage;
  track?: TrackId;
  questionNumber?: number;
  question?: string;
  /**
   * Length of this session's question list (5 for Round 1, 8 for Round 2).
   * Org interviews: includes the warm-up questions.
   */
  totalQuestions?: number;
  /**
   * Org interviews only (all absent on older sessions): whether the current
   * question is an unscored warm-up or a scored pool question, and its
   * position within that group.
   */
  kind?: OrgQuestionKind;
  warmupNumber?: number;
  totalWarmup?: number;
  poolQuestionNumber?: number;
  totalPoolQuestions?: number;
  round?: InterviewRound;
  turns: InterviewTurnView[];
  /**
   * Timer, on the server's clock. All four are absent when the session has no
   * time limit (job AI interviews, and sessions created before timers existed),
   * so the UI must treat "no timer" as the normal case.
   */
  startedAt?: string;
  expiresAt?: string;
  timeLimitSeconds?: number;
  /** Seconds left when the response was built — count down from this locally. */
  remainingSeconds?: number;
  timeUp?: boolean;
  /** Org interviews: the session was cancelled (proctoring/HR); no question is sent. */
  cancelled?: boolean;
  cancelledAt?: string;
  cancelReason?: string;
};

export type InterviewSessionCompleted = {
  sessionId: ObjectId;
  /** "expired" when the time limit ended it rather than the candidate. */
  status: "completed" | "expired";
  stage?: InterviewSessionStage;
  track?: TrackId;
  /** 1 for practice Round 1, 2 for Round 2, absent for job interviews. */
  round?: InterviewRound;
  /** Overall score 0-100; absent for a hidden session. */
  score?: number;
  result?: InterviewResultVerdict;
  feedback?: string;
  /** Absent for a hidden session. */
  report?: InterviewReport;
  turns: InterviewTurnView[];
  /** Round 1 only: true once it scored enough to unlock Round 2. */
  round2Unlocked?: boolean;
  certificateEligible: boolean;
  certificatePaid: boolean;
  /** True when the session ended because the time limit ran out. */
  timedOut: boolean;
  /** Returned only when a visible interview was failed. */
  elearningTips?: string[];
  /** Org interviews: the backend's closing message for the candidate. */
  closingMessage?: string;
};

export type InterviewSessionView =
  | InterviewSessionInProgress
  | InterviewSessionCompleted;

/**
 * A session is finished when it was completed *or* when its timer expired — the
 * backend reports both through the same branch of `buildSessionView()`. Use this
 * rather than comparing `status` to "completed", which silently drops timed-out
 * sessions back into the "still answering" UI.
 */
export function isFinishedSession(
  session: InterviewSessionView,
): session is InterviewSessionCompleted {
  return session.status === "completed" || session.status === "expired";
}

/** One row of GET /api/interview/mine. */
export type InterviewSessionSummary = {
  sessionId: ObjectId;
  type: InterviewHistoryType;
  /** Present for application-linked sessions. */
  jobTitle?: string;
  level?: InterviewLevel;
  stage?: InterviewSessionStage;
  track?: TrackId;
  status: InterviewStatus;
  score?: number;
  result?: InterviewResultVerdict;
  createdAt: string;
  updatedAt: string;
};

/**
 * GET /api/interview/usage — the candidate's practice-interview allowance.
 * Free: 5 per day, then a 6h wait from the session that hit the limit.
 * Premium: 10 per rolling 24h. Resuming an in-progress session never counts.
 */
export type PracticeUsage = {
  plan: UserPlan;
  limit: number;
  used: number;
  remaining: number;
  /** When a slot frees up next; null while nothing has been used. */
  resetsAt: string | null;
  /** Only while the limit is reached: the earliest time a new session can start. */
  nextAvailableAt: string | null;
};

/* --------------------------------------------------------------- billing */

/** One entry of GET /api/billing/plans. Prices are in the smallest currency unit. */
export type BillingPlan = {
  id: UserPlan;
  name: string;
  priceCents: number;
  currency: string;
  interval: "month" | "year";
  trialDays: number;
  practiceInterviewsPerDay: number;
  premiumCourses: boolean;
};

/** GET /api/billing/plans. `checkoutAvailable` is false when Stripe isn't configured. */
export type BillingPlans = {
  plans: BillingPlan[];
  checkoutAvailable: boolean;
};

/**
 * GET /api/billing/subscription (and the cancel / resume / confirm results).
 * `plan` is the plan in effect right now. `status` is Stripe's subscription
 * status (active, trialing, past_due, canceled, incomplete, unpaid, …) or null
 * when the candidate never subscribed; `source` says where Premium came from.
 */
export type SubscriptionStatus = {
  plan: UserPlan;
  source: "stripe" | "admin" | null;
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  /** When Premium ends; null = no end date. */
  planExpiresAt: string | null;
  canUpgrade: boolean;
  canCancel: boolean;
  canResume: boolean;
};

export type PaymentKind = "subscription" | "certificate";
export type PaymentStatus = "paid" | "failed";

/** GET /api/billing/payments — newest first. */
export type Payment = {
  _id: ObjectId;
  kind: PaymentKind;
  status: PaymentStatus;
  amountCents: number;
  currency: string;
  description: string;
  invoiceNumber?: string;
  periodStart?: string;
  periodEnd?: string;
  hostedInvoiceUrl?: string;
  invoicePdfUrl?: string;
  createdAt: string;
};

/** The full document, as embedded in the HR application report. */
export type InterviewSession = {
  _id: ObjectId;
  userId: ObjectId;
  applicationId?: ObjectId;
  level?: InterviewLevel;
  stage?: InterviewSessionStage;
  track?: TrackId;
  questionSetId?: ObjectId;
  selectedQuestions?: SelectedQuestion[];
  visibility: InterviewVisibility;
  status: InterviewStatus;
  messages: InterviewMessage[];
  /** Org interviews with warm-ups: scored pool questions only. */
  turns: InterviewTurn[];
  /** Org interviews: the unscored warm-up answers. `[]` or absent on older sessions. */
  introduction?: InterviewIntroductionItem[];
  currentQuestionNumber?: number;
  currentQuestion?: string;
  startedAt?: string;
  expiresAt?: string;
  /** The time limit ran out; status is "expired". */
  timedOut?: boolean;
  score?: number;
  result?: InterviewResultVerdict;
  feedback?: string;
  report?: InterviewReport;
  certificatePayment: CertificatePayment;
  /** Org interviews only: set when proctoring (or HR) cancelled it. */
  cancelledAt?: string;
  cancelReason?: string;
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
  /**
   * "invited" while it can still be taken. For "completed" / "cancelled" the
   * link returns only this summary — never the questions, answers or scores.
   */
  status?: OrgInterviewStatus;
  invitedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  /** Proctoring violations so far, and how many cancel the interview. */
  violationCount?: number;
  maxViolations?: number;
};

/** POST /api/applications/org-interview/:token/violation (and /cancel). */
export type OrgInterviewViolationResult = {
  status?: OrgInterviewStatus;
  violationCount: number;
  maxViolations: number;
  cancelled: boolean;
  cancelReason?: string;
};

/* -------------------------------------------------------------- learning */

/**
 * An HR-authored learning course. `topics` must come from the backend's fixed
 * vocabulary (TECH_TOPICS + BASIC_TOPICS + "general_cs"), and `videoUrl` must
 * be HTTPS — both are validated server-side.
 */
export type Course = {
  _id: ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  topics: string[];
  /** Missing on older courses — treat as "free". */
  tier?: CourseTier;
  /**
   * Candidate listing only: a premium course the free-plan candidate can't play.
   * The backend sends it with `videoUrl` emptied.
   */
  locked?: boolean;
  isActive: boolean;
  createdBy: ObjectId;
  createdAt: string;
  updatedAt: string;
};

export type CourseTier = "free" | "premium";

export type CourseInput = {
  title: string;
  description: string;
  videoUrl: string;
  topics: string[];
  tier: CourseTier;
};

/** The exact topic slugs the backend accepts on a course. */
export const COURSE_TECH_TOPICS = [
  "dsa", "oop", "dbms", "os", "networks", "web", "programming",
  "software_engineering", "cloud_devops", "security", "ai_ml", "architecture",
  "big_data", "emerging_tech", "system_design", "general_cs",
] as const;

export const COURSE_BASIC_TOPICS = [
  "self_introduction", "strengths_weaknesses", "pressure_time_management",
  "education_projects", "adaptability", "career_goals", "conflict_resolution",
  "culture_fit", "leadership", "motivation", "team_collaboration", "work_style",
] as const;

export const COURSE_TOPICS: string[] = [
  ...COURSE_TECH_TOPICS,
  ...COURSE_BASIC_TOPICS,
];

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
export const SUPPORT_TICKET_STATUSES: SupportTicketStatus[] = [
  "open",
  "resolved",
];

/**
 * One chat message on a ticket. `authorId` is populated with `{ name, role }`;
 * it is null for a legacy admin reply (or a deleted user). Legacy tickets get
 * synthesized ids like `<ticketId>-opener`.
 */
export type SupportMessage = {
  _id: string;
  authorId: Populated<Pick<UserRef, "_id" | "name"> & { role?: UserRole }> | null;
  authorRole: UserRole;
  body: string;
  createdAt: string;
};

export type SupportTicket = {
  _id: ObjectId;
  /** Populated with `{ name, email, role }` by every support endpoint. */
  userId: Populated<UserRef>;
  subject: string;
  /** The opening message — also `messages[0]`. */
  message: string;
  status: SupportTicketStatus;
  /** Legacy single admin reply — already folded into `messages`. */
  adminReply?: string;
  /** The chat thread, oldest first. Always non-empty. */
  messages: SupportMessage[];
  lastMessageAt: string;
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
  Pick<
    Settings,
    "siteName" | "matchThreshold" | "allowSignups" | "maxResumeSizeMB"
  >
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
