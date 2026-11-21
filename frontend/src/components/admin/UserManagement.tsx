"use client";

import { useCallback, useState } from "react";
import { Crown, Search, Trash2, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import {
  deleteUser,
  listUsers,
  setUserActive,
  setUserRole,
} from "@/lib/adminApi";
import { setUserPlan } from "@/lib/billingApi";
import { useApiResource } from "@/lib/useApiResource";
import {
  USER_ROLES,
  type ObjectId,
  type User,
  type UserPlan,
  type UserRole,
} from "@/lib/types";
import {
  AUTH_PROVIDER_LABEL,
  ROLE_LABELS,
  activeBadge,
  formatDate,
} from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog, Dialog } from "@/components/ui/Dialog";
import { PlanBadge, planOf } from "@/components/candidate/plan/PlanBits";
import {
  Card,
  EmptyState,
  ErrorBlock,
  InlineError,
  LoadingBlock,
  PageHeader,
} from "@/components/ui/Feedback";
import {
  compactInputClass,
  helpTextClass,
  inputClass,
  labelClass,
  selectClass,
} from "@/components/ui/controls";
import {
  stackedItemClass,
  tableClass,
  tableScrollClass,
  tdClass,
  thClass,
  trClass,
} from "@/components/ui/table";
import { PortalPage } from "@/components/dashboard/primitives";
import { ToggleSwitch } from "./SettingsForm";

/**
 * GET /api/admin/users with its three query filters, plus the mutations:
 * PATCH /:userId/active, PATCH /:userId/role, DELETE /:userId, and for
 * candidates PATCH /:userId/plan (Free / Premium with an optional end date).
 * The backend refuses active/role/delete against the caller's own account, so
 * those controls are disabled on the signed-in admin's row.
 */
