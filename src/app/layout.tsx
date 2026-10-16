import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlayLocal Sports Social",
  description:
    "Professional sports community platform to find players, manage events, and connect locally.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_20%,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_88%_18%,rgba(99,102,241,0.2),transparent_35%),radial-gradient(circle_at_55%_85%,rgba(168,85,247,0.18),transparent_35%)]" />
        {children}
      </body>
    </html>
  );
}
