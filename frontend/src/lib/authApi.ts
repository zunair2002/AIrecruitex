/**
 * One function per endpoint exposed by the backend's `/api/auth` router
 * (see Airecruitx-backend/src/routes/auth.routes.ts).
 */
import { apiRequest } from "./api";

export type UserRole = "candidate" | "hr" | "admin";
export type AuthProvider = "password" | "google";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  authProvider: AuthProvider;
  avatarUrl?: string;
  /** Only returned by GET /api/auth/me. */
  orgId?: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

/** POST /api/auth/signup — creates the user. Note: does NOT return a token. */
export function signup(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<AuthUser> {
  return apiRequest<AuthUser>("/api/auth/signup", {
    method: "POST",
    body: input,
  });
}

/** POST /api/auth/login — returns a JWT plus the public user. */
export function login(input: {
  email: string;
  password: string;
}): Promise<AuthSession> {
  return apiRequest<AuthSession>("/api/auth/login", {
    method: "POST",
    body: input,
  });
}

/** POST /api/auth/google — exchanges a Firebase ID token for our own JWT. */
export function googleLogin(
  idToken: string,
  role?: UserRole,
): Promise<AuthSession> {
  return apiRequest<AuthSession>("/api/auth/google", {
    method: "POST",
    body: role ? { idToken, role } : { idToken },
  });
}

/** GET /api/auth/me — protected; used to restore a session on page load. */
export function getMe(token: string, signal?: AbortSignal): Promise<AuthUser> {
  return apiRequest<AuthUser>("/api/auth/me", { token, signal });
}

/** POST /api/auth/logout — protected; revokes Firebase refresh tokens server-side. */
export function logout(token: string): Promise<{ message?: string }> {
  return apiRequest<{ message?: string }>("/api/auth/logout", {
    method: "POST",
    token,
  });
}

/** GET /health — liveness probe for the API. */
export function health(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/health");
}
