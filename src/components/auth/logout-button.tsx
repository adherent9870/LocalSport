"use client";

import { useRouter } from "next/navigation";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className={
        className ??
        "rounded-lg border border-white/25 bg-white/[0.05] px-3 py-1.5 text-sm font-medium text-white hover:bg-white/15"
      }
    >
      Logout
    </button>
  );
}
