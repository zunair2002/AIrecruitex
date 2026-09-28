/**
 * One function per endpoint on the backend's `/api/auth` router
 * (shared/user/routes/auth.routes.ts).
 */
import { apiRequest } from "./api";
import type { AuthSession, AuthUser, UserRole } from "./types";

export type { AuthProvider, AuthSession, AuthUser, UserRole } from "./types";

/**
 * POST /api/auth/signup — creates the user AND returns a session.
 * `role` is required and must be one of candidate | hr | admin;
 * `password` must be at least 6 characters (both enforced server-side).
 */
export type SignupResult = {
  email: string;
  message: string;
  devOtp?: string;
};

export function signup(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<SignupResult> {
  return apiRequest<SignupResult>("/api/auth/signup", {
    method: "POST",
    body: input,
  });
}

export function verifyEmail(input: {
  email: string;
  otp: string;
}): Promise<AuthSession> {
  return apiRequest<AuthSession>("/api/auth/verify-email", {
    method: "POST",
    body: input,
  });
}

export function resendOtp(email: string): Promise<{
  message: string;
  devOtp?: string;
}> {
  return apiRequest("/api/auth/resend-otp", {
    method: "POST",
    body: { email },
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

/** GET /api/auth/me — protected; adds `orgId` to the public user shape. */
export function getMe(token: string, signal?: AbortSignal): Promise<AuthUser> {
  return apiRequest<AuthUser>("/api/auth/me", { token, signal });
}

/** POST /api/auth/logout — clears the httpOnly cookie server-side. */
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
