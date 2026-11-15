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

import {
  PortalSidebar,
  type NavGroup,
  type NavItem,
} from "@/components/layout/PortalSidebar";

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
    title: "Job Board",
    items: [
      { href: "/candidate/jobs", label: "Job Board", icon: BriefcaseBusiness },
      { href: "/candidate/resume", label: "Resume", icon: FileUser },
    ],
  },
  {
    title: "Applications",
    items: [
      {
        href: "/candidate/applications",
        label: "My Applications",
        icon: ClipboardList,
      },
      {
        href: "/candidate/interview/result",
        label: "Interview Results",
        icon: ChartNoAxesColumnIncreasing,
      },
    ],
  },
  {
    title: "Interview Preparation",
    items: [
      { href: "/candidate/interview/basic", label: "Basic Interview", icon: Mic },
      {
        href: "/candidate/interview/advanced",
        label: "Technical Interview",
        icon: Code2,
      },
      { href: "/candidate/learning", label: "Learning", icon: GraduationCap },
    ],
  },
  {
    title: "General",
    items: [
      { href: "/candidate/profile", label: "My Profile", icon: UserRound },
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
  { href: "/candidate/profile", label: "My Profile", icon: UserRound },
  {
    href: "/candidate/notifications",
    label: "Notifications",
    icon: Bell,
    showUnreadBadge: true,
  },
  { href: "/candidate/support", label: "Support", icon: MessageCircle },
];

export function CandidateSidebar() {
  return (
    <PortalSidebar
      portalName="Candidate Portal"
      portalTagline="Career Dashboard"
      navGroups={navGroups}
      accountMenu={accountMenu}
      homeHref="/candidate/dashboard"
      loginPath="/login/candidate"
    />
  );
}
