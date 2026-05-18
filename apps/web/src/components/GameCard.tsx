import Link from "next/link";
import type { GameSummaryDTO } from "@sportlink/types";
import { CalendarDays, CheckCircle2, MapPin, Star, User } from "lucide-react";

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
  return (
    <div className="flex items-center gap-2 text-[15px] text-[var(--sportlink-text-soft)]">
      {children}
    </div>
  );
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
            <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
          </MetaIcon>
          <span>{dateLabel}</span>
        </MetaRow>

        <MetaRow>
          <MetaIcon>
            <User className="h-4 w-4" strokeWidth={1.75} />
          </MetaIcon>
          <span>
            {game.gender.charAt(0).toUpperCase() + game.gender.slice(1)}
            {game.gender !== "open" ? " only" : ""}
          </span>
        </MetaRow>

        <MetaRow>
          <MetaIcon>
            <MapPin className="h-4 w-4" strokeWidth={1.75} />
          </MetaIcon>
          <span>
            {game.location.suburb}
            {game.distanceKm !== undefined && <span> · {game.distanceKm.toFixed(1)} km away</span>}
          </span>
        </MetaRow>

        <MetaRow>
          <MetaIcon>
            <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
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
          <Star className="h-3.5 w-3.5" strokeWidth={1.75} />
          Verified players only
        </span>
      </div>
    </Link>
  );
}
