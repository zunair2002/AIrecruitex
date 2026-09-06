"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROLE_BADGE, ROLE_LABELS } from "@/lib/format";

export type NavItem = { href: string; label: string; icon: string };

/**
 * One sidebar shared by the candidate, HR and admin portals — the only
 * differences are the nav items, the portal name and where logout returns to.
 */
export function PortalSidebar({
  portalName,
  navItems,
  loginPath,
}: {
  portalName: string;
  navItems: NavItem[];
  loginPath: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.replace(loginPath);
  };

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-100 p-6">
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">AIRecruitX</p>
            <p className="text-xs text-gray-500">{portalName}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 p-4">
        {user && (
          <div className="px-4 pb-3">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user.name}
            </p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
            <span className={`${ROLE_BADGE[user.role]} mt-2`}>
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-500 transition-colors hover:text-red-600 disabled:opacity-60"
        >
          ← {isLoggingOut ? "Logging out…" : "Log out"}
        </button>
      </div>
    </aside>
  );
}
