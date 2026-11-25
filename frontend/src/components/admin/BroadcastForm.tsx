"use client";

import { useState } from "react";
import { BellRing, Megaphone, Send, UserRound, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { broadcastNotification, listUsers } from "@/lib/adminApi";
import { useApiResource } from "@/lib/useApiResource";
import { USER_ROLES, type UserRole } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/Tabs";
import {
  Card,
  InlineError,
  InlineSuccess,
  PageHeader,
} from "@/components/ui/Feedback";
import {
  helpTextClass,
  labelClass,
  selectClass,
  textareaClass,
} from "@/components/ui/controls";
import { PortalPage } from "@/components/dashboard/primitives";

type Target = "role" | "user";

/**
 * POST /api/admin/notifications. The backend requires a non-empty message and
 * exactly one of `role` (all users with it) or `userId` (a single recipient).
 */
export function BroadcastForm() {
  const { token } = useAuth();
  const [target, setTarget] = useState<Target>("role");
  const [role, setRole] = useState<UserRole>("candidate");
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Loaded so a single recipient can be picked by name rather than pasted id.
  const users = useApiResource(
    (signal) => listUsers({}, token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSending(true);
    try {
      const { recipientCount } = await broadcastNotification(
        target === "role"
          ? { message: message.trim(), role }
          : { message: message.trim(), userId },
        token,
      );
      setSuccess(
        `Sent to ${recipientCount} recipient${recipientCount === 1 ? "" : "s"}.`,
      );
      setMessage("");
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  };

  const isValid =
    message.trim().length > 0 &&
    (target === "role" ? Boolean(role) : Boolean(userId));

  const roleCount = users.data?.filter((u) => u.role === role).length;
  const recipient = users.data?.find((u) => u._id === userId);

  return (
    <PortalPage>
      <PageHeader
        icon={<Megaphone />}
        title="Broadcast notification"
        description="Push a notification to one user or to everyone with a given role. Recipients see it in their notifications and live over the socket."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <Card title="Compose" className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <InlineError message={error} />}
            {success && <InlineSuccess message={success} />}

            <div>
              <span className={labelClass}>Send to</span>
              <SegmentedControl
                ariaLabel="Send to"
                fullWidth
                value={target}
                onChange={setTarget}
                options={[
                  { value: "role", label: "Everyone with a role", icon: <Users /> },
                  { value: "user", label: "A single user", icon: <UserRound /> },
                ]}
              />
            </div>

            {target === "role" ? (
              <div>
                <label htmlFor="broadcast-role" className={labelClass}>
                  Role
                </label>
                <select
                  id="broadcast-role"
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                  className={selectClass}
                >
                  {USER_ROLES.map((option) => (
                    <option key={option} value={option}>
                      {ROLE_LABELS[option]}
                      {users.data
                        ? ` (${users.data.filter((u) => u.role === option).length})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label htmlFor="broadcast-user" className={labelClass}>
                  Recipient
                </label>
                <select
                  id="broadcast-user"
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  className={selectClass}
                >
                  <option value="">Select a user…</option>
                  {(users.data ?? []).map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} · {item.email} · {ROLE_LABELS[item.role]}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="broadcast-message" className={labelClass}>
                Message <span className="text-rose-600">*</span>
              </label>
              <textarea
                id="broadcast-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                placeholder="What should recipients see?"
                className={`${textareaClass} resize-y`}
                aria-describedby="broadcast-message-help"
                required
              />
              <p id="broadcast-message-help" className={helpTextClass}>
                Plain text. <span className="tabular-nums">{message.trim().length}</span>{" "}
                characters.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-line-soft pt-5 sm:flex-row sm:justify-end">
              <Button
                type="submit"
                disabled={!isValid}
                loading={isSending}
                leadingIcon={<Send />}
              >
                {isSending ? "Sending…" : "Send notification"}
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Preview" description="How the notification reaches people.">
          <div className="space-y-5">
            <div>
              <p className="text-xs font-medium text-muted">Audience</p>
              {target === "role" ? (
                <p className="mt-1.5 text-sm text-body">
                  Everyone with the{" "}
                  <span className="font-medium text-ink">{ROLE_LABELS[role]}</span>{" "}
                  role
                  {roleCount !== undefined && (
                    <>
                      {" "}·{" "}
                      <span className="tabular-nums">
                        {roleCount} account{roleCount === 1 ? "" : "s"}
                      </span>
                    </>
                  )}
                </p>
              ) : recipient ? (
                <div className="mt-2 flex min-w-0 items-center gap-3">
                  <Avatar name={recipient.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {recipient.name}
                    </p>
                    <p className="truncate text-xs text-muted">{recipient.email}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-1.5 text-sm text-muted">No recipient selected yet.</p>
              )}
            </div>

            <div>
              <p className="text-xs font-medium text-muted">Notification</p>
              <div className="mt-2 flex items-start gap-3 rounded-lg border border-line bg-surface-2 p-3">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 [&>svg]:h-4 [&>svg]:w-4"
                >
                  <BellRing />
                </span>
                <p
                  className={`min-w-0 whitespace-pre-line break-words text-sm ${
                    message.trim() ? "text-body" : "text-muted"
                  }`}
                >
                  {message.trim() || "Your message will appear here."}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PortalPage>
  );
}
