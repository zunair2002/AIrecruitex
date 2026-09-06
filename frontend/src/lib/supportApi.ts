/** `/api/support` — shared/support/routes/support.routes.ts */
import { apiRequest } from "./api";
import type { SupportTicket } from "./types";

/**
 * POST /api/support/tickets — any signed-in role. `status` starts as "open";
 * an admin resolving it writes `adminReply` and notifies the author.
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
