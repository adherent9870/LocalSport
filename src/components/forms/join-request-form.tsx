"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { EventItem } from "@/lib/types";

export function JoinRequestForm({ events }: { events: EventItem[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    eventId: "",
    message: "I can join and bring good energy for this match.",
  });

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/join-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: Number(form.eventId),
          message: form.message,
        }),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error ?? "Unable to create join request.");
      }

      setMessage("Join request submitted.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create join request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submitForm} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Request to Join Event</h2>
      <p className="mt-1 text-sm text-slate-600">Send your message directly to the event host.</p>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600" htmlFor="join-event-id">
          Event
        </label>
        <select
          id="join-event-id"
          required
          aria-label="Select event"
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          value={form.eventId}
          onChange={(event) => setForm((prev) => ({ ...prev, eventId: event.target.value }))}
        >
          <option value="">Select event</option>
          {events.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title} - {item.spotName}
            </option>
          ))}
        </select>

        <label className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-600" htmlFor="join-message">
          Message
        </label>
        <textarea
          id="join-message"
          aria-label="Join request message"
          placeholder="Introduce yourself and mention why you'd like to join"
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          value={form.message}
          onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
        />
      </div>

      <button disabled={loading} className="mt-4 rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {loading ? "Sending..." : "Send request"}
      </button>

      {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
