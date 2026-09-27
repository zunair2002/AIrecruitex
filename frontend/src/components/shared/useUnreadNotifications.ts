"use client";

import { useAuth } from "@/context/AuthContext";
import {
  useApplicationEvents,
  useServerEvent,
} from "@/context/RealtimeContext";
import { listMyNotifications } from "@/lib/notificationsApi";
import { useApiResource } from "@/lib/useApiResource";

/**
 * Unread notification count for the sidebar badge, kept current over the socket.
 *
 * Application events are included because HR actions push a socket event but
 * write no Notification record — refetching on them keeps the badge honest if
 * that ever changes server-side, and costs one cheap request.
 */
export function useUnreadNotifications(): number {
  const { token } = useAuth();
  const notifications = useApiResource(
    (signal) => listMyNotifications(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  useServerEvent("admin:notification", () => notifications.reload());
  useApplicationEvents(() => notifications.reload());

  return (notifications.data ?? []).filter((item) => !item.read).length;
}
