"use client";

import { PortalSidebar, type NavItem } from "@/components/layout/PortalSidebar";

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Overview", icon: "📊" },
  { href: "/admin/users", label: "User Management", icon: "👤" },
  { href: "/admin/content", label: "Jobs & Applications", icon: "🗂️" },
  { href: "/admin/reports", label: "Reports", icon: "📈" },
  { href: "/admin/activity-logs", label: "Activity Log", icon: "📜" },
  { href: "/admin/support", label: "Support Desk", icon: "🎫" },
  { href: "/admin/notifications", label: "Broadcast", icon: "📢" },
  { href: "/admin/monitoring", label: "Monitoring", icon: "🩺" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export function AdminSidebar() {
  return (
    <PortalSidebar
      portalName="Admin Portal"
      navItems={navItems}
      loginPath="/login/recruiter"
    />
  );
}
