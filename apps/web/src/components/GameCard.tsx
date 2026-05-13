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
      className="block border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
    >
      <div className="flex justify-between items-start mb-3">
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${SPORT_COLORS[game.sport] ?? "bg-gray-100 text-gray-700"}`}
        >
          {game.sport.charAt(0).toUpperCase() + game.sport.slice(1)}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
          {SKILL_LABELS[game.skillLevel]}
        </span>
      </div>

      <h3 className="font-medium text-[15px] mb-2 leading-snug">{game.title}</h3>

      <div className="space-y-1.5 mb-3">
        <p className="text-xs text-gray-500">{dateLabel}</p>
        <p className="text-xs text-gray-500">
          {game.location.suburb}
          {game.distanceKm !== undefined && (
            <span className="ml-1">· {game.distanceKm.toFixed(1)} km away</span>
          )}
        </p>
        <p className="text-xs text-gray-500">
          {game.gender.charAt(0).toUpperCase() + game.gender.slice(1)} ·{" "}
          {game.costPerPlayer === 0
            ? "Free"
            : `$${(game.costPerPlayer / 100).toFixed(0)} per player`}
        </p>
      </div>

      {/* Spots progress bar */}
      <div className="h-1 bg-gray-100 rounded-full mb-2">
        <div
          className="h-1 rounded-full transition-all"
          style={{
            width: `${fillPct}%`,
            backgroundColor: isFull ? "#E24B4A" : "#1D9E75",
          }}
        />
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          <span className="font-medium" style={{ color: isFull ? "#E24B4A" : "#1D9E75" }}>
            {isFull ? "Full" : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`}
          </span>
          {" "}of {game.maxPlayers}
        </span>
        <span className="text-xs text-emerald-700 flex items-center gap-1">
          ✓ Verified only
        </span>
      </div>
    </Link>
  );
}
