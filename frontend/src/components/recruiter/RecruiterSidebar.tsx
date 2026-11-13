"use client";

import {
  Bell,
  BriefcaseBusiness,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  MessageCircle,
  SquarePlus,
  Star,
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
      { href: "/recruiter/jobs/create", label: "Create Job", icon: SquarePlus },
      { href: "/recruiter/jobs", label: "My Jobs", icon: BriefcaseBusiness },
    ],
  },
  {
    title: "Candidates",
    items: [
      { href: "/recruiter/applicants", label: "Applicants", icon: Users },
      {
        href: "/recruiter/reports",
        label: "Interview Reports",
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
        label: "Learning Courses",
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

export function RecruiterSidebar() {
  return (
    <PortalSidebar
      portalName="HR Portal"
      portalTagline="Hiring Dashboard"
      navGroups={navGroups}
      accountMenu={accountMenu}
      homeHref="/recruiter/dashboard"
      loginPath="/login/recruiter"
    />
  );
}
