"use client";

import type { CreateGameBody } from "@sportlink/types";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, ShieldCheck } from "lucide-react";
import { gamesApi } from "@/lib/api";
import { getStoredSession } from "@/lib/auth";
import MapPicker from "@/components/MapPicker";

const DRAFT_KEY = "sportlink.create-game.draft";

type CreateFormState = {
  title: string;
  sport: CreateGameBody["sport"];
  skillLevel: CreateGameBody["skillLevel"];
  gender: CreateGameBody["gender"];
  date: string;
  time: string;
  recurring: CreateGameBody["recurring"];
  minPlayers: string;
  maxPlayers: string;
  costPerPlayer: string;
  equipmentNotes: string;
  description: string;
  verifiedPlayersOnly: boolean;
  addressInput: string;
  lat: string;
  lng: string;
};

const DEFAULT_FORM: CreateFormState = {
  title: "",
  sport: "soccer",
  skillLevel: "intermediate",
  gender: "open",
  date: "",
  time: "",
  recurring: "one_off",
  minPlayers: "6",
  maxPlayers: "18",
  costPerPlayer: "0",
  equipmentNotes: "",
  description: "",
  verifiedPlayersOnly: true,
  addressInput: "",
  lat: "-33.8688",
  lng: "151.2093",
};

const sportOptions: [CreateGameBody["sport"], string][] = [
  ["soccer", "Soccer"],
  ["basketball", "Basketball"],
  ["volleyball", "Volleyball"],
  ["spikeball", "Spikeball"],
];

const skillOptions: [CreateGameBody["skillLevel"], string][] = [
  ["beginner", "Beginner"],
  ["intermediate", "Intermediate"],
  ["competitive", "Competitive"],
];

const genderOptions: [CreateGameBody["gender"], string][] = [
  ["open", "Open"],
  ["men", "Men"],
  ["women", "Women"],
  ["mixed", "Mixed"],
];

