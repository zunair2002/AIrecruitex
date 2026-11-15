/**
 * Where the JWT lives.
 *
 * Sessions are **per tab**, so you can be signed in as a candidate in one tab
 * and as HR in another — which is how the portals get used during development
 * and demos. That needs sessionStorage: localStorage is shared by every tab on
 * the origin, so signing in anywhere would hijack every other open tab.
 *
 * localStorage still holds a copy, used for one thing only: seeding a *newly
 * opened* tab (and surviving a browser restart) so opening a link doesn't dump
 * you back at the login screen. A tab that already has its own session never
 * reads that copy again, so another tab signing in can't take it over.
 */
const TOKEN_KEY = "airecruitx_token";

/**
 * How this tab got its session: "explicit" means someone signed in here,
 * "adopted" means it was seeded from the last session on the origin.
 *
 * The difference matters for role mismatches. Bouncing a signed-in HR who
 * typed a /candidate URL to their own portal is right. Doing the same to
 * someone who just clicked "Candidate" in a fresh tab is not — they never
 * signed in as HR *here*, the session was inherited, and silently landing them
 * in the recruiter portal looks like the app picked the wrong role.
 */
const ORIGIN_KEY = "airecruitx_session_origin";

export type SessionOrigin = "explicit" | "adopted";

/** The token for *this* tab, adopting the last session if the tab is new. */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const own = sessionStorage.getItem(TOKEN_KEY);
    if (own) return own;

    // First read in a fresh tab: adopt the most recent session and immediately
    // claim it as this tab's own, so later sign-ins elsewhere can't replace it.
    const seed = localStorage.getItem(TOKEN_KEY);
    if (seed) {
      sessionStorage.setItem(TOKEN_KEY, seed);
      sessionStorage.setItem(ORIGIN_KEY, "adopted");
      return seed;
    }
    return null;
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(ORIGIN_KEY, "explicit");
    // Seed for tabs opened later; existing tabs keep their own session.
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage disabled (private mode / blocked cookies) — the session simply
    // won't survive a reload, which is better than crashing the login flow.
  }
}

/**
 * Signs this tab out. The shared seed is dropped too, so a new tab won't
 * silently resurrect the session — but other open tabs keep their own.
 */
export function clearStoredToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ORIGIN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

/** Was this tab's session inherited rather than signed into here? */
export function getSessionOrigin(): SessionOrigin {
  if (typeof window === "undefined") return "explicit";
  try {
    return sessionStorage.getItem(ORIGIN_KEY) === "adopted"
      ? "adopted"
      : "explicit";
  } catch {
    return "explicit";
  }
}

/**
 * Drops this tab's session only, leaving the shared seed alone so other tabs
 * and later-opened ones keep working. Used when an inherited session turns out
 * to be for the wrong portal.
 */
export function clearTabToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ORIGIN_KEY);
  } catch {
    // ignore
  }
}
