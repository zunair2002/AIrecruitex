/** `/api/support` — shared/support/routes/support.routes.ts */
import { apiRequest } from "./api";
import type { ObjectId, SupportTicket } from "./types";

/**
 * POST /api/support/tickets — any signed-in role. `status` starts as "open"
 * and `message` becomes the first chat message. Admins are notified.
 */
export function createSupportTicket(
  input: { subject: string; message: string },
  token: string | null,
): Promise<SupportTicket> {
  return apiRequest<SupportTicket>("/api/support/tickets", {
    method: "POST",
    body: input,
    token,
  });
}

/** GET /api/support/tickets — the signed-in user's own tickets, most recently active first. */
export function listMySupportTickets(
  token: string | null,
  signal?: AbortSignal,
): Promise<SupportTicket[]> {
  return apiRequest<SupportTicket[]>("/api/support/tickets", { token, signal });
}

/** GET /api/support/tickets/:id — the ticket's author or an admin (403 otherwise). */
export function getSupportTicket(
  ticketId: ObjectId,
  token: string | null,
  signal?: AbortSignal,
): Promise<SupportTicket> {
  return apiRequest<SupportTicket>(`/api/support/tickets/${ticketId}`, {
    token,
    signal,
  });
}

/**
 * POST /api/support/tickets/:id/messages — the author or an admin (403
 * otherwise). Returns the whole updated ticket. The author replying on a
 * resolved ticket reopens it.
 */
export function postSupportMessage(
  ticketId: ObjectId,
  body: string,
  token: string | null,
): Promise<SupportTicket> {
  return apiRequest<SupportTicket>(`/api/support/tickets/${ticketId}/messages`, {
    method: "POST",
    body: { body },
    token,
  });
}
