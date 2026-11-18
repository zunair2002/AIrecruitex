"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronsUpDown,
  LogOut,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRealtimeConnected } from "@/context/RealtimeContext";
import { useUnreadNotifications } from "@/components/shared/useUnreadNotifications";
import { ROLE_LABELS } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { BrandWordmark } from "@/components/layout/Logo";

/**
 * The portal sidebar — one component for all three portals.
 *
 * Candidate, HR and Admin differ only in their nav configuration, so they share
 * this file rather than each keeping a look of their own. That is what stops the
 * three portals drifting apart: a change to the chrome lands in all of them.
 *
 * `PortalShell` renders it twice — fixed on desktop and inside the mobile
 * drawer — through `PortalSidebarPanel`, sharing one unread count.
 */

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /**
   * Show the unread-notification count on this item. Set it explicitly rather
   * than inferring it from the href: /admin/notifications is the *broadcast*
   * composer, not an inbox, and must not wear an unread badge.
   */
  showUnreadBadge?: boolean;
};

export type NavGroup = {
  /** Groups with a title are collapsible; an untitled group is a loose row. */
  title?: string;
  items: NavItem[];
};

export type PortalSidebarProps = {
  portalName: string;
  portalTagline: string;
  navGroups: NavGroup[];
  /**
   * Shortcuts shown in the account card that opens from the user row. Each
   * portal passes the pages it actually has, so no item ever points at a route
   * that doesn't exist for that role.
   */
  accountMenu?: NavItem[];
  loginPath: string;
  /** Where the portal name links to — this portal's own home, never "/". */
  homeHref: string;
};

const FOCUS_ON_DARK =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400";

