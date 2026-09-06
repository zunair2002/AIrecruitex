"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import {
  deleteUser,
  listUsers,
  setUserActive,
  setUserRole,
} from "@/lib/adminApi";
import { useApiResource } from "@/lib/useApiResource";
import { USER_ROLES, type ObjectId, type UserRole } from "@/lib/types";
import {
  AUTH_PROVIDER_LABEL,
  ROLE_LABELS,
  activeBadge,
  formatDate,
  initials,
} from "@/lib/format";
import {
  EmptyState,
  ErrorBlock,
  InlineError,
  LoadingBlock,
  PageHeader,
} from "@/components/ui/Feedback";
import {
  compactInputClass,
  dangerButtonClass,
  smallButtonClass,
} from "@/components/ui/controls";

/**
 * GET /api/admin/users with its three query filters, plus the three mutations:
 * PATCH /:userId/active, PATCH /:userId/role, DELETE /:userId.
 * The backend refuses all three against the caller's own account, so those
 * controls are disabled on the signed-in admin's row.
 */
export function UserManagement() {
  const { user: currentUser, token } = useAuth();
  const [role, setRole] = useState<UserRole | "">("");
  const [isActive, setIsActive] = useState<"true" | "false" | "">("");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [busyId, setBusyId] = useState<ObjectId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const users = useApiResource(
    (signal) =>
      listUsers({ role, isActive, search: appliedSearch }, token, signal),
    [token, role, isActive, appliedSearch],
    { enabled: Boolean(token) },
  );

  const runMutation = useCallback(
    async (userId: ObjectId, action: () => Promise<unknown>) => {
      setBusyId(userId);
      setError(null);
      try {
        await action();
        users.reload();
      } catch (err) {
        setError(toErrorMessage(err));
      } finally {
        setBusyId(null);
      }
    },
    [users],
  );

  const handleDelete = (userId: ObjectId, name: string) => {
    if (
      !window.confirm(
        `Permanently delete ${name}? This removes the user account and cannot be undone.`,
      )
    ) {
      return;
    }
    runMutation(userId, () => deleteUser(userId, token));
  };

  const list = users.data ?? [];

  return (
    <div className="p-8">
      <PageHeader
        title="User Management"
        description="Every account on the platform. Role and active-status changes are written to the audit log."
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setAppliedSearch(search.trim());
        }}
        className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name or email…"
          className={`${compactInputClass} flex-1`}
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as UserRole | "")}
          className={compactInputClass}
        >
          <option value="">All roles</option>
          {USER_ROLES.map((option) => (
            <option key={option} value={option}>
              {ROLE_LABELS[option]}
            </option>
          ))}
        </select>
        <select
          value={isActive}
          onChange={(event) =>
            setIsActive(event.target.value as "true" | "false" | "")
          }
          className={compactInputClass}
        >
          <option value="">Active &amp; inactive</option>
          <option value="true">Active only</option>
          <option value="false">Deactivated only</option>
        </select>
        <button type="submit" className={smallButtonClass}>
          Search
        </button>
      </form>

      {error && (
        <div className="mb-6">
          <InlineError message={error} />
        </div>
      )}

      {users.isLoading ? (
        <LoadingBlock label="Loading users…" />
      ) : users.error ? (
        <ErrorBlock message={users.error} onRetry={users.reload} />
      ) : list.length === 0 ? (
        <EmptyState title="No users match these filters." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">User</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Role</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Sign-in</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Joined</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => {
                  const isSelf = currentUser?.id === item._id;
                  const isBusy = busyId === item._id;
                  return (
                    <tr
                      key={item._id}
                      className="border-b border-gray-50 transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                            {initials(item.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">
                              {item.name}
                              {isSelf && (
                                <span className="ml-2 text-xs font-normal text-gray-400">
                                  (you)
                                </span>
                              )}
                            </p>
                            <p className="truncate text-xs text-gray-500">
                              {item.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={item.role}
                          onChange={(event) =>
                            runMutation(item._id, () =>
                              setUserRole(
                                item._id,
                                event.target.value as UserRole,
                                token,
                              ),
                            )
                          }
                          disabled={isSelf || isBusy}
                          className={compactInputClass}
                        >
                          {USER_ROLES.map((option) => (
                            <option key={option} value={option}>
                              {ROLE_LABELS[option]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {AUTH_PROVIDER_LABEL[item.authProvider]}
                      </td>
                      <td className="px-6 py-4">
                        <span className={activeBadge(item.isActive)}>
                          {item.isActive ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              runMutation(item._id, () =>
                                setUserActive(item._id, !item.isActive, token),
                              )
                            }
                            disabled={isSelf || isBusy}
                            className={smallButtonClass}
                          >
                            {item.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item._id, item.name)}
                            disabled={isSelf || isBusy}
                            className={dangerButtonClass}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
