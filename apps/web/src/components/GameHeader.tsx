"use client";

import { GameDTO } from "@sportlink/types";

interface GameHeaderProps {
  game: GameDTO;
}

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

const skillLevelLabels: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  competitive: "Competitive",
};

export default function GameHeader({ game }: GameHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                sportColors[game.sport] || "bg-gray-600"
              } text-white text-sm font-semibold`}
            >
              {sportEmojis[game.sport] || "🏆"}
            </span>
            <span className="text-sm font-medium text-[var(--sportlink-text-soft)] capitalize">
              {game.sport}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#f3f2ee]">{game.title}</h1>
        </div>
        <div className="text-right">
          <div className="rounded-lg bg-[#2a2a27] px-4 py-2 text-sm font-medium text-[#e8e6de]">
            {skillLevelLabels[game.skillLevel]}
          </div>
        </div>
      </div>
    </div>
  );
}
