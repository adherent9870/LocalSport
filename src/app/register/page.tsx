import { redirect } from "next/navigation";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { getViewer } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const viewer = await getViewer();

  if (viewer) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[1800px] place-items-center px-4 py-10 md:px-8">
      <section className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900 via-violet-900 to-cyan-900 p-1 shadow-2xl">
        <div className="rounded-[1.35rem] bg-white p-4 md:p-8">
          <RegisterForm />
          <p className="mt-4 text-sm text-slate-600">
            Already have an account? <Link href="/login" className="font-semibold text-slate-900 underline">Login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
