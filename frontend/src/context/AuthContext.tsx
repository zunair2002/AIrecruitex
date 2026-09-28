"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as authApi from "@/lib/authApi";
import type { AuthUser, UserRole } from "@/lib/types";
import {
  clearStoredToken,
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
 register: (input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}) => Promise<authApi.SignupResult>;

verifyEmail: (email: string, otp: string) => Promise<AuthUser>;
  loginWithGoogle: (idToken: string, role?: UserRole) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the session on first mount: if a token is in storage, ask the
  // backend who it belongs to. A rejected token is discarded silently.
  useEffect(() => {
    const stored = getStoredToken();
    if (!stored) {
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
        if (error instanceof DOMException && error.name === "AbortError") return;
        clearStoredToken();
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  const applySession = useCallback(
    (session: { token: string; user: AuthUser }) => {
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

  // POST /signup already answers with { token, user }, so the account is
  // created and signed in from one round trip.
  const register = useCallback(
  async (input: {
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
    loginWithGoogle,
    logout,
    refresh,
  }),
  [
    user,
    token,
    isLoading,
    login,
    register,
    verifyEmail,
    loginWithGoogle,
    logout,
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
