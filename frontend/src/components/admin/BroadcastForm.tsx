"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { broadcastNotification, listUsers } from "@/lib/adminApi";
import { useApiResource } from "@/lib/useApiResource";
import { USER_ROLES, type UserRole } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/format";
import {
  Card,
  InlineError,
  InlineSuccess,
  PageHeader,
} from "@/components/ui/Feedback";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui/controls";

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
    message.trim().length > 0 && (target === "role" ? Boolean(role) : Boolean(userId));

  return (
    <div className="p-8">
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title="Broadcast Notification"
          description="Push a notification to one user or to everyone with a given role. Recipients see it in their notifications and live over the socket."
        />

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <InlineError message={error} />}
            {success && <InlineSuccess message={success} />}

            <div>
              <span className={labelClass}>Send to</span>
              <div className="flex rounded-full bg-gray-100 p-1">
                {(["role", "user"] as Target[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTarget(option)}
                    className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-all ${
                      target === option
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {option === "role" ? "Everyone with a role" : "A single user"}
                  </button>
                ))}
              </div>
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
                  className={inputClass}
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
                  className={inputClass}
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
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="broadcast-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                placeholder="What should recipients see?"
                className={`${inputClass} resize-none`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={!isValid || isSending}
              className={primaryButtonClass}
            >
              {isSending ? "Sending…" : "Send notification"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
