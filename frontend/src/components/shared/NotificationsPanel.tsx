"use client";

import { useCallback, useMemo, useState } from "react";
import { Bell, ChevronDown, Mail, MailOpen } from "lucide-react";
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
import {
  EmptyState,
  ErrorBlock,
  InlineError,
  LoadingBlock,
} from "@/components/ui/Feedback";
import {
  CountTabs,
  HeaderAction,
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
          <HeaderAction onClick={notifications.reload}>Refresh</HeaderAction>
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
          title="No notifications yet."
          description="Application decisions, scheduled interviews and support replies show up here."
        />
      ) : (
        <section className="border border-[#e9eaf0] bg-white">
          <div className="px-3 pt-3">
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
            <p className="py-10 text-center text-[11px] text-[#9698a2]">
              Nothing unread — you&apos;re all caught up.
            </p>
          ) : (
            <ul>
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
                    className={`border-t border-[#f1f1f5] first:border-t-0 ${
                      isUnread ? "bg-[#fbfaff]" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleOpen(notification._id, notification.read)
                        }
                        aria-expanded={isOpen}
                        className="flex min-w-0 flex-1 items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-[#f8f8fb]"
                      >
                        <span
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                            isUnread
                              ? "bg-[#efedfd] text-[#6b5ce7]"
                              : "bg-[#f3f3f6] text-[#9698a2]"
                          }`}
                        >
                          {isUnread ? (
                            <Mail aria-hidden="true" className="h-3.5 w-3.5" />
                          ) : (
                            <MailOpen
                              aria-hidden="true"
                              className="h-3.5 w-3.5"
                            />
                          )}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline gap-2">
                            <span
                              className={`truncate text-[12px] ${
                                isUnread
                                  ? "font-bold text-[#292b35]"
                                  : "font-medium text-[#44464f]"
                              }`}
                            >
                              {subject}
                            </span>
                            {isUnread && (
                              <span
                                aria-label="Unread"
                                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b5ce7]"
                              />
                            )}
                          </span>

                          {/* Collapsed: one muted line, clipped with an
                              ellipsis. Expanded: the full text below. */}
                          {body && !isOpen && (
                            <span className="mt-0.5 block truncate text-[11px] text-[#898b96]">
                              {body}
                            </span>
                          )}
                          {!body && !isOpen && (
                            <span className="mt-0.5 block text-[11px] text-[#9698a2]">
                              {formatDate(notification.createdAt)}
                            </span>
                          )}
                        </span>

                        <span className="ml-2 hidden shrink-0 items-center gap-2 pt-0.5 sm:flex">
                          <span className="text-[10px] text-[#9698a2]">
                            {formatDateTime(notification.createdAt)}
                          </span>
                          <ChevronDown
                            aria-hidden="true"
                            className={`h-3.5 w-3.5 text-[#c9cbd4] transition-transform duration-200 ${
                              isOpen ? "rotate-180" : "rotate-0"
                            }`}
                          />
                        </span>
                      </button>

                      {isUnread && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(notification._id)}
                          disabled={isBusy}
                          className="mr-3 mt-2.5 shrink-0 rounded px-2 py-1 text-[10px] font-semibold text-[#6b5ce7] transition-colors hover:bg-[#efedfd] disabled:opacity-50"
                        >
                          {isBusy ? "…" : "Mark read"}
                        </button>
                      )}
                    </div>

                    {isOpen && (
                      <div className="border-t border-[#f1f1f5] bg-white px-3 py-3 pl-[3.1rem]">
                        <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-[#44464f]">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-[10px] text-[#9698a2]">
                          {formatDateTime(notification.createdAt)}
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </PortalPage>
  );
}
