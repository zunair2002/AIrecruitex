"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AccountDeactivated } from "@/components/auth/AccountDeactivated";

/**
 * Renders the deactivated screen and makes sure the dead session is gone.
 *
 * Landing here by any route — a 403 mid-session, a refused sign-in, or the URL
 * typed directly — must leave no token behind, so the next visit to a portal
 * goes to the login page rather than flashing a half-rendered dashboard.
 */
export function DeactivatedScreen() {
  const { isDeactivated, logout } = useAuth();

  useEffect(() => {
    void logout();
    // Run once on mount: this page's whole job is to end the session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // `isDeactivated` is only read so the screen still renders correctly when the
  // user arrives here directly, with no failure having been recorded.
  void isDeactivated;

  return <AccountDeactivated />;
}
