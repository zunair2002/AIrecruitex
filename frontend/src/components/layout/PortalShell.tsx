"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUnreadNotifications } from "@/components/shared/useUnreadNotifications";
import {
  PortalSidebarPanel,
  type PortalSidebarProps,
} from "@/components/layout/PortalSidebar";
import { BrandWordmark } from "@/components/layout/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { iconButtonClass } from "@/components/ui/Button";

/** Everything a portal needs to describe its chrome (same as the sidebar props). */
export type PortalConfig = PortalSidebarProps;

/**
 * The responsive frame shared by the candidate, HR and admin portals.
 *
 * - ≥ lg: a fixed dark sidebar (w-64); the content column is offset and the
 *   window scrolls — no inner scroll panes.
 * - < lg: a sticky 56px top bar (menu, brand, notifications, avatar). The menu
 *   opens the same sidebar as a left drawer, which closes on navigation,
 *   backdrop click, Escape and its close button, and locks page scroll.
 *
 * Pages render inside `<main id="main-content">`; sticky elements inside a page
 * should use `top-16 lg:top-6` so they clear the mobile top bar.
 */
export function PortalShell({
  portal,
  children,
}: {
  portal: PortalConfig;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const unreadCount = useUnreadNotifications();

  // The drawer remembers the path it was opened on, so it is closed the moment
  // the route changes — no effect needed to reset it.
  const [drawerPath, setDrawerPath] = useState<string | null>(null);
  const isDrawerOpen = drawerPath !== null && drawerPath === pathname;

  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  /** Set when the user dismisses the drawer, so focus goes back to the menu button. */
  const restoreFocusRef = useRef(false);
  const drawerId = useId();

  const inboxItem = portal.navGroups
    .flatMap((group) => group.items)
    .find((item) => item.showUnreadBadge);
  const shortName = portal.portalName.replace(/\s*portal$/i, "");

  const openDrawer = () => setDrawerPath(pathname);
  const closeDrawer = () => {
    restoreFocusRef.current = true;
    setDrawerPath(null);
  };
  const closeAfterNavigation = () => setDrawerPath(null);

  useEffect(() => {
    if (!isDrawerOpen) {
      // The content column was inert while the drawer was open, so focus can
      // only move back once that has been committed — i.e. here.
      if (restoreFocusRef.current) {
        restoreFocusRef.current = false;
        menuButtonRef.current?.focus();
      }
      return;
    }

    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      restoreFocusRef.current = true;
      setDrawerPath(null);
    };
    // Growing past the breakpoint swaps the drawer for the fixed sidebar.
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = () => {
      if (desktop.matches) setDrawerPath(null);
    };

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [isDrawerOpen]);

  return (
    // The gradient paints the sidebar colour down the whole page behind the
    // fixed sidebar, so overscroll and full-page captures never show a gap.
    <div className="min-h-dvh bg-canvas lg:bg-[linear-gradient(to_right,var(--color-sidebar)_16rem,var(--color-canvas)_16rem)]">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[60] -translate-y-24 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink shadow-lg ring-1 ring-line transition-transform focus:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        Skip to content
      </a>

      {/* ---- desktop sidebar ---- */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64">
        <PortalSidebarPanel {...portal} unreadCount={unreadCount} />
      </div>

      {/* ---- mobile drawer ---- */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            aria-hidden="true"
            onClick={closeDrawer}
            className="absolute inset-0 bg-ink/50 backdrop-blur-[2px] motion-safe:animate-fade-in"
          />
          <div
            id={drawerId}
            role="dialog"
            aria-modal="true"
            aria-label={`${portal.portalName} navigation`}
            className="relative flex h-full w-72 max-w-[85vw] shadow-xl motion-safe:animate-drawer-in"
          >
            <PortalSidebarPanel
              {...portal}
              unreadCount={unreadCount}
              onClose={closeDrawer}
              onNavigate={closeAfterNavigation}
              closeButtonRef={closeButtonRef}
            />
          </div>
        </div>
      )}

      {/* ---- content column ---- */}
      <div
        className="flex min-h-dvh flex-col bg-canvas lg:ml-64"
        inert={isDrawerOpen}
      >
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-white/60 bg-white/70 px-4 shadow-[0_1px_0_rgb(16_24_40/0.06)] backdrop-blur-xl backdrop-saturate-150 sm:px-6 lg:hidden">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={openDrawer}
            aria-label="Open navigation"
            aria-expanded={isDrawerOpen}
            aria-controls={isDrawerOpen ? drawerId : undefined}
            className={iconButtonClass({
              variant: "ghost",
              size: "md",
              className: "-ml-2 text-ink",
            })}
          >
            <Menu aria-hidden="true" />
          </button>

          <Link
            href={portal.homeHref}
            className="flex min-w-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <BrandWordmark className="text-lg" />
            <span className="hidden truncate rounded-full bg-surface-3 px-2 py-0.5 text-xs font-medium text-muted min-[360px]:inline">
              {shortName}
            </span>
          </Link>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            {inboxItem && (
              <Link
                href={inboxItem.href}
                aria-label={
                  unreadCount > 0
                    ? `${inboxItem.label}, ${unreadCount} unread`
                    : inboxItem.label
                }
                className={iconButtonClass({
                  variant: "ghost",
                  size: "md",
                  className: "relative text-body",
                })}
              >
                <Bell aria-hidden="true" />
                {unreadCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-white"
                  />
                )}
              </Link>
            )}
            {user && (
              <Avatar
                name={user.name}
                src={user.avatarUrl}
                size="sm"
                className="ml-1"
              />
            )}
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="min-w-0 flex-1 focus:outline-none"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
