"use client";

import { useAuth } from "@/context/AuthContext";
import {
  useApplicationEvents,
  useServerEvent,
} from "@/context/RealtimeContext";
import {
  listMyNotifications,
  onNotificationsChanged,
} from "@/lib/notificationsApi";
import { useApiResource } from "@/lib/useApiResource";
import { useEffect } from "react";

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

  // Marking one read anywhere in the app refreshes the badge, so it never
  // keeps showing a count the user has already cleared.
  // `reload` is stable (useCallback with no deps); the wrapper object around
  // it is not, so depend on the function to avoid resubscribing every render.
  const reload = notifications.reload;
  useEffect(() => onNotificationsChanged(reload), [reload]);
  useApplicationEvents(() => notifications.reload());

  return (notifications.data ?? []).filter((item) => !item.read).length;
}
