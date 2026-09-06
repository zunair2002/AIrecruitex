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

const STORAGE_KEY = "airecruitx_interview_sessions";
export const SESSIONS_UPDATED_EVENT = "airecruitx-interview-sessions-updated";

function read(): StoredSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredSession[];
    return Array.isArray(parsed) ? parsed.filter((s) => s?.sessionId) : [];
  } catch {
    return [];
  }
}

function write(sessions: StoredSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    window.dispatchEvent(new Event(SESSIONS_UPDATED_EVENT));
  } catch {
    // Storage blocked (private mode) — history just won't persist.
  }
}

export function getStoredSessions(): StoredSession[] {
  return read().sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

/** Records a session id, or refreshes the label of one already known. */
export function rememberSession(entry: StoredSession): void {
  const sessions = read();
  const existing = sessions.findIndex((s) => s.sessionId === entry.sessionId);
  if (existing >= 0) {
    sessions[existing] = { ...sessions[existing], ...entry };
  } else {
    sessions.push(entry);
  }
  write(sessions);
}

export function forgetSession(sessionId: ObjectId): void {
  write(read().filter((s) => s.sessionId !== sessionId));
}
