"use client";

import { PortalSidebar, type NavItem } from "@/components/layout/PortalSidebar";

const navItems: NavItem[] = [
  { href: "/recruiter/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/recruiter/jobs/create", label: "Create Job", icon: "➕" },
  { href: "/recruiter/jobs", label: "My Jobs", icon: "💼" },
  { href: "/recruiter/applicants", label: "Applicants", icon: "👥" },
  { href: "/recruiter/reports", label: "Interview Reports", icon: "📋" },
  { href: "/recruiter/shortlisted", label: "Selected", icon: "⭐" },
  { href: "/recruiter/notifications", label: "Notifications", icon: "🔔" },
  { href: "/recruiter/support", label: "Support", icon: "💬" },
];

export function RecruiterSidebar() {
  return (
    <PortalSidebar
      portalName="HR Portal"
      navItems={navItems}
      loginPath="/login/recruiter"
    />
  );
}
