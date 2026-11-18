"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  Mail,
  MailOpen,
  RotateCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useServerEvent } from "@/context/RealtimeContext";
import { toErrorMessage } from "@/lib/api";
import {
  listMyNotifications,
  markNotificationRead,
} from "@/lib/notificationsApi";
import { splitNotification } from "@/lib/notificationText";
import { useApiResource } from "@/lib/useApiResource";
import { formatDateTime, formatDate } from "@/lib/format";
import type { ObjectId } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import {
  Card,
  EmptyState,
  ErrorBlock,
  InlineError,
  LoadingBlock,
} from "@/components/ui/Feedback";
import {
  CountTabs,
  PortalHeader,
  PortalPage,
} from "@/components/dashboard/primitives";

type Filter = "all" | "unread";

/**
 * The notification inbox — GET /api/notifications/mine, PATCH /:id/read.
 *
 * Laid out like a mail client: one line per notification showing the subject
 * and a truncated preview, expanding in place to the full text. The backend
 * stores only a single `message` string, so the subject is derived for display
 * (see lib/notificationText).
 *
 * Opening an unread notification marks it read, which is what the act of
 * reading means — the explicit button stays for marking one read without
 * opening it.
 */
export function NotificationsPanel() {
  const { token } = useAuth();
  const [busyId, setBusyId] = useState<ObjectId | null>(null);
  const [openId, setOpenId] = useState<ObjectId | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
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

  const list = useMemo(() => notifications.data ?? [], [notifications.data]);
  const unreadCount = list.filter((item) => !item.read).length;
  const visible = filter === "unread" ? list.filter((n) => !n.read) : list;

  const handleOpen = (id: ObjectId, isRead: boolean) => {
    const nowOpen = openId === id ? null : id;
    setOpenId(nowOpen);
    if (nowOpen && !isRead) void handleMarkRead(id);
  };

  return (
    <PortalPage>
      <PortalHeader
        icon={<Bell aria-hidden="true" />}
        title="Notifications"
        subtitle={
          unreadCount
            ? `${unreadCount} unread of ${list.length}`
            : "Updates from HR and platform admins"
        }
        action={
          <Button
            variant="secondary"
            leadingIcon={<RotateCw />}
            onClick={() => notifications.reload()}
          >
            Refresh
          </Button>
        }
      />

      {error && <InlineError message={error} />}

      {notifications.isLoading ? (
        <LoadingBlock label="Loading notifications…" />
      ) : notifications.error ? (
        <ErrorBlock
          message={notifications.error}
          onRetry={notifications.reload}
        />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<Bell />}
          title="No notifications yet"
          description="Application decisions, scheduled interviews and support replies show up here."
        />
      ) : (
        <Card padding="none">
          {/* Full-width rule under the tabs: the wrapper draws it, so the
              strip's own rule is dropped. */}
          <div className="border-b border-line px-4 pt-3 sm:px-6 [&>div]:border-b-0">
            <CountTabs
              tabs={[
                { id: "all", label: "All", count: list.length },
                { id: "unread", label: "Unread", count: unreadCount },
              ]}
              value={filter}
              onChange={setFilter}
            />
          </div>

          {visible.length === 0 ? (
            <EmptyState
              bare
              icon={<CheckCheck />}
              title="You're all caught up"
              description="Nothing unread right now."
            />
          ) : (
            <ul className="divide-y divide-line-soft">
              {visible.map((notification) => {
                const { subject, body } = splitNotification(
                  notification.message,
                );
                const isOpen = openId === notification._id;
                const isUnread = !notification.read;
                const isBusy = busyId === notification._id;

                return (
                  <li
                    key={notification._id}
                    className={isUnread ? "bg-brand-50/40" : "bg-surface"}
                  >
                    <div className="flex items-start">
                      <button
                        type="button"
                        onClick={() =>
                          handleOpen(notification._id, notification.read)
                        }
                        aria-expanded={isOpen}
                        className="flex min-w-0 flex-1 items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 sm:gap-4 sm:px-6"
                      >
                        <span className="relative mt-0.5 shrink-0">
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                              isUnread
                                ? "bg-brand-100 text-brand-700"
                                : "bg-surface-3 text-muted"
                            }`}
                          >
                            {isUnread ? (
                              <Mail aria-hidden="true" className="h-4 w-4" />
                            ) : (
                              <MailOpen aria-hidden="true" className="h-4 w-4" />
                            )}
                          </span>
                          {isUnread && (
                            <span
                              role="img"
                              aria-label="Unread"
                              className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-brand-600 ring-2 ring-white"
                            />
                          )}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-3">
                            <span
                              className={`min-w-0 truncate text-sm ${
                                isUnread
                                  ? "font-semibold text-ink"
                                  : "font-medium text-body"
                              }`}
                            >
                              {subject}
                            </span>
                            <span className="hidden shrink-0 text-xs tabular-nums text-muted sm:inline">
                              {formatDateTime(notification.createdAt)}
                            </span>
                          </span>

                          {/* Collapsed: one muted line, clipped with an
                              ellipsis. Expanded: the full text below. */}
                          {body && !isOpen && (
                            <span className="mt-0.5 block truncate text-sm text-muted">
                              {body}
                            </span>
                          )}
                          <span className="mt-1 block text-xs tabular-nums text-muted sm:hidden">
                            {formatDate(notification.createdAt)}
                          </span>
                        </span>

                        <ChevronDown
                          aria-hidden="true"
                          className={`mt-2 h-4 w-4 shrink-0 text-subtle transition-transform duration-200 ${
                            isOpen ? "rotate-180" : "rotate-0"
                          }`}
                        />
                      </button>

                      {isUnread && (
                        <div className="shrink-0 py-4 pr-3 sm:pr-5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkRead(notification._id)}
                            loading={isBusy}
                            leadingIcon={<Check />}
                            title="Mark read"
                          >
                            <span className="sr-only sm:not-sr-only">
                              Mark read
                            </span>
                          </Button>
                        </div>
                      )}
                    </div>

                    {isOpen && (
                      <div className="px-4 pb-4 pl-16 sm:px-6 sm:pl-19">
                        <p className="whitespace-pre-wrap break-words rounded-lg bg-surface-2 p-4 text-sm leading-relaxed text-body">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs tabular-nums text-muted">
                          {formatDateTime(notification.createdAt)}
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}
    </PortalPage>
  );
}