export function UserManagement() {
  const { user: currentUser, token } = useAuth();
  const [role, setRole] = useState<UserRole | "">("");
  const [isActive, setIsActive] = useState<"true" | "false" | "">("");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [busyId, setBusyId] = useState<ObjectId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: ObjectId;
    name: string;
  } | null>(null);

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
    setPendingDelete({ id: userId, name });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { id } = pendingDelete;
    await runMutation(id, () => deleteUser(id, token));
    setPendingDelete(null);
  };

  const changeRole = (item: User, next: UserRole) =>
    runMutation(item._id, () => setUserRole(item._id, next, token));

  const toggleActive = (item: User) =>
    runMutation(item._id, () => setUserActive(item._id, !item.isActive, token));

  const [planTarget, setPlanTarget] = useState<User | null>(null);

  const list = users.data ?? [];

  return (
    <PortalPage>
      <PageHeader
        icon={<Users />}
        title="User management"
        description="Every account on the platform. Role and active-status changes are written to the audit log."
      />

      {error && <InlineError message={error} />}

      <Card padding="none">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setAppliedSearch(search.trim());
          }}
          className="flex flex-col gap-3 border-b border-line-soft p-4 sm:flex-row sm:flex-wrap sm:items-center sm:px-6"
        >
          <div className="relative w-full sm:min-w-56 sm:flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email…"
              aria-label="Search users by name or email"
              className={`${inputClass} pl-9`}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole | "")}
              aria-label="Filter by role"
              className={`${selectClass} sm:w-36`}
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
              aria-label="Filter by status"
              className={`${selectClass} sm:w-44`}
            >
              <option value="">Active &amp; inactive</option>
              <option value="true">Active only</option>
              <option value="false">Deactivated only</option>
            </select>
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        {users.isLoading ? (
          <LoadingBlock label="Loading users…" />
        ) : users.error ? (
          <div className="p-4 sm:p-6">
            <ErrorBlock message={users.error} onRetry={users.reload} />
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            bare
            icon={<Users />}
            title="No users match these filters"
            description="Try a different name, role or status."
          />
        ) : (
          <>
            <p className="px-4 pt-3 text-xs text-muted sm:px-6 md:hidden">
              {list.length} {list.length === 1 ? "user" : "users"}
            </p>

            {/* desktop / tablet: table */}
            <div className={`hidden md:block ${tableScrollClass}`}>
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th scope="col" className={thClass}>
                      User · {list.length}
                    </th>
                    <th scope="col" className={thClass}>
                      Role
                    </th>
                    <th scope="col" className={thClass}>
                      Status
                    </th>
                    <th scope="col" className={thClass}>
                      Plan
                    </th>
                    <th scope="col" className={thClass}>
                      Joined
                    </th>
                    <th scope="col" className={thClass}>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item) => {
                    const isSelf = currentUser?.id === item._id;
                    const isBusy = busyId === item._id;
                    return (
                      <tr key={item._id} className={trClass}>
                        <td className={tdClass}>
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar name={item.name} size="sm" />
                            <div className="min-w-0">
                              <p className="flex items-center gap-2 font-medium text-ink">
                                <span className="truncate">{item.name}</span>
                                {isSelf && <Badge tone="brand">You</Badge>}
                              </p>
                              <p className="max-w-64 truncate text-xs text-muted">
                                {item.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className={tdClass}>
                          <select
                            value={item.role}
                            onChange={(event) =>
                              changeRole(item, event.target.value as UserRole)
                            }
                            disabled={isSelf || isBusy}
                            aria-label={`Role for ${item.name}`}
                            className={`${compactInputClass} w-32`}
                          >
                            {USER_ROLES.map((option) => (
                              <option key={option} value={option}>
                                {ROLE_LABELS[option]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className={tdClass}>
                          <div className="flex items-center gap-3">
                            <ToggleSwitch
                              checked={item.isActive}
                              onChange={() => toggleActive(item)}
                              disabled={isSelf || isBusy}
                              label={`${item.isActive ? "Deactivate" : "Activate"} ${item.name}`}
                            />
                            <span className={activeBadge(item.isActive)}>
                              {item.isActive ? "Active" : "Deactivated"}
                            </span>
                          </div>
                        </td>
                        <td className={tdClass}>
                          {item.role === "candidate" ? (
                            <PlanCell
                              user={item}
                              disabled={isBusy}
                              onChange={() => setPlanTarget(item)}
                            />
                          ) : (
                            <span className="text-sm text-subtle">—</span>
                          )}
                        </td>
                        <td className={`${tdClass} whitespace-nowrap`}>
                          <p className="text-body tabular-nums">
                            {formatDate(item.createdAt)}
                          </p>
                          <p className="text-xs text-muted">
                            {AUTH_PROVIDER_LABEL[item.authProvider]}
                          </p>
                        </td>
                        <td className={`${tdClass} text-right`}>
                          <Button
                            variant="danger-soft"
                            size="sm"
                            leadingIcon={<Trash2 />}
                            onClick={() => handleDelete(item._id, item.name)}
                            disabled={isSelf || isBusy}
                            aria-label={`Delete ${item.name}`}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* phones: stacked cards */}
            <ul className="divide-y divide-line-soft md:hidden">
              {list.map((item) => {
                const isSelf = currentUser?.id === item._id;
                const isBusy = busyId === item._id;
                return (
                  <li key={item._id} className={`${stackedItemClass} space-y-4`}>
                    <div className="flex items-start gap-3">
                      <Avatar name={item.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink">
                          <span className="min-w-0 break-words">{item.name}</span>
                          {isSelf && <Badge tone="brand">You</Badge>}
                        </p>
                        <p className="break-all text-xs text-muted">
                          {item.email}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          Joined {formatDate(item.createdAt)} ·{" "}
                          {AUTH_PROVIDER_LABEL[item.authProvider]}
                        </p>
                      </div>
                      <span className={activeBadge(item.isActive)}>
                        {item.isActive ? "Active" : "Deactivated"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                      <select
                        value={item.role}
                        onChange={(event) =>
                          changeRole(item, event.target.value as UserRole)
                        }
                        disabled={isSelf || isBusy}
                        aria-label={`Role for ${item.name}`}
                        className={selectClass}
                      >
                        {USER_ROLES.map((option) => (
                          <option key={option} value={option}>
                            {ROLE_LABELS[option]}
                          </option>
                        ))}
                      </select>
                      <div className="flex h-10 items-center gap-2 text-sm text-body">
                        <ToggleSwitch
                          checked={item.isActive}
                          onChange={() => toggleActive(item)}
                          disabled={isSelf || isBusy}
                          label={`${item.isActive ? "Deactivate" : "Activate"} ${item.name}`}
                        />
                        <span aria-hidden="true">Active</span>
                      </div>
                    </div>
                    {item.role === "candidate" && (
                      <PlanCell
                        user={item}
                        disabled={isBusy}
                        onChange={() => setPlanTarget(item)}
                      />
                    )}
                    <Button
                      variant="danger-soft"
                      fullWidth
                      leadingIcon={<Trash2 />}
                      onClick={() => handleDelete(item._id, item.name)}
                      disabled={isSelf || isBusy}
                    >
                      Delete user
                    </Button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={pendingDelete !== null}
        tone="danger"
        title={`Delete ${pendingDelete?.name ?? "this user"}?`}
        description="This permanently removes the user account and cannot be undone."
        confirmLabel="Delete user"
        loading={pendingDelete !== null && busyId === pendingDelete.id}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />

      {planTarget && (
        <PlanDialog
          user={planTarget}
          token={token}
          onClose={() => setPlanTarget(null)}
          onSaved={() => {
            setPlanTarget(null);
            users.reload();
          }}
        />
      )}
    </PortalPage>
  );
}

/** Plan badge, end date / Stripe state, and the "Change" button for one candidate. */
function PlanCell({
  user,
  disabled,
  onChange,
}: {
  user: User;
  disabled: boolean;
  onChange: () => void;
}) {
  const plan = planOf(user);
  const sub = user.subscription;
  const stripeActive =
    sub?.status && ["active", "trialing", "past_due"].includes(sub.status);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <div className="min-w-0">
        <PlanBadge plan={plan} />
        {plan === "premium" && user.planExpiresAt && (
          <p className="mt-1 text-xs text-muted tabular-nums">
            until {formatDate(user.planExpiresAt)}
          </p>
        )}
        {stripeActive && (
          <p className="mt-1 text-xs text-muted">
            Stripe: {sub?.status?.replace(/_/g, " ")}
            {sub?.cancelAtPeriodEnd ? " · cancels at period end" : ""}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        leadingIcon={<Crown />}
        onClick={onChange}
        disabled={disabled}
        aria-label={`Change plan for ${user.name}`}
      >
        Change
      </Button>
    </div>
  );
}

/** "YYYY-MM-DD" for a date input, from an ISO string. */
const toDateInput = (iso?: string | null): string => {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

/** PATCH /api/admin/users/:userId/plan — Free / Premium, Premium with an optional end date. */
function PlanDialog({
  user,
  token,
  onClose,
  onSaved,
}: {
  user: User;
  token: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [plan, setPlan] = useState<UserPlan>(planOf(user));
  const [endDate, setEndDate] = useState(toDateInput(user.planExpiresAt));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await setUserPlan(
        user._id,
        {
          plan,
          // End of the chosen day, local time.
          expiresAt:
            plan === "premium" && endDate
              ? new Date(`${endDate}T23:59:59`).toISOString()
              : null,
        },
        token,
      );
      onSaved();
    } catch (err) {
      setError(toErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      dismissible={!saving}
      size="sm"
      title={`Plan for ${user.name}`}
      description="Changes take effect immediately and are written to the audit log."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            Save plan
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="admin-plan" className={labelClass}>
            Plan
          </label>
          <select
            id="admin-plan"
            value={plan}
            onChange={(event) => setPlan(event.target.value as UserPlan)}
            className={selectClass}
          >
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        {plan === "premium" && (
          <div>
            <label htmlFor="admin-plan-end" className={labelClass}>
              Premium until (optional)
            </label>
            <input
              id="admin-plan-end"
              type="date"
              min={today}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className={inputClass}
            />
            <p className={helpTextClass}>Leave empty for no end date.</p>
          </div>
        )}
        <InlineError message={error} />
      </div>
    </Dialog>
  );
}
