import { LocalityMap } from "@/components/locality-map";
import { SpotForm } from "@/components/forms/spot-form";
import { getPlayingSpots } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export default async function DashboardSpotsPage() {
  const spots = await getPlayingSpots();

  const center = spots[0]
    ? { lat: spots[0].latitude, lng: spots[0].longitude }
    : { lat: 40.7128, lng: -74.006 };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/15 bg-white/95 p-6 text-slate-900 shadow-2xl">
        <h1 className="text-2xl font-bold md:text-3xl">Spots</h1>
        <p className="mt-1 text-sm text-slate-600">Create and manage verified playing spots in your locality.</p>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.2fr]">
        <SpotForm />

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/15 bg-white/95 p-6 text-slate-900 shadow-2xl">
            <h2 className="text-lg font-semibold">Spot Map</h2>
            <div className="mt-4">
              <LocalityMap players={[]} spots={spots} events={[]} center={center} />
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/95 p-6 text-slate-900 shadow-2xl">
            <h2 className="text-lg font-semibold">Spot Directory ({spots.length})</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {spots.length === 0 ? (
                <p className="text-sm text-slate-500">No spots yet.</p>
              ) : (
                spots.map((spot) => (
                  <article key={spot.id} className="rounded-xl border border-slate-200 p-3">
                    <p className="font-semibold text-slate-900">{spot.name}</p>
                    <p className="text-xs text-slate-600">{spot.sport} · {spot.area}</p>
                    <p className="text-xs text-slate-600">{spot.address}</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
