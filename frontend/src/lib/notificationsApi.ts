/** `/api/notifications` — shared/notification/routes/notification.routes.ts */
import { apiRequest } from "./api";
import type { Notification, ObjectId } from "./types";

/** GET /api/notifications/mine — newest first, any signed-in role. */
export function listMyNotifications(
  token: string | null,
  signal?: AbortSignal,
): Promise<Notification[]> {
  return apiRequest<Notification[]>("/api/notifications/mine", {
    token,
    signal,
  });
}

/** PATCH /api/notifications/:id/read */
export function markNotificationRead(
  id: ObjectId,
  token: string | null,
): Promise<Notification> {
  return apiRequest<Notification>(`/api/notifications/${id}/read`, {
    method: "PATCH",
    token,
  });
}
