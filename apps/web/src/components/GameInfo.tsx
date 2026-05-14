"use client";

import { GameDTO } from "@sportlink/types";

interface GameInfoProps {
  game: GameDTO;
  onJoinClick: () => void;
  isJoining: boolean;
  isFull: boolean;
}

const genderLabels: Record<string, string> = {
  open: "Open",
  men: "Men",
  women: "Women",
  mixed: "Mixed",
};

const skillLevelLabels: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  competitive: "Competitive",
};

const sportEmojis: Record<string, string> = {
  soccer: "⚽",
  basketball: "🏀",
  volleyball: "🏐",
  spikeball: "🎾",
};

const sportColors: Record<string, string> = {
  soccer: "bg-green-600",
  basketball: "bg-orange-600",
  volleyball: "bg-blue-600",
  spikeball: "bg-yellow-600",
};

const recurringLabels: Record<string, string> = {
  one_off: "One-off",
  weekly: "Every Sunday",
  fortnightly: "Every fortnight",
};

export default function GameInfo({ game, onJoinClick, isJoining, isFull }: GameInfoProps) {
  const date = new Date(game.dateTime);
  const dayOfWeek = date.toLocaleDateString("en-AU", { weekday: "short" });
  const dayOfMonth = date.getDate();
  const month = date.toLocaleDateString("en-AU", { month: "short" });
  const time = date.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });
  const costDisplay =
    game.costPerPlayer === 0 ? "Free" : `$${(game.costPerPlayer / 100).toFixed(2)}`;
  const sportLabel = game.sport.charAt(0).toUpperCase() + game.sport.slice(1);
  const skillLabel = skillLevelLabels[game.skillLevel] ?? game.skillLevel;

  return (
    <div className="rounded-2xl border border-[var(--sportlink-border)] bg-[var(--sportlink-panel)] p-6">
      {/* Sport badge, title, skill level */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2.5">
          <Tag variant="sport">{sportLabel}</Tag>
          <Tag variant="skill" className="ml-auto">
            {skillLabel}
          </Tag>
        </div>
        <h1 className="text-2xl font-bold text-[#f3f2ee]">{game.title}</h1>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Date */}
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 shrink-0 text-[var(--sportlink-text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span className="text-sm text-[#e8e6de]">
            {dayOfWeek} {dayOfMonth} {month}, {time}
          </span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 shrink-0 text-[var(--sportlink-text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span className="text-sm text-[#e8e6de]">~90 min</span>
        </div>

        {/* Players / Gender */}
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 shrink-0 text-[var(--sportlink-text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span className="text-sm text-[#e8e6de]">Open — {genderLabels[game.gender]}</span>
        </div>

        {/* Cost */}
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 shrink-0 text-[var(--sportlink-text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <span className="text-sm text-[#e8e6de]">{costDisplay}</span>
        </div>

        {/* Recurring */}
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 shrink-0 text-[var(--sportlink-text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <polyline points="17 1 21 5 17 9"/>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
            <polyline points="7 23 3 19 7 15"/>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
          <span className="text-sm text-[#e8e6de]">{recurringLabels[game.recurring]}</span>
        </div>
      </div>

      {/* Spots progress */}
      <div className="mt-6 space-y-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#35352f]">
          <div
            className="h-full bg-[var(--sportlink-green)]"
            style={{ width: `${(game.currentPlayers / game.maxPlayers) * 100}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-[var(--sportlink-text-soft)]">
            <span className="font-semibold text-[var(--sportlink-green)]">
              {game.currentPlayers} of {game.maxPlayers}
            </span>{" "}
            spots filled
          </span>
          <div className="flex items-center gap-2 text-xs text-[var(--sportlink-green)]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>Verified players only</span>
          </div>
        </div>
      </div>

      <button
        onClick={onJoinClick}
        disabled={isJoining || isFull}
        className="mt-6 w-full rounded-xl border border-[var(--sportlink-border)] bg-transparent px-6 py-3 text-base font-medium text-[#f3f2ee] transition hover:border-[#1ea57b] hover:text-[#1ea57b] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isJoining ? "Joining..." : "Join this game"}
      </button>
    </div>
  );
}

function Tag({
  children,
  variant,
  className = "",
}: {
  children: React.ReactNode;
  variant: "sport" | "skill";
  className?: string;
}) {
  const variantClassName =
    variant === "sport"
      ? "border-[#00c894] bg-[rgba(0,200,148,0.14)] text-[#00d39b]"
      : "border-[var(--sportlink-border)] bg-[#2a2a27] text-[#e8e6de]";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium ${variantClassName} ${className}`}
    >
      {children}
    </span>
  );
}
