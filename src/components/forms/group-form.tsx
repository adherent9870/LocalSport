"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const defaultLat = 40.7128;
const defaultLng = -74.006;

export function GroupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    sport: "",
    area: "",
    description: "",
    latitude: defaultLat,
    longitude: defaultLng,
  });

  function detectLocation() {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setMessage("Location captured.");
      },
      () => setMessage("Unable to capture your location."),
      { enableHighAccuracy: true },
    );
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error ?? "Unable to create group.");
      }

      setForm((prev) => ({ ...prev, name: "", sport: "", area: "", description: "" }));
      setMessage("Group created successfully.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create group.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submitForm} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Create Sports Group</h2>
      <p className="mt-1 text-sm text-slate-600">Build local teams and regular play circles by area and sport.</p>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="group-name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Group name</label>
          <input id="group-name" required placeholder="Weekend Football Squad" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="group-sport" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Sport</label>
          <input id="group-sport" required placeholder="Football" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.sport} onChange={(event) => setForm((prev) => ({ ...prev, sport: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="group-area" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Area</label>
          <input id="group-area" required placeholder="City Center" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.area} onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="group-description" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Description</label>
          <input id="group-description" placeholder="Open to intermediate players" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="group-lat" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Latitude</label>
          <input id="group-lat" type="number" step="any" required placeholder="Latitude" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.latitude} onChange={(event) => setForm((prev) => ({ ...prev, latitude: Number(event.target.value) }))} />
        </div>
        <div>
          <label htmlFor="group-lng" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Longitude</label>
          <input id="group-lng" type="number" step="any" required placeholder="Longitude" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.longitude} onChange={(event) => setForm((prev) => ({ ...prev, longitude: Number(event.target.value) }))} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button type="button" onClick={detectLocation} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">
          Auto-detect location
        </button>
        <button disabled={loading} className="ml-auto rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {loading ? "Saving..." : "Save group"}
        </button>
      </div>

      {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