function UnreadCount({ count }: { count: number }) {
  return (
    <span
      aria-label={`${count} unread`}
      className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-semibold tabular-nums text-white"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** Standalone sidebar that fetches its own unread count. */
export function PortalSidebar(props: PortalSidebarProps) {
  const unreadCount = useUnreadNotifications();
  return <PortalSidebarPanel {...props} unreadCount={unreadCount} />;
}

export function PortalSidebarPanel({
  portalName,
  portalTagline,
  navGroups,
  accountMenu = [],
  loginPath,
  homeHref,
  unreadCount,
  onClose,
  onNavigate,
  closeButtonRef,
  className = "",
}: PortalSidebarProps & {
  unreadCount: number;
  /** When set (mobile drawer), shows a close button in the header. */
  onClose?: () => void;
  /** Called when any link in the sidebar is followed. */
  onNavigate?: () => void;
  closeButtonRef?: Ref<HTMLButtonElement>;
  className?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const isLive = useRealtimeConnected();
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);

  /**
   * The most specific nav item matching the current path. Prefix matching on its
   * own lights up a parent as well as its child — /recruiter/jobs/create matches
   * both "Create Job" and "My Jobs" — so the longest match wins and exactly one
   * item is ever highlighted.
   */
  const activeHref =
    navGroups
      .flatMap((group) => group.items.map((item) => item.href))
      .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
      .sort((a, b) => b.length - a.length)[0] ?? null;

  useEffect(() => {
    if (!isAccountOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsAccountOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isAccountOpen]);

  // Navigating away is already covered: every item in the card closes it on
  // click, and anything else the user clicks is an outside click.

  const toggleGroup = (title: string) =>
    setCollapsedGroups((previous) =>
      previous.includes(title)
        ? previous.filter((group) => group !== title)
        : [...previous, title],
    );

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.replace(loginPath);
  };

  return (
    <aside
      className={`nav-glass flex h-full w-full flex-col text-white ${className}`}
    >
      {/* ---- brand ---- */}
      <div className="flex shrink-0 items-start justify-between gap-3 px-5 pb-4 pt-6">
        <Link
          href={homeHref}
          onClick={onNavigate}
          title={portalTagline}
          className={`-mx-1 flex min-w-0 flex-col gap-1 rounded-md px-1 py-0.5 transition-opacity hover:opacity-90 ${FOCUS_ON_DARK}`}
        >
          <BrandWordmark tone="onDark" className="text-xl" />
          <span className="truncate text-xs font-medium text-white/50">
            {portalName}
          </span>
        </Link>
        {onClose && (
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className={`-mr-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white ${FOCUS_ON_DARK}`}
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* ---- navigation ---- */}
      <nav
        aria-label={`${portalName} navigation`}
        className="no-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto px-3 pb-4 pt-2"
      >
        {navGroups.map((group, index) => {
          const title = group.title;
          const isCollapsed = title ? collapsedGroups.includes(title) : false;

          const links = group.items.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === activeHref;
            const showBadge = Boolean(item.showUnreadBadge) && unreadCount > 0;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${FOCUS_ON_DARK} ${
                    isActive
                      ? "nav-glass-pill font-medium text-white"
                      : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-brand-400"
                    />
                  )}
                  <Icon
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive
                        ? "text-brand-300"
                        : "text-white/50 group-hover:text-white/80"
                    }`}
                  />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {showBadge && <UnreadCount count={unreadCount} />}
                </Link>
              </li>
            );
          });

          return (
            <section key={title ?? `standalone-${index}`}>
              {title ? (
                <>
                  <button
                    type="button"
                    onClick={() => toggleGroup(title)}
                    aria-expanded={!isCollapsed}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-1 text-left text-xs font-medium uppercase tracking-wider text-white/40 transition-colors hover:text-white/70 ${FOCUS_ON_DARK}`}
                  >
                    <span>{title}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        isCollapsed ? "-rotate-90" : "rotate-0"
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-200 ${
                      isCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
                    }`}
                  >
                    <div className="overflow-hidden" inert={isCollapsed}>
                      <ul className="mt-1 space-y-0.5">{links}</ul>
                    </div>
                  </div>
                </>
              ) : (
                <ul className="space-y-0.5">{links}</ul>
              )}
            </section>
          );
        })}
      </nav>

      {/* ---- account ---- */}
      {user && (
        <div
          ref={accountRef}
          className="relative shrink-0 border-t border-white/10 p-3"
        >
          {/* the account card */}
          {isAccountOpen && (
            <div
              role="menu"
              aria-label="Account"
              className="absolute inset-x-3 bottom-full z-50 mb-2 overflow-hidden rounded-xl border border-line bg-white py-1.5 text-ink shadow-lg motion-safe:animate-pop-in"
            >
              <div className="flex items-center gap-3 px-3.5 py-2.5">
                <Avatar name={user.name} src={user.avatarUrl} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                </div>
              </div>

              <p className="px-3.5 pb-2 text-xs text-muted">
                {ROLE_LABELS[user.role]} ·{" "}
                {user.authProvider === "google" ? "Google" : "Email"}
              </p>

              {accountMenu.length > 0 && (
                <div className="my-1 border-t border-line-soft" />
              )}

              {accountMenu.map((item) => {
                const Icon = item.icon;
                const showBadge =
                  Boolean(item.showUnreadBadge) && unreadCount > 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    onClick={() => {
                      setIsAccountOpen(false);
                      onNavigate?.();
                    }}
                    className="flex items-center gap-3 px-3.5 py-2 text-sm text-body transition-colors hover:bg-surface-2 hover:text-ink focus-visible:bg-surface-2 focus-visible:outline-none"
                  >
                    <Icon
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-muted"
                    />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {showBadge && <UnreadCount count={unreadCount} />}
                  </Link>
                );
              })}

              <div className="my-1 border-t border-line-soft" />

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-3 px-3.5 py-2 text-sm text-body transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:bg-rose-50 focus-visible:outline-none disabled:opacity-60"
              >
                <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
                {isLoggingOut ? "Logging out…" : "Log out"}
              </button>
            </div>
          )}

          {/* the row that opens it */}
          <button
            type="button"
            onClick={() => setIsAccountOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={isAccountOpen}
            className={`flex w-full min-w-0 items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors ${FOCUS_ON_DARK} ${
              isAccountOpen ? "nav-glass-pill" : "bg-white/[0.04] ring-1 ring-inset ring-white/10 hover:bg-white/[0.08]"
            }`}
          >
            <span className="relative block shrink-0">
              <Avatar name={user.name} src={user.avatarUrl} size="sm" />
              <span
                title={
                  isLive
                    ? "Live updates connected"
                    : "Live updates disconnected — data refreshes on navigation"
                }
                aria-label={
                  isLive
                    ? "Live updates connected"
                    : "Live updates disconnected"
                }
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar ${
                  isLive ? "bg-brand-500" : "bg-subtle"
                }`}
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-white">
                {user.name}
              </span>
              <span className="block truncate text-xs text-white/50">
                {user.email}
              </span>
            </span>
            <ChevronsUpDown
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-white/40"
            />
          </button>
        </div>
      )}
    </aside>
  );
}
