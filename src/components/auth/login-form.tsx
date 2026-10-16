"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error ?? "Login failed.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submitForm} className="rounded-3xl border border-white/50 bg-white/90 p-6 shadow-2xl backdrop-blur md:p-8">
      <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-600">Login to create events, add spots, and join local matches.</p>

      <div className="mt-5 space-y-3">
        <div>
          <label htmlFor="login-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Email</label>
          <input
            id="login-email"
            required
            type="email"
            placeholder="name@example.com"
            aria-label="Email"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="login-password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Password</label>
          <input
            id="login-password"
            required
            type="password"
            placeholder="Your password"
            aria-label="Password"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
      </div>

      <button
        disabled={loading}
        className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {message ? <p className="mt-3 text-sm text-rose-600">{message}</p> : null}
    </form>
  );
}
