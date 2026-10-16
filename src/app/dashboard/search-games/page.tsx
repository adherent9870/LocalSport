import { SearchGamesNear } from "@/components/dashboard/search-games-near";
import { getEvents } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export default async function DashboardSearchGamesPage() {
  const events = await getEvents();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/15 bg-white/95 p-6 text-slate-900 shadow-2xl">
        <h1 className="text-2xl font-bold md:text-3xl">Search Game Near Me</h1>
        <p className="mt-1 text-sm text-slate-600">Find nearby games based on your current location and selected radius.</p>
      </section>
      <SearchGamesNear events={events} />
    </div>
  );
}
