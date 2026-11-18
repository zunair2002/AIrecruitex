"use client";

import { useMemo, useState } from "react";
import {
  BellRing,
  BriefcaseBusiness,
  ChevronDown,
  ClipboardList,
  FileText,
  Filter,
  LifeBuoy,
  ScrollText,
  Search,
  Settings2,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { listActivityLogs } from "@/lib/adminApi";
import { useApiResource } from "@/lib/useApiResource";
import { populated, type AuditLog, type UserRole } from "@/lib/types";
import {
  APPLICATION_STATUS_LABELS,
  ROLE_LABELS,
  badgeClass,
  formatDate,
  formatDateTime,
  humanizeAction,
  statusTone,
} from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  Card,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
} from "@/components/ui/Feedback";
import { inputClass, labelClass } from "@/components/ui/controls";
import { PortalPage } from "@/components/dashboard/primitives";

/* ------------------------------------------------ readable audit entries */

type TargetMeta = { icon: LucideIcon; tile: string; noun: string; label: string };

/** Icon, tile tint and wording per audit `targetType`. */
const TARGETS: Record<string, TargetMeta> = {
  Application: {
    icon: ClipboardList,
    tile: "bg-brand-50 text-brand-700",
    noun: "an application",
    label: "Application",
  },
  Job: {
    icon: BriefcaseBusiness,
    tile: "bg-brand-50 text-brand-600",
    noun: "a job",
    label: "Job",
  },
  User: {
    icon: UserRound,
    tile: "bg-surface-3 text-body",
    noun: "a user account",
    label: "User",
  },
  Resume: {
    icon: FileText,
    tile: "bg-brand-50 text-brand-700",
    noun: "a resume",
    label: "Resume",
  },
  SupportTicket: {
    icon: LifeBuoy,
    tile: "bg-brand-50 text-brand-500",
    noun: "a support ticket",
    label: "Support ticket",
  },
  Settings: {
    icon: Settings2,
    tile: "bg-surface-3 text-body",
    noun: "the platform settings",
    label: "Settings",
  },
  Notification: {
    icon: BellRing,
    tile: "bg-brand-50 text-brand-600",
    noun: "a notification",
    label: "Notification",
  },
};

function targetMeta(targetType: string): TargetMeta {
  return (
    TARGETS[targetType] ?? {
      icon: ScrollText,
      tile: "bg-surface-3 text-body",
      noun: `a ${humanizeAction(targetType).toLowerCase()}`,
      label: humanizeAction(targetType),
    }
  );
}

const PAST_TENSE: Record<string, string> = {
  create: "created",
  update: "updated",
  edit: "edited",
  delete: "deleted",
  remove: "removed",
  close: "closed",
  open: "reopened",
  reopen: "reopened",
  resolve: "resolved",
  upload: "uploaded",
  activate: "reactivated",
  deactivate: "deactivated",
  invite: "sent an invite for",
  send: "sent",
  broadcast: "sent",
  publish: "published",
  archive: "archived",
  approve: "approved",
  reject: "rejected",
  submit: "submitted",
  complete: "completed",
  start: "started",
  schedule: "scheduled",
  cancel: "cancelled",
};

type Meta = Record<string, unknown>;

const str = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value) : "";

const roleLabel = (role: string) =>
  ROLE_LABELS[role as UserRole] ?? humanizeAction(role);

const statusLabel = (status: string) =>
  APPLICATION_STATUS_LABELS[status as keyof typeof APPLICATION_STATUS_LABELS] ??
  humanizeAction(status);

/** Hand-written sentences for the actions the backend records. */
const SENTENCES: Record<string, (meta: Meta) => string> = {
  "application.create": (m) =>
    m.matchScore !== undefined
      ? `applied for a job with a ${str(m.matchScore)}% match`
      : "applied for a job",
  "application.org_interview_invite": () =>
    "sent an organisational interview invite",
  "application.ai_interview_schedule": () => "scheduled an AI interview",
  "application.status_update": (m) =>
    m.status
      ? `marked an application as ${statusLabel(str(m.status)).toLowerCase()}`
      : "updated an application's status",
  "user.login": () => "signed in",
  "user.logout": () => "signed out",
  "user.register": () => "created an account",
  "user.role_change": (m) =>
    m.role ? `changed a user's role to ${roleLabel(str(m.role))}` : "changed a user's role",
  "user.activate": () => "reactivated a user account",
  "user.deactivate": () => "deactivated a user account",
  "user.delete": () => "deleted a user account",
  "job.create": (m) => (m.title ? `posted the job “${str(m.title)}”` : "posted a job"),
  "job.close": (m) => (m.title ? `closed the job “${str(m.title)}”` : "closed a job"),
  "job.delete": (m) => (m.title ? `deleted the job “${str(m.title)}”` : "deleted a job"),
  "settings.update": () => "updated the platform settings",
  "resume.upload": () => "uploaded a resume",
  "support.create": () => "opened a support ticket",
  "support.resolve": () => "replied to and resolved a support ticket",
  "notification.broadcast": () => "sent a broadcast notification",
};

