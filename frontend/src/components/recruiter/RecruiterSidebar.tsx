"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/recruiter/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/recruiter/jobs/create", label: "Create Job", icon: "➕" },
  { href: "/recruiter/applicants", label: "Applicants", icon: "👥" },
  { href: "/recruiter/reports", label: "Interview Reports", icon: "📋" },
  { href: "/recruiter/shortlisted", label: "Shortlisted", icon: "⭐" },
];

export function RecruiterSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">AIRecruitX</p>
            <p className="text-xs text-gray-500">HR Portal</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <Link
          href="/login/recruiter"
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          ← Log out
        </Link>
      </div>
    </aside>
  );
}
