/** `/api/notifications` — shared/notification/routes/notification.routes.ts */
import { apiRequest } from "./api";
import type { Notification, ObjectId } from "./types";

/**
 * Anything that changes a notification's read state announces it here.
 *
 * The notifications page and the sidebar's unread badge each fetch their own
 * copy of the list, so marking one read on the page left the badge showing a
 * count that was already stale. Broadcasting from the API call itself — rather
 * than from the screen that happens to make it — means every caller keeps the
 * badge honest without having to remember to.
 */
type NotificationsChangedListener = () => void;

const notificationsChangedListeners = new Set<NotificationsChangedListener>();

export function onNotificationsChanged(
  listener: NotificationsChangedListener,
): () => void {
  notificationsChangedListeners.add(listener);
  return () => notificationsChangedListeners.delete(listener);
}

function announceNotificationsChanged(): void {
  for (const listener of notificationsChangedListeners) listener();
}

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
export async function markNotificationRead(
  id: ObjectId,
  token: string | null,
): Promise<Notification> {
  const updated = await apiRequest<Notification>(
    `/api/notifications/${id}/read`,
    { method: "PATCH", token },
  );
  announceNotificationsChanged();
  return updated;
}
