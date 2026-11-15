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

import {
  PortalSidebar,
  type NavGroup,
  type NavItem,
} from "@/components/layout/PortalSidebar";

const navGroups: NavGroup[] = [
  {
    items: [
      { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    ],
  },
  {
    title: "Platform",
    items: [
      { href: "/admin/users", label: "User Management", icon: Users },
      {
        href: "/admin/content",
        label: "Jobs & Applications",
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
      { href: "/admin/activity-logs", label: "Activity Log", icon: ScrollText },
      { href: "/admin/monitoring", label: "Monitoring", icon: Activity },
    ],
  },
  {
    title: "General",
    items: [
      { href: "/admin/support", label: "Support Desk", icon: LifeBuoy },
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
  { href: "/admin/settings", label: "Platform Settings", icon: Settings },
  { href: "/admin/support", label: "Support Desk", icon: LifeBuoy },
];

export function AdminSidebar() {
  return (
    <PortalSidebar
      portalName="Admin Portal"
      portalTagline="Platform Control"
      navGroups={navGroups}
      accountMenu={accountMenu}
      homeHref="/admin/dashboard"
      loginPath="/login/recruiter"
    />
  );
}
