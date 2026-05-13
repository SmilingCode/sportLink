"use client";

import type { CreateGameBody } from "@sportlink/types";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { gamesApi } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";

const DEFAULT_FORM = {
  title: "",
  sport: "soccer" as CreateGameBody["sport"],
  skillLevel: "beginner" as CreateGameBody["skillLevel"],
  gender: "open" as CreateGameBody["gender"],
  dateTime: "",
  recurring: "one_off" as CreateGameBody["recurring"],
  address: "",
  suburb: "",
  lat: "-33.8688",
  lng: "151.2093",
  minPlayers: "6",
  maxPlayers: "10",
  costPerPlayer: "0",
  equipmentNotes: "",
  description: "",
};

export default function CreateGamePage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    const currentToken = getStoredToken();

    if (!currentToken) {
      router.replace("/auth/login?next=%2Fgames%2Fcreate");
      return;
    }

    setToken(currentToken);
    setAuthChecked(true);
  }, [router]);

  const canSubmit = useMemo(() => {
    if (!form.title.trim()) {
      return false;
    }

    if (!form.dateTime) {
      return false;
    }

    return true;
  }, [form.dateTime, form.title]);

  const updateField = (name: keyof typeof DEFAULT_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      router.replace("/auth/login?next=%2Fgames%2Fcreate");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const payload: CreateGameBody = {
      title: form.title.trim(),
      sport: form.sport,
      skillLevel: form.skillLevel,
      gender: form.gender,
      dateTime: new Date(form.dateTime).toISOString(),
      recurring: form.recurring,
      location: {
        lat: Number(form.lat),
        lng: Number(form.lng),
        address: form.address.trim(),
        suburb: form.suburb.trim(),
      },
      minPlayers: Number(form.minPlayers),
      maxPlayers: Number(form.maxPlayers),
      costPerPlayer: Number(form.costPerPlayer),
      equipmentNotes: form.equipmentNotes.trim() || undefined,
      description: form.description.trim() || undefined,
    };

    if (payload.minPlayers > payload.maxPlayers) {
      setError("Minimum players cannot be higher than maximum players.");
      setIsSubmitting(false);
      return;
    }

    if (!payload.location.address || !payload.location.suburb) {
      setError("Address and suburb are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const created = await gamesApi.create(payload, token);
      setSuccess("Game created successfully.");
      router.push(`/games/${created.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create game";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authChecked) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-6 sm:px-8">
        <p className="text-sm text-[var(--sportlink-text-soft)]">Checking your session...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-6 sm:px-8">
      <section className="mx-auto max-w-2xl rounded-2xl border border-[var(--sportlink-border)] bg-[var(--sportlink-panel)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#f1efe8]">Create game</h1>
        <p className="mt-1 text-sm text-[var(--sportlink-text-soft)]">
          Only fully verified users can publish games.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm text-[#dddacf]">
            Title
            <input
              type="text"
              required
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--sportlink-border)] bg-[#232321] px-4 py-3 text-[#f1efe8] outline-none transition focus:border-[#6f6e67]"
              placeholder="Saturday futsal social"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField
              label="Sport"
              value={form.sport}
              onChange={(value) => updateField("sport", value)}
              options={[
                ["soccer", "Soccer"],
                ["basketball", "Basketball"],
                ["volleyball", "Volleyball"],
                ["spikeball", "Spikeball"],
              ]}
            />

            <SelectField
              label="Skill level"
              value={form.skillLevel}
              onChange={(value) => updateField("skillLevel", value)}
              options={[
                ["beginner", "Beginner"],
                ["intermediate", "Intermediate"],
                ["competitive", "Competitive"],
              ]}
            />

            <SelectField
              label="Gender"
              value={form.gender}
              onChange={(value) => updateField("gender", value)}
              options={[
                ["open", "Open"],
                ["men", "Men"],
                ["women", "Women"],
                ["mixed", "Mixed"],
              ]}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-[#dddacf]">
              Date & time
              <input
                type="datetime-local"
                required
                value={form.dateTime}
                onChange={(event) => updateField("dateTime", event.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--sportlink-border)] bg-[#232321] px-4 py-3 text-[#f1efe8] outline-none transition focus:border-[#6f6e67]"
              />
            </label>

            <SelectField
              label="Recurring"
              value={form.recurring}
              onChange={(value) => updateField("recurring", value)}
              options={[
                ["one_off", "One off"],
                ["weekly", "Weekly"],
                ["fortnightly", "Fortnightly"],
              ]}
            />
          </div>

          <label className="block text-sm text-[#dddacf]">
            Address
            <input
              type="text"
              required
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--sportlink-border)] bg-[#232321] px-4 py-3 text-[#f1efe8] outline-none transition focus:border-[#6f6e67]"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm text-[#dddacf] sm:col-span-1">
              Suburb
              <input
                type="text"
                required
                value={form.suburb}
                onChange={(event) => updateField("suburb", event.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--sportlink-border)] bg-[#232321] px-4 py-3 text-[#f1efe8] outline-none transition focus:border-[#6f6e67]"
              />
            </label>

            <label className="block text-sm text-[#dddacf]">
              Latitude
              <input
                type="number"
                required
                step="0.000001"
                value={form.lat}
                onChange={(event) => updateField("lat", event.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--sportlink-border)] bg-[#232321] px-4 py-3 text-[#f1efe8] outline-none transition focus:border-[#6f6e67]"
              />
            </label>

            <label className="block text-sm text-[#dddacf]">
              Longitude
              <input
                type="number"
                required
                step="0.000001"
                value={form.lng}
                onChange={(event) => updateField("lng", event.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--sportlink-border)] bg-[#232321] px-4 py-3 text-[#f1efe8] outline-none transition focus:border-[#6f6e67]"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm text-[#dddacf]">
              Min players
              <input
                type="number"
                min={2}
                required
                value={form.minPlayers}
                onChange={(event) => updateField("minPlayers", event.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--sportlink-border)] bg-[#232321] px-4 py-3 text-[#f1efe8] outline-none transition focus:border-[#6f6e67]"
              />
            </label>

            <label className="block text-sm text-[#dddacf]">
              Max players
              <input
                type="number"
                min={2}
                required
                value={form.maxPlayers}
                onChange={(event) => updateField("maxPlayers", event.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--sportlink-border)] bg-[#232321] px-4 py-3 text-[#f1efe8] outline-none transition focus:border-[#6f6e67]"
              />
            </label>

            <label className="block text-sm text-[#dddacf]">
              Cost per player (cents)
              <input
                type="number"
                min={0}
                required
                value={form.costPerPlayer}
                onChange={(event) => updateField("costPerPlayer", event.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--sportlink-border)] bg-[#232321] px-4 py-3 text-[#f1efe8] outline-none transition focus:border-[#6f6e67]"
              />
            </label>
          </div>

          <label className="block text-sm text-[#dddacf]">
            Equipment notes
            <input
              type="text"
              value={form.equipmentNotes}
              onChange={(event) => updateField("equipmentNotes", event.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--sportlink-border)] bg-[#232321] px-4 py-3 text-[#f1efe8] outline-none transition focus:border-[#6f6e67]"
              placeholder="Bring bibs and cones"
            />
          </label>

          <label className="block text-sm text-[#dddacf]">
            Description
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              className="mt-1 min-h-28 w-full rounded-xl border border-[var(--sportlink-border)] bg-[#232321] px-4 py-3 text-[#f1efe8] outline-none transition focus:border-[#6f6e67]"
              placeholder="Friendly run, rotating positions, all welcome."
            />
          </label>

          {error && <p className="text-sm text-[#ff8f87]">{error}</p>}
          {success && <p className="text-sm text-[var(--sportlink-green)]">{success}</p>}

          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="w-full rounded-xl bg-[var(--sportlink-green)] px-4 py-3 text-sm font-semibold text-[#f0f7f3] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating game..." : "Create game"}
          </button>
        </form>
      </section>
    </main>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <label className="block text-sm text-[#dddacf]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-[var(--sportlink-border)] bg-[#232321] px-4 py-3 text-[#f1efe8] outline-none transition focus:border-[#6f6e67]"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
