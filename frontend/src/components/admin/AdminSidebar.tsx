"use client";

import {
  Activity,
  ChartNoAxesColumnIncreasing,
  FolderKanban,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  ScrollText,
  Settings,
  Users,
} from "lucide-react";

import type { ReactNode } from "react";
import {
  PortalSidebar,
  type NavGroup,
  type NavItem,
} from "@/components/layout/PortalSidebar";
import { PortalShell, type PortalConfig } from "@/components/layout/PortalShell";

const navGroups: NavGroup[] = [
  {
    items: [
      { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    ],
  },
  {
    title: "Platform",
    items: [
      { href: "/admin/users", label: "User management", icon: Users },
      {
        href: "/admin/content",
        label: "Jobs & applications",
        icon: FolderKanban,
      },
    ],
  },
  {
    title: "Insight",
    items: [
      {
        href: "/admin/reports",
        label: "Reports",
        icon: ChartNoAxesColumnIncreasing,
      },
      { href: "/admin/activity-logs", label: "Activity log", icon: ScrollText },
      { href: "/admin/monitoring", label: "Monitoring", icon: Activity },
    ],
  },
  {
    title: "General",
    items: [
      { href: "/admin/support", label: "Support desk", icon: LifeBuoy },
      { href: "/admin/notifications", label: "Broadcast", icon: Megaphone },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

/**
 * Shortcuts in the account card. /admin/notifications is the broadcast
 * composer rather than an inbox, so it is deliberately not offered here.
 */
const accountMenu: NavItem[] = [
  { href: "/admin/settings", label: "Platform settings", icon: Settings },
  { href: "/admin/support", label: "Support desk", icon: LifeBuoy },
];

/** The admin portal's chrome: nav, account shortcuts, home and login. */
export const ADMIN_PORTAL: PortalConfig = {
  portalName: "Admin Portal",
  portalTagline: "Platform Control",
  navGroups,
  accountMenu,
  homeHref: "/admin/dashboard",
  loginPath: "/login/recruiter",
};

export function AdminSidebar() {
  return <PortalSidebar {...ADMIN_PORTAL} />;
}

/** Responsive portal frame (sidebar / top bar / drawer) for the admin portal. */
export function AdminShell({ children }: { children: ReactNode }) {
  return <PortalShell portal={ADMIN_PORTAL}>{children}</PortalShell>;
}
