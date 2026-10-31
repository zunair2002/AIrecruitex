"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandWordmark } from "./Logo";
import { useAuth } from "@/context/AuthContext";
import { useRealtimeConnected } from "@/context/RealtimeContext";
import { useUnreadNotifications } from "@/components/shared/useUnreadNotifications";
import { ROLE_BADGE, ROLE_LABELS, initials } from "@/lib/format";

export type NavItem = { href: string; label: string; icon: string };

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
  const unreadCount = useUnreadNotifications();
  const isLive = useRealtimeConnected();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.replace(loginPath);
  };

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-zinc-200/80 bg-white">
      <div className="border-t-[3px] border-t-brand border-b border-zinc-100 p-6">
        <Link href="/" className="block transition-opacity hover:opacity-80">
          <BrandWordmark className="text-[1.28rem]" />
          <p className="mt-1.5 text-[11px] font-medium tracking-[0.14em] text-accent uppercase">
            {portalName}
          </p>
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
              className={`flex items-center gap-3 rounded-sm px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-navy text-white"
                  : "text-zinc-600 hover:bg-[#f6f3f9] hover:text-ink"
              }`}
            >
              <span className="text-base opacity-90">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.href.endsWith("/notifications") && unreadCount > 0 && (
                <span
                  aria-label={`${unreadCount} unread`}
                  className={`min-w-[20px] px-1.5 py-0.5 text-center text-[11px] font-bold ${
                    isActive ? "bg-white text-navy" : "bg-navy text-white"
                  }`}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-100 p-4">
        {user && (
          <div className="rounded-2xl bg-zinc-50 px-4 py-3">
            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand-dark">
                  {initials(user.name)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {user.name}
                </p>
                <p className="truncate text-xs text-zinc-500">{user.email}</p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <span className={ROLE_BADGE[user.role]}>
                {ROLE_LABELS[user.role]}
              </span>
              <span
                title={
                  isLive
                    ? "Live updates connected"
                    : "Live updates disconnected — data refreshes on navigation"
                }
                className="flex items-center gap-1 text-[10px] font-medium text-zinc-400"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-emerald-500" : "bg-zinc-300"}`}
                />
                {isLive ? "Live" : "Offline"}
              </span>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mt-2 flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-500 transition-colors hover:text-red-600 disabled:opacity-60"
        >
          ← {isLoggingOut ? "Logging out…" : "Log out"}
        </button>
      </div>
    </aside>
  );
}
