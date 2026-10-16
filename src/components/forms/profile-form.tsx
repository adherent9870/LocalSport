"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Player } from "@/lib/types";

const defaultLat = 40.7128;
const defaultLng = -74.006;

type ProfileFormProps = {
  initialPlayer: Player | null;
  defaultName: string;
};

export function ProfileForm({ initialPlayer, defaultName }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: initialPlayer?.name ?? defaultName,
    sports: initialPlayer?.sports ?? "",
    area: initialPlayer?.area ?? "",
    bio: initialPlayer?.bio ?? "",
    latitude: initialPlayer?.latitude ?? defaultLat,
    longitude: initialPlayer?.longitude ?? defaultLng,
    lookingForGame: initialPlayer?.lookingForGame ?? true,
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
        setMessage("Location detected and updated.");
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
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error ?? "Unable to save profile.");
      }

      setMessage("Profile saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submitForm} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">My Sports Profile</h2>
      <p className="mt-1 text-sm text-slate-600">Keep your details updated so nearby players can connect.</p>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="profile-name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Display name</label>
          <input id="profile-name" required placeholder="Your public player name" aria-label="Display name" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="profile-sports" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Sports</label>
          <input id="profile-sports" required placeholder="Football, badminton" aria-label="Sports" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.sports} onChange={(event) => setForm((prev) => ({ ...prev, sports: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="profile-area" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Area</label>
          <input id="profile-area" required placeholder="Neighborhood/locality" aria-label="Area" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.area} onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="profile-bio" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Bio</label>
          <input id="profile-bio" placeholder="Short introduction" aria-label="Bio" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.bio} onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="profile-lat" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Latitude</label>
          <input id="profile-lat" type="number" step="any" required placeholder="Latitude" aria-label="Latitude" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.latitude} onChange={(event) => setForm((prev) => ({ ...prev, latitude: Number(event.target.value) }))} />
        </div>
        <div>
          <label htmlFor="profile-lng" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Longitude</label>
          <input id="profile-lng" type="number" step="any" required placeholder="Longitude" aria-label="Longitude" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.longitude} onChange={(event) => setForm((prev) => ({ ...prev, longitude: Number(event.target.value) }))} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={detectLocation} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">
          Auto-detect location
        </button>
        <label className="flex items-center gap-2 text-xs text-slate-700">
          <input type="checkbox" aria-label="Looking for game" checked={form.lookingForGame} onChange={(event) => setForm((prev) => ({ ...prev, lookingForGame: event.target.checked }))} />
          Looking for game
        </label>
        <button disabled={loading} className="ml-auto rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {loading ? "Saving..." : "Save profile"}
        </button>
      </div>

      {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
