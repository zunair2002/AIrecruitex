"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  ClipboardList,
  Code2,
  FileUser,
  LayoutDashboard,
  MessageCircle,
  Mic,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRealtimeConnected } from "@/context/RealtimeContext";
import { initials } from "@/lib/format";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

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
      {
        href: "/candidate/jobs",
        label: "Job Board",
        icon: BriefcaseBusiness,
      },
      {
        href: "/candidate/resume",
        label: "Resume",
        icon: FileUser,
      },
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
      {
        href: "/candidate/interview/basic",
        label: "Basic Interview",
        icon: Mic,
      },
      {
        href: "/candidate/interview/advanced",
        label: "Technical Interview",
        icon: Code2,
      },
    ],
  },
  {
    title: "General",
    items: [
      {
        href: "/candidate/notifications",
        label: "Notifications",
        icon: Bell,
      },
      {
        href: "/candidate/support",
        label: "Support",
        icon: MessageCircle,
      },
    ],
  },
];

export function CandidateSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isLive = useRealtimeConnected();

  // Empty array = all categories open by default
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);

  const toggleGroup = (title: string) => {
    setCollapsedGroups((previous) =>
      previous.includes(title)
        ? previous.filter((group) => group !== title)
        : [...previous, title]
    );
  };

  return (
    <aside className="sticky top-0 flex h-dvh max-h-dvh w-60 shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#1e1838] px-2.5 py-3.5">
      {/* Portal Header */}
      <div className="mb-5 px-3">
        <h2 className="text-sm font-semibold tracking-tight text-white">
          Candidate Portal
        </h2>
        <p className="mt-1 text-xs text-purple-300/60">
          Career Dashboard
        </p>
      </div>

      {/* Navigation Groups */}
      <nav className="min-h-0 flex-1 space-y-3 overflow-y-auto">
        {navGroups.map((group, index) => {
          const title = group.title;
          const isCollapsed = title
            ? collapsedGroups.includes(title)
            : false;
          const links = group.items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[11px] transition-colors duration-150 ${
                  isActive
                    ? "bg-white/10 font-medium text-emerald-300"
                    : "font-normal text-purple-100/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon
                  aria-hidden="true"
                  className={`h-3.5 w-3.5 shrink-0 ${
                    isActive ? "text-emerald-400" : "text-purple-300/60"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          });

          return (
            <section key={title ?? `standalone-${index}`}>
              {title ? (
                <>
                  <button
                    type="button"
                    onClick={() => toggleGroup(title)}
                    aria-expanded={!isCollapsed}
                    className="flex w-full items-center justify-between rounded-md px-3 py-1 text-left text-[9px] font-semibold uppercase tracking-[0.12em] text-purple-300/60 transition-colors hover:text-white"
                  >
                    <span>{title}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-3 w-3 transition-transform duration-200 ${
                        isCollapsed ? "-rotate-90" : "rotate-0"
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-200 ${
                      isCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="mt-0.5 space-y-0.5">{links}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-0.5">{links}</div>
              )}
            </section>
          );
        })}
      </nav>

      {user && (
        <div className="mt-auto border-t border-white/10 pt-3">
          <div className="flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-1.5">
            <span className="relative block h-8 w-8 shrink-0">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-white/20"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-emerald-300 ring-1 ring-white/20">
                  {initials(user.name)}
                </span>
              )}
              <span
                title={
                  isLive
                    ? "Live updates connected"
                    : "Live updates disconnected"
                }
                aria-label={
                  isLive
                    ? "Live updates connected"
                    : "Live updates disconnected"
                }
                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#1e1838] ${
                  isLive ? "bg-emerald-500" : "bg-slate-500"
                }`}
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                {user.name}
              </p>
              <p className="truncate text-[10px] text-purple-300/60">
                {isLive ? "Live" : "Offline"}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}