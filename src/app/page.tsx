import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/current-user";

export const dynamic = "force-dynamic";

const highlights = [
  {
    title: "Live Events & Spots",
    description: "Track active games, verified playing spots, and host activity in real time.",
  },
  {
    title: "Smart Local Discovery",
    description: "Find nearby players and games using geolocation-powered search screens.",
  },
  {
    title: "Professional Workflow",
    description: "Register, login, manage profile, publish events, and handle requests end-to-end.",
  },
];

export default async function LandingPage() {
  const viewer = await getViewer();

  if (viewer) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1800px] items-center px-4 py-10 md:px-8">
      <section className="grid w-full grid-cols-1 gap-6 rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900 via-indigo-950 to-cyan-950 p-6 shadow-2xl md:p-10 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-100">
            PlayLocal Sports Social
          </div>

          <h1 className="max-w-4xl text-4xl font-bold leading-tight text-white md:text-6xl">
            One complete platform for local sports communities.
          </h1>

          <p className="max-w-3xl text-sm text-slate-200 md:text-base">
            Overview: discover players by locality, create events at spots, send join requests,
            and use map-based geolocation to find nearby games.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100">
              Register
            </Link>
            <Link href="/login" className="rounded-xl border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
              Login
            </Link>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
          {highlights.map((item) => (
            <article key={item.title} className="rounded-xl border border-white/15 bg-white/[0.08] p-4">
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-xs text-slate-200">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
