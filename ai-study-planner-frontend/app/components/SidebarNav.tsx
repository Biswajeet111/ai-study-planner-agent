"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { defaultUserProfile } from "../lib/userProfile";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
        <rect x="2" y="2" width="7" height="7" rx="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/schedule",
    label: "Study Plan",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <rect x="3" y="4" width="14" height="13" rx="2" />
        <path d="M7 2v3M13 2v3M3 8h14" />
      </svg>
    ),
  },
  {
    href: "/insights",
    label: "AI Insights",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <path d="M3 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z" />
        <path d="M7 7h4M7 10h5" />
        <path d="M15 6h2a1 1 0 0 1 1 1v8a2 2 0 0 1-2 2H8" />
      </svg>
    ),
  },
  {
    href: "/progress",
    label: "Progress Tracker",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <path d="M4 16V7M10 16V4M16 16V10" />
      </svg>
    ),
  },
  {
    href: "/study-plans",
    label: "Library",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <path d="M17 11a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6z" />
      </svg>
    ),
  },
  {
    href: "/chat",
    label: "AI Tutor",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <path d="M17 11a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6z" />
      </svg>
    ),
  },
  {
    href: "/milestones",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <circle cx="10" cy="7" r="3" />
        <path d="M4 17c1.2-2.2 3.4-3.4 6-3.4s4.8 1.2 6 3.4" />
      </svg>
    ),
  },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-[288px] lg:shrink-0 lg:flex-col lg:justify-between glass-sidebar text-white min-h-screen px-6 py-6 sticky top-0 h-screen">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="size-12 rounded-full bg-purple-500/20 border border-purple-400/30 grid place-items-center text-sm font-bold">
              {defaultUserProfile.initials}
            </div>
            <div>
              <h1 className="text-slate-100 font-bold text-lg leading-tight">StudyForge AI</h1>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive =
                item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-900/30"
                      : "text-slate-400 hover:bg-purple-500/10 hover:text-purple-300"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6">
          <Link
            href="/schedule"
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/30"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="10" r="7" />
              <path d="M10 6v4l2.5 2" />
            </svg>
            <span>Start Focus Session</span>
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar text-white flex items-center gap-2 px-4 py-3 shadow-lg">
        <span className="display-font font-bold text-lg mr-auto">StudyPilot</span>
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`p-2 rounded-lg transition-colors ${
                isActive ? "bg-white/20" : "text-blue-200 hover:bg-white/10"
              }`}
              title={item.label}
            >
              {item.icon}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
