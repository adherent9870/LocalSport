"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import type { Viewer } from "@/lib/types";

const links = [
  { href: "/", label: "Home" },
  { href: "/players", label: "Players" },
  { href: "/spots", label: "Spots" },
  { href: "/events", label: "Events" },
  { href: "/requests", label: "Requests" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav({ viewer }: { viewer: Viewer }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/15 bg-slate-950/90 text-white backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[1800px] px-4 md:px-8">
        <div className="flex min-h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 text-sm font-bold text-white shadow-lg shadow-cyan-500/30">
              P
            </span>
            <span className="text-base font-semibold tracking-tight text-white md:text-lg">
              PlayLocal Sports
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-xl border border-white/10 bg-white/[0.06] p-1 lg:flex">
            {links.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-white text-slate-900 shadow"
                      : "text-slate-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {viewer ? (
              <>
                <span className="hidden rounded-lg border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs text-slate-100 md:inline">
                  {viewer.user.fullName}
                </span>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg border border-white/25 px-3 py-1.5 text-sm text-white hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        <nav className="flex items-center gap-2 overflow-x-auto pb-3 lg:hidden">
          {links.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={`mobile-${link.href}`}
                href={link.href}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-white text-slate-900"
                    : "border border-white/20 bg-white/[0.05] text-slate-200"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