/** Keys already said in the sentence (or internal ids) — not repeated as details. */
const HIDDEN_KEYS = new Set(["status", "role", "title", "isActive", "matchScore"]);

function metaDetails(meta: Meta): string[] {
  const out: string[] = [];
  for (const [key, value] of Object.entries(meta)) {
    if (HIDDEN_KEYS.has(key) || /id$/i.test(key)) continue;
    if (value === null || typeof value === "object") continue;
    switch (key) {
      case "validityDays":
        out.push(`Valid for ${str(value)} day${value === 1 ? "" : "s"}`);
        break;
      case "matchThreshold":
        out.push(`Match threshold ${str(value)}%`);
        break;
      case "maxResumeSizeMB":
        out.push(`Max resume ${str(value)} MB`);
        break;
      case "allowSignups":
        out.push(value ? "Sign-ups on" : "Sign-ups off");
        break;
      case "recipientCount":
        out.push(`${str(value)} recipient${value === 1 ? "" : "s"}`);
        break;
      default:
        out.push(`${humanizeAction(key)}: ${String(value)}`);
    }
  }
  return out.slice(0, 3);
}

/** "Sara Khan" + "sent an organisational interview invite" (+ detail chips). */
export function describeAuditLog(log: AuditLog): {
  sentence: string;
  details: string[];
  destructive: boolean;
} {
  const meta = (log.metadata ?? {}) as Meta;
  const key = log.action.toLowerCase().replace(/-/g, "_");
  const verb = key.split(".").pop() ?? key;
  const lastWord = verb.split("_").pop() ?? verb;
  const specific = SENTENCES[key];
  let sentence: string;
  if (specific) {
    sentence = specific(meta);
  } else if (PAST_TENSE[verb] ?? PAST_TENSE[lastWord]) {
    sentence = `${PAST_TENSE[verb] ?? PAST_TENSE[lastWord]} ${targetMeta(log.targetType).noun}`;
  } else {
    sentence = `performed “${humanizeAction(log.action).toLowerCase()}”`;
  }
  return {
    sentence,
    details: metaDetails(meta),
    destructive: ["delete", "deactivate", "remove", "reject"].includes(lastWord),
  };
}

/** "just now" / "5 min ago" / "3 hours ago" / "2 days ago", then a date. */
export function timeAgo(value: string): string {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "—";
  const minutes = Math.floor((Date.now() - time) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }
  return formatDate(value);
}

function dayLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * One audit entry as a readable sentence: actor avatar (with a target-type
 * icon badge), "Sara Khan sent an organisational interview invite", the
 * actor's role, target type, details and relative + absolute time.
 */
