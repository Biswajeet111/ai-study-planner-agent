"use client";

import { usePathname } from "next/navigation";
import SidebarNav from "./SidebarNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = pathname === "/" || pathname === "/login";

  if (isPublicRoute) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <div className="flex-1 min-w-0 pt-14 lg:pt-0">{children}</div>
    </div>
  );
}
