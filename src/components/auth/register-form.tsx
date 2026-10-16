"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const defaultLat = 40.7128;
const defaultLng = -74.006;

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    playerName: "",
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
        setMessage("Location captured successfully.");
      },
      () => setMessage("Unable to capture location."),
      { enableHighAccuracy: true },
    );
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (form.password !== form.confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error ?? "Registration failed.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submitForm} className="rounded-3xl border border-white/50 bg-white/90 p-6 shadow-2xl backdrop-blur md:p-8">
      <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Create your account</h1>
      <p className="mt-2 text-sm text-slate-600">Complete registration with your full sports profile.</p>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="register-fullname" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Full name</label>
          <input id="register-fullname" required placeholder="John Alex" aria-label="Full name" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.fullName} onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value, playerName: prev.playerName || event.target.value }))} />
        </div>
        <div>
          <label htmlFor="register-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Email</label>
          <input id="register-email" required type="email" placeholder="name@example.com" aria-label="Email" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="register-password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Password</label>
          <input id="register-password" required type="password" minLength={8} placeholder="Minimum 8 characters" aria-label="Password" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="register-confirm" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Confirm password</label>
          <input id="register-confirm" required type="password" minLength={8} placeholder="Re-enter password" aria-label="Confirm password" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.confirmPassword} onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="register-playername" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Public player name</label>
          <input id="register-playername" required placeholder="Player nickname" aria-label="Public player name" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.playerName} onChange={(event) => setForm((prev) => ({ ...prev, playerName: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="register-sports" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Sports</label>
          <input id="register-sports" required placeholder="Football, badminton" aria-label="Sports" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.sports} onChange={(event) => setForm((prev) => ({ ...prev, sports: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="register-area" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Local area</label>
          <input id="register-area" required placeholder="Your locality" aria-label="Local area" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.area} onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="register-bio" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Bio</label>
          <input id="register-bio" placeholder="Short player intro" aria-label="Bio" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.bio} onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="register-lat" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Latitude</label>
          <input id="register-lat" type="number" step="any" required placeholder="Latitude" aria-label="Latitude" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.latitude} onChange={(event) => setForm((prev) => ({ ...prev, latitude: Number(event.target.value) }))} />
        </div>
        <div>
          <label htmlFor="register-lng" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Longitude</label>
          <input id="register-lng" type="number" step="any" required placeholder="Longitude" aria-label="Longitude" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={form.longitude} onChange={(event) => setForm((prev) => ({ ...prev, longitude: Number(event.target.value) }))} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={detectLocation} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">
          Auto-detect location
        </button>
        <label className="flex items-center gap-2 text-xs text-slate-700">
          <input type="checkbox" aria-label="Open to join games" checked={form.lookingForGame} onChange={(event) => setForm((prev) => ({ ...prev, lookingForGame: event.target.checked }))} />
          Open to join games
        </label>
        <button disabled={loading} className="ml-auto rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {loading ? "Creating..." : "Create account"}
        </button>
      </div>

      {message ? <p className="mt-3 text-sm text-rose-600">{message}</p> : null}
    </form>
  );
}