export function ActivityItem({
  log,
  showTechnical = false,
}: {
  log: AuditLog;
  /** Adds an expandable block with the raw action, target id and metadata. */
  showTechnical?: boolean;
}) {
  const actor = populated(log.actorId);
  const name = actor?.name ?? "Unknown user";
  const target = targetMeta(log.targetType);
  const Icon = target.icon;
  const { sentence, details, destructive } = describeAuditLog(log);
  const hasMetadata = Boolean(log.metadata && Object.keys(log.metadata).length > 0);

  return (
    <div className="flex items-start gap-4 py-4">
      <div className="relative shrink-0">
        <Avatar name={name} size="md" />
        <span
          aria-hidden="true"
          className={`absolute -bottom-1.5 -right-2 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white [&>svg]:h-3 [&>svg]:w-3 ${
            destructive ? "bg-rose-50 text-rose-600" : target.tile
          }`}
        >
          <Icon />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <p className="min-w-0 text-sm leading-6 text-body">
            <span className="font-semibold text-ink">{name}</span> {sentence}
          </p>
          <time
            dateTime={log.createdAt}
            title={formatDateTime(log.createdAt)}
            className="shrink-0 text-xs leading-6 text-muted tabular-nums"
          >
            {timeAgo(log.createdAt)}
          </time>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-muted">
          <span className={badgeClass(statusTone(log.actorRole))}>
            {roleLabel(log.actorRole)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon aria-hidden="true" className="h-3.5 w-3.5 text-subtle" />
            {target.label}
          </span>
          {details.map((detail) => (
            <span key={detail} className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="text-subtle">·</span>
              {detail}
            </span>
          ))}
          <span className="hidden items-center gap-2 tabular-nums sm:inline-flex">
            <span aria-hidden="true" className="text-subtle">·</span>
            {formatDateTime(log.createdAt)}
          </span>
        </div>

        {showTechnical && (hasMetadata || log.targetId || actor?.email) && (
          <details className="group mt-2">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-md text-xs font-medium text-brand-700 transition-colors hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
              Technical details
              <ChevronDown
                aria-hidden="true"
                className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="mt-2 min-w-0 space-y-2 rounded-lg bg-surface-2 p-3 text-xs text-body ring-1 ring-inset ring-line-soft">
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1">
                <dt className="text-muted">Action</dt>
                <dd className="break-all font-mono">{log.action}</dd>
                <dt className="text-muted">Target</dt>
                <dd className="break-all font-mono">
                  {log.targetType}
                  {log.targetId ? ` · ${log.targetId}` : ""}
                </dd>
                {actor?.email && (
                  <>
                    <dt className="text-muted">Actor</dt>
                    <dd className="break-all">{actor.email}</dd>
                  </>
                )}
              </dl>
              {hasMetadata && (
                <pre className="overflow-x-auto rounded-md bg-surface p-2.5 font-mono text-xs text-body ring-1 ring-inset ring-line-soft">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- page */

/**
 * GET /api/admin/activity-logs — capped at the 200 most recent entries by the
 * backend, filterable by `actorId` and exact `action` string.
 */
export function ActivityLog() {
  const { token } = useAuth();
  const [actionInput, setActionInput] = useState("");
  const [actorInput, setActorInput] = useState("");
  const [filter, setFilter] = useState<{ action?: string; actorId?: string }>(
    {},
  );

  const logs = useApiResource(
    (signal) => listActivityLogs(filter, token, signal),
    [token, filter.action, filter.actorId],
    { enabled: Boolean(token) },
  );

  const list = useMemo(() => logs.data ?? [], [logs.data]);

  // Group consecutive entries (already newest first) by calendar day.
  const groups = useMemo(() => {
    const out: { label: string; items: AuditLog[] }[] = [];
    for (const log of list) {
      const label = dayLabel(log.createdAt);
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(log);
      else out.push({ label, items: [log] });
    }
    return out;
  }, [list]);

  const isFiltered = Boolean(filter.action || filter.actorId);

  return (
    <PortalPage>
      <PageHeader
        icon={<ScrollText />}
        title="Activity log"
        description="Every action the backend records, newest first (latest 200)."
      />

      <Card padding="sm">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setFilter({
              action: actionInput.trim() || undefined,
              actorId: actorInput.trim() || undefined,
            });
          }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
        >
          <div className="min-w-0">
            <label htmlFor="activity-action" className={labelClass}>
              Action
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
              />
              <input
                id="activity-action"
                type="text"
                value={actionInput}
                onChange={(event) => setActionInput(event.target.value)}
                placeholder="Exact action, e.g. user.role-change"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
          <div className="min-w-0">
            <label htmlFor="activity-actor" className={labelClass}>
              Actor user ID
            </label>
            <input
              id="activity-actor"
              type="text"
              value={actorInput}
              onChange={(event) => setActorInput(event.target.value)}
              placeholder="Actor user id"
              className={inputClass}
            />
          </div>
          <Button type="submit" leadingIcon={<Filter />}>
            Filter
          </Button>
        </form>
      </Card>

      {logs.isLoading ? (
        <Card>
          <LoadingBlock label="Loading activity…" variant="skeleton" rows={6} />
        </Card>
      ) : logs.error ? (
        <ErrorBlock message={logs.error} onRetry={logs.reload} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<ScrollText />}
          title={isFiltered ? "No entries match this filter" : "No activity recorded"}
          description="Admin actions such as role changes, job closures, broadcasts and settings edits are logged here."
        />
      ) : (
        <Card
          padding="none"
          title={`${list.length} ${list.length === 1 ? "entry" : "entries"}`}
          description={isFiltered ? "Filtered results, newest first." : "Newest first."}
        >
          {groups.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <h3 className="border-y border-line-soft bg-surface-2 px-5 py-2 text-xs font-medium uppercase tracking-wider text-muted sm:px-6">
                {group.label}
              </h3>
              <ul className="divide-y divide-line-soft px-5 sm:px-6">
                {group.items.map((log) => (
                  <li key={log._id}>
                    <ActivityItem log={log} showTechnical />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </Card>
      )}
    </PortalPage>
  );
}
