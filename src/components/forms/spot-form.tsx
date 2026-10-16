"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const defaultLat = 40.7128;
const defaultLng = -74.006;

export function SpotForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    sport: "",
    area: "",
    address: "",
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
        setMessage("Location detected and filled.");
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
      const response = await fetch("/api/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error ?? "Unable to create spot.");
      }

      setForm((prev) => ({ ...prev, name: "", sport: "", area: "", address: "" }));
      setMessage("Playing spot created.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create spot.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submitForm} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Publish Playing Spot</h2>
      <p className="mt-1 text-sm text-slate-600">Add trusted grounds and courts for your neighborhood community.</p>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="spot-name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Spot name</label>
          <input id="spot-name" required placeholder="City central court" aria-label="Spot name" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="spot-sport" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Sport</label>
          <input id="spot-sport" required placeholder="Basketball" aria-label="Sport" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.sport} onChange={(event) => setForm((prev) => ({ ...prev, sport: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="spot-area" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Area</label>
          <input id="spot-area" required placeholder="Downtown locality" aria-label="Area" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.area} onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="spot-address" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Address</label>
          <input id="spot-address" required placeholder="Street and landmark" aria-label="Address" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="spot-lat" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Latitude</label>
          <input id="spot-lat" type="number" step="any" required placeholder="Latitude" aria-label="Latitude" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.latitude} onChange={(event) => setForm((prev) => ({ ...prev, latitude: Number(event.target.value) }))} />
        </div>
        <div>
          <label htmlFor="spot-lng" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Longitude</label>
          <input id="spot-lng" type="number" step="any" required placeholder="Longitude" aria-label="Longitude" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.longitude} onChange={(event) => setForm((prev) => ({ ...prev, longitude: Number(event.target.value) }))} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button type="button" onClick={detectLocation} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">
          Auto-detect location
        </button>
        <button disabled={loading} className="ml-auto rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {loading ? "Saving..." : "Save spot"}
        </button>
      </div>

      {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
