"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { authApi } from "@/lib/api";

type VerifyState = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("Verifying your email...");

  const token = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const params = new URLSearchParams(window.location.search);
    return params.get("token") ?? "";
  }, []);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setState("error");
        setMessage("Verification link is missing a token.");
        return;
      }

      try {
        await authApi.verifyEmail(token);
        setState("success");
        setMessage("Email verified. Your account is now updated.");
      } catch (error) {
        setState("error");
        const text =
          error instanceof Error ? error.message : "Could not verify email. Please try again.";
        setMessage(text);
      }
    }

    void verify();
  }, [token]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
      <section className="mx-auto max-w-lg rounded-2xl border border-[var(--sportlink-border)] bg-[var(--sportlink-panel)] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#f1efe8]">Email verification</h1>

        <p
          className={`mt-4 text-sm ${
            state === "success"
              ? "text-[var(--sportlink-green)]"
              : state === "error"
                ? "text-[#ff8f87]"
                : "text-[var(--sportlink-text-soft)]"
          }`}
        >
          {message}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/auth/login"
            className="rounded-xl bg-[var(--sportlink-green)] px-4 py-2 text-sm font-semibold text-[#f0f7f3] transition hover:brightness-110"
          >
            Go to login
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-[var(--sportlink-border)] px-4 py-2 text-sm font-semibold text-[#dddacf] transition hover:border-[#6f6e67]"
          >
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
