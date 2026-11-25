"use client";

import {
  Bell,
  BriefcaseBusiness,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  MessageCircle,
  SquarePlus,
  Star,
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
      {
        href: "/recruiter/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Hiring",
    items: [
      { href: "/recruiter/jobs/create", label: "Create job", icon: SquarePlus },
      { href: "/recruiter/jobs", label: "My jobs", icon: BriefcaseBusiness },
      {
        href: "/recruiter/question-pool",
        label: "Question pool",
        icon: ListChecks,
      },
    ],
  },
  {
    title: "Candidates",
    items: [
      { href: "/recruiter/applicants", label: "Applicants", icon: Users },
      {
        href: "/recruiter/reports",
        label: "Interview reports",
        icon: ClipboardList,
      },
      { href: "/recruiter/shortlisted", label: "Selected", icon: Star },
    ],
  },
  {
    title: "General",
    items: [
      {
        href: "/recruiter/courses",
        label: "Learning courses",
        icon: GraduationCap,
      },
      {
        href: "/recruiter/notifications",
        label: "Notifications",
        icon: Bell,
        showUnreadBadge: true,
      },
      { href: "/recruiter/support", label: "Support", icon: MessageCircle },
    ],
  },
];

/**
 * Shortcuts in the account card. The HR portal has no profile page — only the
 * candidate role can PATCH /api/auth/profile — so one isn't offered here.
 */
const accountMenu: NavItem[] = [
  {
    href: "/recruiter/notifications",
    label: "Notifications",
    icon: Bell,
    showUnreadBadge: true,
  },
  { href: "/recruiter/support", label: "Support", icon: MessageCircle },
];

/** The HR portal's chrome: nav, account shortcuts, home and login. */
export const RECRUITER_PORTAL: PortalConfig = {
  portalName: "HR Portal",
  portalTagline: "Hiring Dashboard",
  navGroups,
  accountMenu,
  homeHref: "/recruiter/dashboard",
  loginPath: "/login/recruiter",
};

export function RecruiterSidebar() {
  return <PortalSidebar {...RECRUITER_PORTAL} />;
}

/** Responsive portal frame (sidebar / top bar / drawer) for the HR portal. */
export function RecruiterShell({ children }: { children: ReactNode }) {
  return <PortalShell portal={RECRUITER_PORTAL}>{children}</PortalShell>;
}
