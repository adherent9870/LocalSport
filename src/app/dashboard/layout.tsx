import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { DashboardTopNav } from "@/components/dashboard/top-nav";
import { getViewer } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const viewer = await getViewer();

  if (!viewer) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/15 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-[1800px] px-4 py-3 md:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-3">
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 text-sm font-bold text-white shadow-lg shadow-cyan-500/30">
                  P
                </span>
                <div>
                  <p className="text-sm font-semibold text-white md:text-base">PlayLocal Dashboard</p>
                  <p className="text-[11px] text-slate-300">{viewer.user.fullName}</p>
                </div>
              </Link>
              <LogoutButton className="rounded-lg border border-white/25 bg-white/[0.05] px-3 py-1.5 text-sm font-medium text-white hover:bg-white/15" />
            </div>
            <DashboardTopNav />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1800px] px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
