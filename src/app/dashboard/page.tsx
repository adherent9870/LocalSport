import Link from "next/link";
import { LocalityMap } from "@/components/locality-map";
import { NearbyEventsPanel } from "@/components/dashboard/nearby-events-panel";
import { getHomePayload } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export default async function DashboardFeedPage() {
  const data = await getHomePayload();

  const now = Date.now();

  const liveEvents = data.events.filter((event) => {
    const start = new Date(event.startTime).getTime();
    return Math.abs(now - start) <= 2 * 60 * 60 * 1000;
  });

  const upcomingEvents = data.events
    .filter((event) => new Date(event.startTime).getTime() > now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const pastEvents = data.events
    .filter((event) => new Date(event.startTime).getTime() < now - 2 * 60 * 60 * 1000)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const activeSpotIds = new Set(data.events.map((event) => event.spotId));
  const activeSpots = data.spots.filter((spot) => activeSpotIds.has(spot.id));

  const center = activeSpots[0]
    ? { lat: activeSpots[0].latitude, lng: activeSpots[0].longitude }
    : data.spots[0]
      ? { lat: data.spots[0].latitude, lng: data.spots[0].longitude }
      : { lat: 40.7128, lng: -74.006 };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/15 bg-gradient-to-r from-slate-900 via-indigo-900 to-cyan-900 p-6 shadow-2xl md:p-8">
        <h1 className="text-3xl font-bold text-white md:text-4xl">Dashboard Feed</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-200 md:text-base">
          See nearby matches, live activity, upcoming games, active spots, and complete participation flow.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/dashboard/events" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900">
            Create / Manage Events
          </Link>
          <Link href="/dashboard/requests" className="rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold text-white">
            Open Requests
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard title="Live" value={liveEvents.length} />
        <StatCard title="Upcoming" value={upcomingEvents.length} />
        <StatCard title="Past" value={pastEvents.length} />
        <StatCard title="Active Spots" value={activeSpots.length} />
        <StatCard title="Groups" value={data.groups.length} />
      </section>

      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-white/15 bg-white/95 p-6 text-slate-900 shadow-2xl">
          <h2 className="text-xl font-semibold">Active Spots Map</h2>
          <p className="mt-1 text-sm text-slate-600">
            Map highlights active spots hosting live or scheduled matches.
          </p>
          <div className="mt-4">
            <LocalityMap players={[]} spots={activeSpots.length > 0 ? activeSpots : data.spots} events={data.events} center={center} />
          </div>
        </div>

        <NearbyEventsPanel events={data.events} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <EventColumn title="Live Matches" items={liveEvents} emptyText="No live matches right now." tone="rose" />
        <EventColumn title="Upcoming Matches" items={upcomingEvents.slice(0, 8)} emptyText="No upcoming matches yet." tone="emerald" />
        <EventColumn title="Else / Completed" items={pastEvents.slice(0, 8)} emptyText="No completed matches yet." tone="slate" />
      </section>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <article className="rounded-2xl border border-white/15 bg-white/95 p-4 text-slate-900 shadow-xl">
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </article>
  );
}

function EventColumn({
  title,
  items,
  emptyText,
  tone,
}: {
  title: string;
  items: Array<{
    id: number;
    title: string;
    sport: string;
    spotName: string;
    spotArea: string;
    startTime: string;
  }>;
  emptyText: string;
  tone: "rose" | "emerald" | "slate";
}) {
  const toneClass =
    tone === "rose"
      ? "bg-rose-100 text-rose-700"
      : tone === "emerald"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-slate-100 text-slate-700";

  return (
    <div className="rounded-3xl border border-white/15 bg-white/95 p-6 text-slate-900 shadow-2xl">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">{emptyText}</p>
        ) : (
          items.map((event) => (
            <article key={event.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{event.title}</p>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${toneClass}`}>{event.sport}</span>
              </div>
              <p className="text-xs text-slate-600">{event.spotName} · {event.spotArea}</p>
              <p className="text-xs text-slate-600">{new Date(event.startTime).toLocaleString()}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
