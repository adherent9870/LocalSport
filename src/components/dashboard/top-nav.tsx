"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard/search-players", label: "Search Player" },
  { href: "/dashboard/events", label: "Events" },
  { href: "/dashboard/search-groups", label: "Search Groups" },
  { href: "/dashboard/spots", label: "Spots" },
  { href: "/dashboard/requests", label: "Requests" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardTopNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
      <Link
        href="/dashboard"
        className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition md:text-sm ${
          pathname === "/dashboard"
            ? "bg-white text-slate-900 shadow"
            : "border border-white/20 bg-white/[0.05] text-slate-200 hover:bg-white/10 hover:text-white"
        }`}
      >
        Feed
      </Link>

      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition md:text-sm ${
              active
                ? "bg-white text-slate-900 shadow"
                : "border border-white/20 bg-white/[0.05] text-slate-200 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
