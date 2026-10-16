import { SearchPlayersNear } from "@/components/dashboard/search-players-near";
import { getPlayers } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export default async function DashboardSearchPlayersPage() {
  const players = await getPlayers();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/15 bg-white/95 p-6 text-slate-900 shadow-2xl">
        <h1 className="text-2xl font-bold md:text-3xl">Search Players Near Me</h1>
        <p className="mt-1 text-sm text-slate-600">Use precise geolocation to find players in your locality.</p>
      </section>
      <SearchPlayersNear players={players} />
    </div>
  );
}
