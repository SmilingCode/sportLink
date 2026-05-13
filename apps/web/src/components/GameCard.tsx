import Link from "next/link";
import type { GameSummaryDTO } from "@sportlink/types";

const SPORT_COLORS: Record<string, string> = {
  soccer: "bg-emerald-50 text-emerald-800",
  basketball: "bg-amber-50 text-amber-800",
  volleyball: "bg-purple-50 text-purple-800",
  spikeball: "bg-pink-50 text-pink-800",
};

const SKILL_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  competitive: "Competitive",
};

function MetaRow({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2 text-[15px] text-[var(--sportlink-text-soft)]">{children}</div>;
}

function MetaIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-4 w-4 items-center justify-center text-[var(--sportlink-text-muted)]">
      {children}
    </span>
  );
}

export default function GameCard({ game }: { game: GameSummaryDTO }) {
  const spotsLeft = game.maxPlayers - game.currentPlayers;
  const fillPct = Math.round((game.currentPlayers / game.maxPlayers) * 100);
  const isFull = spotsLeft === 0;

  const dateLabel = new Date(game.dateTime).toLocaleString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Link
      href={`/games/${game.id}`}
      className="block rounded-2xl border border-[var(--sportlink-border)] bg-[var(--sportlink-panel)] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.16)] transition hover:border-[#66665f] hover:bg-[var(--sportlink-panel-strong)]"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${SPORT_COLORS[game.sport] ?? "bg-[#42423d] text-[#ece8de]"}`}
        >
          {game.sport.charAt(0).toUpperCase() + game.sport.slice(1)}
        </span>
        <span className="rounded-full bg-[#232321] px-3 py-1 text-xs font-semibold text-[#d4d2ca]">
          {SKILL_LABELS[game.skillLevel]}
        </span>
      </div>

      <h3 className="mb-3 text-[1.75rem] font-semibold leading-[1.05] tracking-[-0.04em] text-[#f1efe8]">
        {game.title}
      </h3>

      <div className="mb-4 space-y-2.5">
        <MetaRow>
          <MetaIcon>
            <CalendarIcon />
          </MetaIcon>
          <span>{dateLabel}</span>
        </MetaRow>

        <MetaRow>
          <MetaIcon>
            <UserIcon />
          </MetaIcon>
          <span>
            {game.gender.charAt(0).toUpperCase() + game.gender.slice(1)}
            {game.gender !== "open" ? " only" : ""}
          </span>
        </MetaRow>

        <MetaRow>
          <MetaIcon>
            <LocationIcon />
          </MetaIcon>
          <span>
          {game.location.suburb}
          {game.distanceKm !== undefined && (
            <span> · {game.distanceKm.toFixed(1)} km away</span>
          )}
          </span>
        </MetaRow>

        <MetaRow>
          <MetaIcon>
            <CheckIcon />
          </MetaIcon>
          <span>
          {game.costPerPlayer === 0
            ? "Free"
            : `$${(game.costPerPlayer / 100).toFixed(0)} per player`}
            {game.costPerPlayer === 0 ? " · Ball provided" : " · Bibs provided"}
          </span>
        </MetaRow>
      </div>

      <div className="mb-4 h-1.5 rounded-full bg-[#1f201d]">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{
            width: `${fillPct}%`,
            backgroundColor: isFull ? "#E24B4A" : "#1D9E75",
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-[var(--sportlink-text-soft)]">
          Spots:{" "}
          <span className="font-semibold" style={{ color: isFull ? "#E24B4A" : "#1D9E75" }}>
            {game.currentPlayers} of {game.maxPlayers}
          </span>{" "}
          filled
        </span>
        <span className="flex items-center gap-1 text-[var(--sportlink-green)]">
          <StarIcon />
          Verified players only
        </span>
      </div>
    </Link>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
      <rect x="2.25" y="3.25" width="11.5" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 1.75V4.5M11 1.75V4.5M2.5 6.25H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
      <circle cx="8" cy="5.25" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.25 13.25C3.25 10.9028 5.15279 9 7.5 9H8.5C10.8472 9 12.75 10.9028 12.75 13.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M8 14C10.5 11.25 12.25 8.98744 12.25 6.5C12.25 4.01472 10.4853 2.25 8 2.25C5.51472 2.25 3.75 4.01472 3.75 6.5C3.75 8.98744 5.5 11.25 8 14Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M3 8.25L6.25 11.5L13 4.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
      <path d="M8 2.25L9.69208 5.67946L13.5 6.23278L10.75 8.91353L11.3992 12.7067L8 10.9195L4.60081 12.7067L5.25 8.91353L2.5 6.23278L6.30792 5.67946L8 2.25Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  );
}
