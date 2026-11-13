"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthFailure } from "@/lib/api";
import * as authApi from "@/lib/authApi";
import type {
  AuthUser,
  ResendOtpResult,
  SignupResult,
  UserRole,
} from "@/lib/types";
import {
  clearStoredToken,
  clearTabToken,
  getSessionOrigin,
  getStoredToken,
  setStoredToken,
} from "@/lib/authStorage";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  /** True until the stored token has been checked against GET /api/auth/me. */
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  /**
   * Creates the account and triggers the OTP email. It does NOT sign you in —
   * the session is issued by `verifyEmail` once the code is confirmed.
   */
  register: (input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => Promise<SignupResult>;
  /** Confirms the emailed OTP and starts the session. */
  verifyEmail: (email: string, otp: string) => Promise<AuthUser>;
  resendOtp: (email: string) => Promise<ResendOtpResult>;
  loginWithGoogle: (idToken: string, role?: UserRole) => Promise<AuthUser>;
  logout: () => Promise<void>;
  /**
   * Drops this tab's session without touching other tabs or the shared seed.
   * Used when a tab inherited a session for a portal the user didn't ask for.
   */
  endTabSession: () => void;
  /** "adopted" when this tab inherited its session rather than signing in. */
  sessionOrigin: () => "explicit" | "adopted";
  /**
   * Set when the account was deactivated by an admin. The portals show a
   * dedicated screen for this instead of bouncing to the login page.
   */
  isDeactivated: boolean;
  /** Clears the deactivated state, e.g. when leaving for the public site. */
  clearDeactivated: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeactivated, setIsDeactivated] = useState(false);

  // Restore the session on first mount: if a token is in storage, ask the
  // backend who it belongs to. A rejected token is discarded silently.
  useEffect(() => {
    const stored = getStoredToken();
    if (!stored) {
      // Nothing to restore — settle the initial loading flag.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    authApi
      .getMe(stored, controller.signal)
      .then((me) => {
        setUser(me);
        setToken(stored);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        clearStoredToken();
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  /**
   * One place reacts to auth rejections, so a deactivated or expired session
   * tears down everywhere rather than leaving screens rendering from a cached
   * user object while every request behind them fails.
   */
  useEffect(() => {
    return onAuthFailure((failure) => {
      if (failure === "deactivated") setIsDeactivated(true);
      clearStoredToken();
      setToken(null);
      setUser(null);
    });
  }, []);

  const clearDeactivated = useCallback(() => setIsDeactivated(false), []);

  /**
   * Re-check the session periodically and whenever the tab regains focus.
   *
   * Reacting to failed requests alone isn't enough: a tab sitting on a screen
   * it already loaded makes no further calls, so an account deactivated by an
   * admin would keep showing a working portal until the user happened to
   * navigate. GET /api/auth/me is the cheap authority on this — `requireAuth`
   * re-reads the user and returns 403 once `isActive` is false, which the
   * failure listener above turns into the deactivated screen.
   */
  useEffect(() => {
    if (!token) return;

    const revalidate = () => {
      // Errors are handled by the shared auth-failure listener; a network
      // blip must not sign anyone out, so nothing is done here on failure.
      void authApi.getMe(token).catch(() => undefined);
    };

    const onFocus = () => revalidate();
    const onVisible = () => {
      if (document.visibilityState === "visible") revalidate();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    const id = window.setInterval(revalidate, 60_000);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(id);
    };
  }, [token]);

  const applySession = useCallback(
    (session: { token: string; user: AuthUser }) => {
      setIsDeactivated(false);
      setStoredToken(session.token);
      setToken(session.token);
      setUser(session.user);
      return session.user;
    },
    [],
  );

  const login = useCallback(
    async (email: string, password: string) =>
      applySession(await authApi.login({ email, password })),
    [applySession],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string, role?: UserRole) =>
      applySession(await authApi.googleLogin(idToken, role)),
    [applySession],
  );

  // POST /signup only creates the account and emails an OTP — no session yet.
  const register = useCallback(
    (input: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
    }) => authApi.signup(input),
    [],
  );

  const verifyEmail = useCallback(
    async (email: string, otp: string) =>
      applySession(await authApi.verifyEmail({ email, otp })),
    [applySession],
  );

  const resendOtp = useCallback(
    (email: string) => authApi.resendOtp(email),
    [],
  );

  const logout = useCallback(async () => {
    const current = token ?? getStoredToken();
    if (current) {
      // Best effort: the JWT is stateless, so the client-side clear below is
      // what actually ends the session.
      await authApi.logout(current).catch(() => undefined);
    }
    clearStoredToken();
    setToken(null);
    setUser(null);
  }, [token]);

  const endTabSession = useCallback(() => {
    clearTabToken();
    setToken(null);
    setUser(null);
  }, []);

  const sessionOrigin = useCallback(() => getSessionOrigin(), []);

  const refresh = useCallback(async () => {
    const current = token ?? getStoredToken();
    if (!current) return;
    try {
      setUser(await authApi.getMe(current));
    } catch {
      clearStoredToken();
      setToken(null);
      setUser(null);
    }
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      verifyEmail,
      resendOtp,
      loginWithGoogle,
      logout,
      endTabSession,
      sessionOrigin,
      isDeactivated,
      clearDeactivated,
      refresh,
    }),
    [
      user,
      token,
      isLoading,
      login,
      register,
      verifyEmail,
      resendOtp,
      loginWithGoogle,
      logout,
      endTabSession,
      sessionOrigin,
      isDeactivated,
      clearDeactivated,
      refresh,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return context;
}

/** Where each of the backend's three roles lands after signing in. */
export function homePathForRole(role: UserRole): string {
  if (role === "candidate") return "/candidate/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/recruiter/dashboard";
}

/** The login screen a signed-out visitor to each portal is bounced to. */
export function loginPathForRole(role: UserRole): string {
  return role === "candidate" ? "/login/candidate" : "/login/recruiter";
}
