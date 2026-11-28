/**
 * Socket.io wiring for the realtime events the backend pushes.
 *
 * Backend contract (Airecruitx-backend/src/config/socket.ts):
 * - the client emits `join` with its user id
 * - the server puts that socket in the room `user_<userId>`
 * - `emitToUser(userId, event, payload)` targets that room
 *
 * The payload types below are copied from each `emitToUser(...)` call site,
 * so they stay in step with what the server actually sends.
 */
import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "./api";
import type {
  AiInterview,
  ApplicationStatus,
  ObjectId,
  OrgInterview,
  SupportTicketStatus,
} from "./types";

/** admin/notification-broadcast + admin/support-desk */
export type AdminNotificationEvent = {
  notificationId: ObjectId;
  message: string;
};

/** hr/applicant-review — updateApplicationStatus */
export type ApplicationStatusEvent = {
  applicationId: ObjectId;
  jobId: ObjectId;
  status: ApplicationStatus;
};

/** hr/applicant-review — scheduleAiInterview */
export type AiInterviewScheduledEvent = {
  applicationId: ObjectId;
  jobId: ObjectId;
  aiInterview: AiInterview;
  interviewSessionId?: ObjectId;
};

/** hr/applicant-review — scheduleOrgInterview */
export type OrgInterviewEvent = {
  applicationId: ObjectId;
  jobId: ObjectId;
  orgInterview: OrgInterview;
};

/**
 * shared/support — sent to the ticket author and every admin when a ticket is
 * created, gets a message, or changes status. Ids only: refetch the ticket
 * over REST (author-or-admin RBAC) for its content.
 */
export type SupportTicketEvent = {
  ticketId: ObjectId;
  kind: "created" | "message" | "status";
  status: SupportTicketStatus;
  actorId: ObjectId;
  messageId?: string;
};

/** Every server->client event, keyed by the exact string the backend emits. */
export type ServerEvents = {
  "interview:time-up": { sessionId: ObjectId };
  "admin:notification": AdminNotificationEvent;
  "application:status": ApplicationStatusEvent;
  "application:ai-interview-scheduled": AiInterviewScheduledEvent;
  "application:org-interview": OrgInterviewEvent;
  "support:ticket": SupportTicketEvent;
};

export type ServerEventName = keyof ServerEvents;

export const SERVER_EVENTS: ServerEventName[] = [
  "interview:time-up",
  "admin:notification",
  "application:status",
  "application:ai-interview-scheduled",
  "application:org-interview",
  "support:ticket",
];

/**
 * Opens a connection and joins the user's room.
 *
 * `join` is re-sent on every `connect`, not just the first, so the room
 * survives a reconnect after the laptop sleeps or the server restarts.
 */
export function connectSocket(userId: ObjectId): Socket {
  const socket = io(new URL(API_BASE_URL).origin, {
    path: "/socket.io/",
    transports: ["websocket", "polling"],
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10_000,
  });

  socket.on("connect", () => socket.emit("join", userId));
  return socket;
}
