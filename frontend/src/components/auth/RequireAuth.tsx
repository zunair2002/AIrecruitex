"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, homePathForRole } from "@/context/AuthContext";
import type { UserRole } from "@/lib/authApi";

/**
 * Gate for the dashboard areas: waits for the session check, bounces signed-out
 * visitors to the matching login page, and sends signed-in users who wandered
 * into the wrong portal back to their own.
 */
export function RequireAuth({
  roles,
  loginPath,
  children,
}: {
  roles: UserRole[];
  loginPath: string;
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isAllowed = user !== null && roles.includes(user.role);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(loginPath);
    } else if (!roles.includes(user.role)) {
      router.replace(homePathForRole(user.role));
    }
  }, [isLoading, user, roles, loginPath, router]);

  if (isLoading || !isAllowed) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  return <>{children}</>;
}
