/**
 * Post-login return paths (`?next=`).
 *
 * Anything that sends a signed-out visitor to a login screen can say where to
 * come back to. The value arrives from the URL, so it is attacker-controlled:
 * only same-origin, absolute, single-slash paths are honoured. Everything else
 * falls back to the role's own home, which is what used to happen anyway.
 */
import { homePathForRole } from "@/context/AuthContext";
import type { UserRole } from "./types";

/** Portal prefixes each role may be returned to. */
const ALLOWED_PREFIX: Record<UserRole, string> = {
  candidate: "/candidate/",
  hr: "/recruiter/",
  admin: "/admin/",
};

/**
 * Is this a safe in-app path? Rejects absolute URLs ("https://evil.test"),
 * protocol-relative ones ("//evil.test" — which a bare startsWith("/") check
 * lets through) and anything with a scheme.
 */
export function isSafeNextPath(value: string | null | undefined): value is string {
  if (!value) return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  if (value.includes("://")) return false;
  return true;
}

/**
 * Where to land after signing in: the requested path when it is safe *and*
 * belongs to this role's portal, otherwise that role's home. A candidate with
 * `?next=/admin/settings` goes to their own dashboard, not to a page the guard
 * would bounce them off anyway.
 */
export function resolveNextPath(
  next: string | null | undefined,
  role: UserRole,
): string {
  if (!isSafeNextPath(next)) return homePathForRole(role);
  return next.startsWith(ALLOWED_PREFIX[role])
    ? next
    : homePathForRole(role);
}

/** Builds a login URL that returns to `next` once signed in. */
export function loginHref(loginPath: string, next?: string): string {
  return next && isSafeNextPath(next)
    ? `${loginPath}?next=${encodeURIComponent(next)}`
    : loginPath;
}
