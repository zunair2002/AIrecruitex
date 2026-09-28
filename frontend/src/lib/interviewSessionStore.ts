/**
 * A client-side index of the interview sessions this browser has started.
 *
 * The backend exposes a session by id (GET /api/interview/report/:sessionId)
 * but has no "list my sessions" endpoint, so the ids are remembered here to
 * build the candidate's interview history. Sessions attached to an application
 * are also reachable from `application.interviewSessionId`, so nothing is lost
 * if this store is cleared — only the practice history is browser-local.
 */
import type { InterviewLevel, ObjectId } from "./types";

export type StoredSession = {
  sessionId: ObjectId;
  /** Unset for HR-scheduled interviews, which have no difficulty level. */
  level?: InterviewLevel;
  /** Job title for an application interview, otherwise the practice label. */
  label: string;
  startedAt: string;
};

/**
 * Scoped per user: sessions are per-tab now (see authStorage), so two people
 * can be signed in on one browser at once and must not see each other's index.
 * The legacy unscoped key is migrated on first read rather than discarded.
 */
const STORAGE_PREFIX = "airecruitx_interview_sessions";
const LEGACY_KEY = STORAGE_PREFIX;
export const SESSIONS_UPDATED_EVENT = "airecruitx-interview-sessions-updated";

const keyFor = (userId: string) => `${STORAGE_PREFIX}:${userId}`;

function read(userId: string): StoredSession[] {
  if (typeof window === "undefined") return [];
  try {
    let raw = localStorage.getItem(keyFor(userId));
    if (raw === null) {
      // One-time migration from the pre-scoping key.
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy !== null) {
        localStorage.setItem(keyFor(userId), legacy);
        localStorage.removeItem(LEGACY_KEY);
        raw = legacy;
      }
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredSession[];
    return Array.isArray(parsed) ? parsed.filter((s) => s?.sessionId) : [];
  } catch {
    return [];
  }
}

function write(userId: string, sessions: StoredSession[]): void {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(sessions));
    window.dispatchEvent(new Event(SESSIONS_UPDATED_EVENT));
  } catch {
    // Storage blocked (private mode) — history just won't persist.
  }
}

export function getStoredSessions(userId: string): StoredSession[] {
  return read(userId).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

/** Records a session id, or refreshes the label of one already known. */
export function rememberSession(userId: string, entry: StoredSession): void {
  const sessions = read(userId);
  const existing = sessions.findIndex((s) => s.sessionId === entry.sessionId);
  if (existing >= 0) {
    sessions[existing] = { ...sessions[existing], ...entry };
  } else {
    sessions.push(entry);
  }
  write(userId, sessions);
}

export function forgetSession(userId: string, sessionId: ObjectId): void {
  write(userId, read(userId).filter((s) => s.sessionId !== sessionId));
}