export default function CreateGamePage() {
  const router = useRouter();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [authChecked, setAuthChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<CreateFormState>(DEFAULT_FORM);

  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      router.replace("/auth/login?next=%2Fgames%2Fcreate");
      return;
    }

    const rawDraft = window.localStorage.getItem(DRAFT_KEY);
    if (rawDraft) {
      try {
        const draft = JSON.parse(rawDraft) as Partial<CreateFormState>;
        setForm((prev) => ({ ...prev, ...draft }));
      } catch {
        window.localStorage.removeItem(DRAFT_KEY);
      }
    }

    setAuthChecked(true);
  }, [router]);

  const canSubmit = useMemo(() => {
    return Boolean(form.title.trim() && form.date && form.time && form.addressInput.trim());
  }, [form.addressInput, form.date, form.time, form.title]);

  const updateField = (name: keyof CreateFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleVerifiedPlayersOnly = () => {
    setForm((prev) => ({
      ...prev,
      verifiedPlayersOnly: !prev.verifiedPlayersOnly,
    }));
  };

  const handleMapPick = ({ lat, lng, address }: { lat: number; lng: number; address: string }) => {
    setForm((prev) => ({
      ...prev,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
      addressInput: address,
    }));
  };

  const saveDraft = () => {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    setError(null);
    setSuccess("Draft saved on this device.");
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!getStoredSession()) {
      router.replace("/auth/login?next=%2Fgames%2Fcreate");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const combinedDateTime = new Date(`${form.date}T${form.time}`);
    if (Number.isNaN(combinedDateTime.getTime())) {
      setError("Please enter a valid date and time.");
      setIsSubmitting(false);
      return;
    }

    const suburbFromAddress = getSuburbFromAddress(form.addressInput);

    const payload: CreateGameBody = {
      title: form.title.trim(),
      sport: form.sport,
      skillLevel: form.skillLevel,
      gender: form.gender,
      dateTime: combinedDateTime.toISOString(),
      recurring: form.recurring,
      location: {
        lat: Number(form.lat),
        lng: Number(form.lng),
        address: form.addressInput.trim(),
        suburb: suburbFromAddress,
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

    if (!payload.location.address) {
      setError("Address is required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const created = await gamesApi.create(payload);
      window.localStorage.removeItem(DRAFT_KEY);
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
    <main className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
      <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#f1efe8]">Create a game</h1>
      <p className="mt-1 text-base text-[var(--sportlink-text-soft)]">
        Verified players nearby will be able to find and join your game.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <SectionCard title="Sport">
          <PillGroup
            value={form.sport}
            onChange={(value) => updateField("sport", value)}
            options={sportOptions}
          />
        </SectionCard>

        <SectionCard title="Game details">
          <div className="space-y-3">
            <Field label="Title">
              <input
                type="text"
                required
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className="w-full rounded-xl border border-[var(--sportlink-border)] bg-[#30302d] px-4 py-2.5 text-1xl font-medium tracking-[-0.02em] text-[#f3f2ee] outline-none transition focus:border-[#6f6e67]"
                placeholder="e.g. Sunday morning kickabout"
              />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Date">
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(event) => updateField("date", event.target.value)}
                  className="w-full rounded-xl border border-[var(--sportlink-border)] bg-[#30302d] px-4 py-2.5 text-base text-[#f3f2ee] outline-none transition [color-scheme:dark] focus:border-[#6f6e67] focus:bg-[#30302d] focus:text-[#f3f2ee]"
                />
              </Field>

              <Field label="Time">
                <input
                  type="time"
                  required
                  value={form.time}
                  onChange={(event) => updateField("time", event.target.value)}
                  className="w-full rounded-xl border border-[var(--sportlink-border)] bg-[#30302d] px-4 py-2.5 text-base text-[#f3f2ee] outline-none transition [color-scheme:dark] focus:border-[#6f6e67] focus:bg-[#30302d] focus:text-[#f3f2ee]"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Min players">
                <input
                  type="number"
                  min={2}
                  required
                  value={form.minPlayers}
                  onChange={(event) => updateField("minPlayers", event.target.value)}
                  className="w-full rounded-xl border border-[var(--sportlink-border)] bg-[#30302d] px-4 py-2.5 text-base text-[#f3f2ee] outline-none transition focus:border-[#6f6e67]"
                />
              </Field>

              <Field label="Max players">
                <input
                  type="number"
                  min={2}
                  required
                  value={form.maxPlayers}
                  onChange={(event) => updateField("maxPlayers", event.target.value)}
                  className="w-full rounded-xl border border-[var(--sportlink-border)] bg-[#30302d] px-4 py-2.5 text-base text-[#f3f2ee] outline-none transition focus:border-[#6f6e67]"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Cost per player">
                <div className="flex rounded-xl border border-[var(--sportlink-border)] bg-[#30302d]">
                  <span className="flex items-center border-r border-[var(--sportlink-border)] px-3 text-lg text-[var(--sportlink-text-soft)]">
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    required
                    value={form.costPerPlayer}
                    onChange={(event) => updateField("costPerPlayer", event.target.value)}
                    className="w-full bg-transparent px-4 py-2.5 text-base text-[#f3f2ee] outline-none"
                  />
                </div>
              </Field>

              <Field label="Recurring">
                <select
                  value={form.recurring}
                  onChange={(event) => updateField("recurring", event.target.value)}
                  className="w-full rounded-xl border border-[var(--sportlink-border)] bg-[#1f201d] px-4 py-2.5 text-base text-[#f3f2ee] outline-none transition focus:border-[#6f6e67]"
                >
                  <option value="one_off">One-off</option>
                  <option value="weekly">Weekly</option>
                  <option value="fortnightly">Fortnightly</option>
                </select>
              </Field>
            </div>

            <Field label="Equipment notes">
              <input
                type="text"
                value={form.equipmentNotes}
                onChange={(event) => updateField("equipmentNotes", event.target.value)}
                className="w-full rounded-xl border border-[var(--sportlink-border)] bg-[#30302d] px-4 py-2.5 text-base text-[#f3f2ee] outline-none transition focus:border-[#6f6e67]"
                placeholder="e.g. Ball provided, bring boots"
              />
            </Field>

            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                className="min-h-28 w-full rounded-xl border border-[var(--sportlink-border)] bg-[#30302d] px-4 py-3 text-base text-[#f3f2ee] outline-none transition focus:border-[#6f6e67]"
                placeholder="Any extra info for players..."
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Skill level">
          <PillGroup
            value={form.skillLevel}
            onChange={(value) => updateField("skillLevel", value)}
            options={skillOptions}
          />
        </SectionCard>

        <SectionCard title="Who can join">
          <PillGroup
            value={form.gender}
            onChange={(value) => updateField("gender", value)}
            options={genderOptions}
          />
        </SectionCard>

        <div className="rounded-2xl border border-[rgba(0,200,148,0.6)] bg-[#2a2a27] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(0,200,148,0.14)] text-[var(--sportlink-green)]">
                <Shield className="h-5 w-5" strokeWidth={1.8} />
              </div>

              <div className="min-w-0">
                <h3 className="font-semibold text-[#f3f2ee]">Verified players only</h3>
                <p className="text-sm leading-5 text-[var(--sportlink-text-soft)]">
                  Only players who have completed identity verification can join this game.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleVerifiedPlayersOnly}
              aria-pressed={form.verifiedPlayersOnly}
              className={`relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border px-1 transition ${
                form.verifiedPlayersOnly
                  ? "border-[rgba(0,200,148,0.65)] bg-[rgba(0,200,148,0.2)]"
                  : "border-[var(--sportlink-border)] bg-[#35352f]"
              }`}
            >
              <span
                className={`inline-block h-7 w-7 rounded-full bg-[#f7f7f5] shadow-sm transition-transform ${
                  form.verifiedPlayersOnly ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[rgba(0,200,148,0.55)] bg-[rgba(0,200,148,0.08)] px-4 py-3 text-sm leading-5 text-[var(--sportlink-green)]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} />
            <span>
              Players must complete ID + selfie verification via Stripe Identity before joining.
              This keeps your game safe.
            </span>
          </div>
        </div>

        <SectionCard title="Location">
          <MapPicker
            token={mapboxToken}
            onPick={handleMapPick}
            initialAddress={form.addressInput || undefined}
          />
        </SectionCard>

        {error && <p className="px-1 text-sm text-[#ff8f87]">{error}</p>}
        {success && <p className="px-1 text-sm text-[var(--sportlink-green)]">{success}</p>}

        <div className="flex flex-wrap justify-end gap-3 pb-1 pt-1">
          <button
            type="button"
            onClick={saveDraft}
            className="rounded-xl border border-[var(--sportlink-border)] bg-transparent px-6 py-2.5 text-base text-[#f3f2ee] transition hover:border-[#6f6e67] hover:bg-[#31312d]"
          >
            Save draft
          </button>
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="rounded-xl border border-[var(--sportlink-border)] bg-transparent px-6 py-2.5 text-base font-medium text-[#f3f2ee] transition hover:border-[#1ea57b] hover:text-[#1ea57b] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Publishing..." : "Publish game"}
          </button>
        </div>
      </form>
    </main>
  );
}

function getSuburbFromAddress(address: string) {
  const cleaned = address.trim();
  if (!cleaned) {
    return "";
  }

  const parts = cleaned
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length > 1 ? parts[parts.length - 1] : cleaned;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[var(--sportlink-border)] bg-[var(--sportlink-panel)] p-5 shadow-[0_16px_42px_rgba(0,0,0,0.2)] sm:p-6">
      <h2 className="mb-3 text-2xl font-semibold tracking-[-0.02em] text-[#f1efe8]">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-base text-[var(--sportlink-text-soft)]">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

interface PillGroupProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: [T, string][];
}

function PillGroup<T extends string>({ value, onChange, options }: PillGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map(([optionValue, optionLabel]) => {
        const isActive = value === optionValue;

        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            className={`rounded-full border px-4 py-1.5 text-base transition ${
              isActive
                ? "border-[#00c894] bg-[rgba(0,200,148,0.14)] text-[#00d39b]"
                : "border-[var(--sportlink-border)] text-[#b5b2aa] hover:border-[#6f6e67] hover:text-[#ece9df]"
            }`}
          >
            {optionLabel}
          </button>
        );
      })}
    </div>
  );
}
