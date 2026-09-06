"use client";

import { PortalSidebar, type NavItem } from "@/components/layout/PortalSidebar";

const navItems: NavItem[] = [
  { href: "/candidate/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/candidate/resume", label: "Resume Upload", icon: "📄" },
  { href: "/candidate/jobs", label: "Job Board", icon: "💼" },
  { href: "/candidate/applications", label: "My Applications", icon: "📨" },
  { href: "/candidate/interview/basic", label: "Practice — Beginner", icon: "🎤" },
  { href: "/candidate/interview/advanced", label: "Practice — Advanced", icon: "🚀" },
  { href: "/candidate/interview/result", label: "Interview Results", icon: "📈" },
  { href: "/candidate/notifications", label: "Notifications", icon: "🔔" },
  { href: "/candidate/support", label: "Support", icon: "💬" },
];

export function CandidateSidebar() {
  return (
    <PortalSidebar
      portalName="Candidate Portal"
      navItems={navItems}
      loginPath="/login/candidate"
    />
  );
}
