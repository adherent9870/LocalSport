"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const defaultLat = 40.7128;
const defaultLng = -74.006;

export function PlayerForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    sports: "",
    area: "",
    bio: "",
    latitude: defaultLat,
    longitude: defaultLng,
    lookingForGame: true,
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
      () => {
        setMessage("Unable to capture your location.");
      },
      { enableHighAccuracy: true },
    );
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error ?? "Unable to create player.");
      }

      setForm((prev) => ({ ...prev, name: "", sports: "", area: "", bio: "" }));
      setMessage("Player profile created.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create player.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submitForm} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Create Player Profile</h2>
      <p className="mt-1 text-sm text-slate-600">Register yourself so nearby players can find you.</p>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <input
          required
          placeholder="Name"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        />
        <input
          required
          placeholder="Sports you play"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={form.sports}
          onChange={(event) => setForm((prev) => ({ ...prev, sports: event.target.value }))}
        />
        <input
          required
          placeholder="Local area"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={form.area}
          onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))}
        />
        <input
          placeholder="Short bio"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={form.bio}
          onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
        />
        <input
          type="number"
          step="any"
          required
          placeholder="Latitude"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={form.latitude}
          onChange={(event) => setForm((prev) => ({ ...prev, latitude: Number(event.target.value) }))}
        />
        <input
          type="number"
          step="any"
          required
          placeholder="Longitude"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={form.longitude}
          onChange={(event) => setForm((prev) => ({ ...prev, longitude: Number(event.target.value) }))}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={detectLocation}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
        >
          Auto-detect location
        </button>
        <label className="flex items-center gap-2 text-xs text-slate-700">
          <input
            type="checkbox"
            checked={form.lookingForGame}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, lookingForGame: event.target.checked }))
            }
          />
          Looking for game
        </label>
        <button
          disabled={loading}
          className="ml-auto rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Player"}
        </button>
      </div>

      {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
