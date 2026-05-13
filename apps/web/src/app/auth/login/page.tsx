"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/lib/api";
import { setStoredSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await authApi.login(email.trim(), password);
      setStoredSession({ token: res.accessToken, user: res.user });
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not log in";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-6 sm:px-8">
      <section className="mx-auto max-w-md rounded-2xl border border-[var(--sportlink-border)] bg-[var(--sportlink-panel)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#f1efe8]">Log in</h1>
        <p className="mt-1 text-sm text-[var(--sportlink-text-soft)]">Access your Sportlink account.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm text-[#dddacf]">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--sportlink-border)] bg-[#232321] px-4 py-3 text-[#f1efe8] outline-none transition focus:border-[#6f6e67]"
            />
          </label>

          <label className="block text-sm text-[#dddacf]">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--sportlink-border)] bg-[#232321] px-4 py-3 text-[#f1efe8] outline-none transition focus:border-[#6f6e67]"
            />
          </label>

          {error && <p className="text-sm text-[#ff8f87]">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[var(--sportlink-green)] px-4 py-3 text-sm font-semibold text-[#f0f7f3] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-4 text-sm text-[var(--sportlink-text-soft)]">
          No account yet?{" "}
          <Link
            href={`/auth/signup?next=${encodeURIComponent(nextPath)}`}
            className="font-semibold text-[var(--sportlink-green)] hover:underline"
          >
            Sign up
          </Link>
        </p>
      </section>
    </main>
  );
}
