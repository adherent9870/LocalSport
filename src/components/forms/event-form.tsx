"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { PlayingSpot } from "@/lib/types";

export function EventForm({ spots }: { spots: PlayingSpot[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    sport: "",
    description: "",
    startTime: "",
    maxPlayers: 12,
    spotId: "",
  });

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          spotId: Number(form.spotId),
          maxPlayers: Number(form.maxPlayers),
        }),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error ?? "Unable to create event.");
      }

      setForm((prev) => ({ ...prev, title: "", sport: "", description: "", startTime: "" }));
      setMessage("Event published.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create event.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submitForm} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Create Event</h2>
      <p className="mt-1 text-sm text-slate-600">Publish your match and let local players request to join.</p>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="event-title" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Event title</label>
          <input id="event-title" required placeholder="Weekend football scrimmage" aria-label="Event title" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="event-sport" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Sport</label>
          <input id="event-sport" required placeholder="Football" aria-label="Sport" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.sport} onChange={(event) => setForm((prev) => ({ ...prev, sport: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="event-start" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Start date & time</label>
          <input id="event-start" type="datetime-local" required aria-label="Start date and time" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.startTime} onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="event-max" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Max players</label>
          <input id="event-max" type="number" min={2} required aria-label="Maximum players" placeholder="12" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.maxPlayers} onChange={(event) => setForm((prev) => ({ ...prev, maxPlayers: Number(event.target.value) }))} />
        </div>
        <div>
          <label htmlFor="event-spot" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Playing spot</label>
          <select id="event-spot" required aria-label="Select playing spot" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.spotId} onChange={(event) => setForm((prev) => ({ ...prev, spotId: event.target.value }))}>
            <option value="">Select playing spot</option>
            {spots.map((spot) => (
              <option key={spot.id} value={spot.id}>
                {spot.name} ({spot.area})
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="event-notes" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Event notes</label>
          <textarea id="event-notes" aria-label="Event notes" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Game format, equipment, or arrival details" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
        </div>
      </div>

      <button disabled={loading} className="mt-4 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {loading ? "Publishing..." : "Publish event"}
      </button>

      {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
