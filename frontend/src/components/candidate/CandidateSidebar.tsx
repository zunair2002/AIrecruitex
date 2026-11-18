"use client";

import {
  Bell,
  BriefcaseBusiness,
  ChartNoAxesColumnIncreasing,
  ClipboardList,
  Code2,
  FileUser,
  GraduationCap,
  LayoutDashboard,
  MessageCircle,
  Mic,
  UserRound,
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
        href: "/candidate/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Job board",
    items: [
      { href: "/candidate/jobs", label: "Job board", icon: BriefcaseBusiness },
      { href: "/candidate/resume", label: "Resume", icon: FileUser },
    ],
  },
  {
    title: "Applications",
    items: [
      {
        href: "/candidate/applications",
        label: "My applications",
        icon: ClipboardList,
      },
      {
        href: "/candidate/interview/result",
        label: "Interview results",
        icon: ChartNoAxesColumnIncreasing,
      },
    ],
  },
  {
    title: "Interview preparation",
    items: [
      { href: "/candidate/interview/basic", label: "Basic interview", icon: Mic },
      {
        href: "/candidate/interview/advanced",
        label: "Technical interview",
        icon: Code2,
      },
      { href: "/candidate/learning", label: "Learning", icon: GraduationCap },
    ],
  },
  {
    title: "General",
    items: [
      { href: "/candidate/profile", label: "My profile", icon: UserRound },
      {
        href: "/candidate/notifications",
        label: "Notifications",
        icon: Bell,
        showUnreadBadge: true,
      },
      { href: "/candidate/support", label: "Support", icon: MessageCircle },
    ],
  },
];

/** Shortcuts in the account card. Only routes this portal actually has. */
const accountMenu: NavItem[] = [
  { href: "/candidate/profile", label: "My profile", icon: UserRound },
  {
    href: "/candidate/notifications",
    label: "Notifications",
    icon: Bell,
    showUnreadBadge: true,
  },
  { href: "/candidate/support", label: "Support", icon: MessageCircle },
];

/** The candidate portal's chrome: nav, account shortcuts, home and login. */
export const CANDIDATE_PORTAL: PortalConfig = {
  portalName: "Candidate Portal",
  portalTagline: "Career Dashboard",
  navGroups,
  accountMenu,
  homeHref: "/candidate/dashboard",
  loginPath: "/login/candidate",
};

export function CandidateSidebar() {
  return <PortalSidebar {...CANDIDATE_PORTAL} />;
}

/** Responsive portal frame (sidebar / top bar / drawer) for the candidate portal. */
export function CandidatePortalShell({ children }: { children: ReactNode }) {
  return <PortalShell portal={CANDIDATE_PORTAL}>{children}</PortalShell>;
}
