"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useServerEvent } from "@/context/RealtimeContext";
import { toErrorMessage } from "@/lib/api";
import {
  listMyNotifications,
  markNotificationRead,
} from "@/lib/notificationsApi";
import { useApiResource } from "@/lib/useApiResource";
import { formatDateTime } from "@/lib/format";
import type { ObjectId } from "@/lib/types";
import {
  EmptyState,
  ErrorBlock,
  InlineError,
  LoadingBlock,
  PageHeader,
} from "@/components/ui/Feedback";
import { smallButtonClass } from "@/components/ui/controls";

/** GET /api/notifications/mine + PATCH /api/notifications/:id/read. */
export function NotificationsPanel() {
  const { token } = useAuth();
  const [busyId, setBusyId] = useState<ObjectId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const notifications = useApiResource(
    (signal) => listMyNotifications(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  // The server pushes `admin:notification` the moment a broadcast or a support
  // reply is created. Refetch rather than splice the payload in: the event
  // carries only { notificationId, message }, not the full document.
  useServerEvent("admin:notification", () => notifications.reload());

  const handleMarkRead = useCallback(
    async (id: ObjectId) => {
      setBusyId(id);
      setError(null);
      try {
        const updated = await markNotificationRead(id, token);
        notifications.setData((current) =>
          (current ?? []).map((item) =>
            item._id === updated._id ? updated : item,
          ),
        );
      } catch (err) {
        setError(toErrorMessage(err));
      } finally {
        setBusyId(null);
      }
    },
    [token, notifications],
  );

  const list = notifications.data ?? [];
  const unreadCount = list.filter((item) => !item.read).length;

  return (
    <div className="p-8">
      <PageHeader
        title="Notifications"
        description={
          unreadCount
            ? `${unreadCount} unread of ${list.length}.`
            : "Updates from HR and platform admins."
        }
        action={
          <button
            type="button"
            onClick={notifications.reload}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Refresh
          </button>
        }
      />

      {error && (
        <div className="mb-6">
          <InlineError message={error} />
        </div>
      )}

      {notifications.isLoading ? (
        <LoadingBlock label="Loading notifications…" />
      ) : notifications.error ? (
        <ErrorBlock message={notifications.error} onRetry={notifications.reload} />
      ) : list.length === 0 ? (
        <EmptyState
          title="No notifications yet."
          description="Application decisions, scheduled interviews and support replies show up here."
        />
      ) : (
        <div className="space-y-3">
          {list.map((notification) => (
            <div
              key={notification._id}
              className={`flex items-start justify-between gap-4 rounded-2xl border p-5 shadow-sm ${
                notification.read
                  ? "border-gray-100 bg-white"
                  : "border-indigo-100 bg-indigo-50"
              }`}
            >
              <div className="min-w-0">
                <p
                  className={`text-sm ${notification.read ? "text-gray-700" : "font-semibold text-indigo-900"}`}
                >
                  {notification.message}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {formatDateTime(notification.createdAt)}
                </p>
              </div>
              {!notification.read && (
                <button
                  type="button"
                  onClick={() => handleMarkRead(notification._id)}
                  disabled={busyId === notification._id}
                  className={`${smallButtonClass} shrink-0`}
                >
                  {busyId === notification._id ? "…" : "Mark read"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
