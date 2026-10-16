import { EventForm } from "@/components/forms/event-form";
import { JoinRequestForm } from "@/components/forms/join-request-form";
import { getEvents, getPlayingSpots } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export default async function DashboardEventsPage() {
  const [events, spots] = await Promise.all([getEvents(), getPlayingSpots()]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/15 bg-white/95 p-6 text-slate-900 shadow-2xl">
        <h1 className="text-2xl font-bold md:text-3xl">Events</h1>
        <p className="mt-1 text-sm text-slate-600">Create matches and manage participation requests professionally.</p>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <EventForm spots={spots} />
        <JoinRequestForm events={events} />
      </section>

      <section className="rounded-3xl border border-white/15 bg-white/95 p-6 text-slate-900 shadow-2xl">
        <h2 className="text-lg font-semibold">Current Event Feed ({events.length})</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {events.length === 0 ? (
            <p className="text-sm text-slate-500">No events created yet.</p>
          ) : (
            events.map((event) => (
              <article key={event.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{event.title}</p>
                  <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                    {event.sport}
                  </span>
                </div>
                <p className="text-xs text-slate-600">Host: {event.hostName}</p>
                <p className="text-xs text-slate-600">Spot: {event.spotName}</p>
                <p className="text-xs text-slate-600">{new Date(event.startTime).toLocaleString()}</p>
                <p className="text-xs text-slate-700">Requests: {event.requestCount} / {event.maxPlayers}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
