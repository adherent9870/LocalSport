import { JoinRequestForm } from "@/components/forms/join-request-form";
import { RequestStatusActions } from "@/components/forms/request-status-actions";
import { getEvents, getJoinRequests } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export default async function DashboardRequestsPage() {
  const [events, requests] = await Promise.all([getEvents(), getJoinRequests()]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/15 bg-white/95 p-6 text-slate-900 shadow-2xl">
        <h1 className="text-2xl font-bold md:text-3xl">Requests</h1>
        <p className="mt-1 text-sm text-slate-600">
          Send join requests and manage incoming participation requests for your hosted events.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        <JoinRequestForm events={events} />

        <div className="rounded-3xl border border-white/15 bg-white/95 p-6 text-slate-900 shadow-2xl">
          <h2 className="text-lg font-semibold">Incoming / Recent Requests ({requests.length})</h2>
          <div className="mt-4 space-y-3">
            {requests.length === 0 ? (
              <p className="text-sm text-slate-500">No requests yet.</p>
            ) : (
              requests.map((item) => (
                <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="font-semibold text-slate-900">{item.playerName}</p>
                  <p className="text-xs text-slate-600">For event: {item.eventTitle}</p>
                  <p className="mt-1 text-sm text-slate-700">{item.message}</p>
                  <RequestStatusActions requestId={item.id} currentStatus={item.status} />
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
