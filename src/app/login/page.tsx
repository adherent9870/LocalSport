import { redirect } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { getViewer } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const viewer = await getViewer();

  if (viewer) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[1800px] place-items-center px-4 py-10 md:px-8">
      <section className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900 via-indigo-900 to-cyan-900 p-1 shadow-2xl lg:grid-cols-2">
        <div className="flex flex-col justify-between rounded-[1.35rem] bg-white/10 p-8 text-white backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-200">Account Access</p>
            <h2 className="mt-3 text-3xl font-bold">Welcome back to PlayLocal</h2>
            <p className="mt-3 text-sm text-slate-100">
              Login to your sports dashboard and continue managing events and local play.
            </p>
          </div>
          <p className="text-sm text-slate-200">
            New here? <Link href="/register" className="font-semibold text-white underline">Create account</Link>
          </p>
        </div>
        <div className="rounded-[1.35rem] bg-white p-4 md:p-8">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
