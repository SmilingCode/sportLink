"use client";

import { useMemo, useState } from "react";
import { UserPublicDTO } from "@sportlink/types";

interface PlayersListProps {
  players: UserPublicDTO[];
  total: number;
}

export default function PlayersList({ players, total }: PlayersListProps) {
  const [showAll, setShowAll] = useState(false);

  const { visiblePlayers, hiddenCount } = useMemo(() => {
    const firstBatch = players.slice(0, 4);
    const remaining = Math.max(total - firstBatch.length, 0);

    return {
      visiblePlayers: showAll ? players : firstBatch,
      hiddenCount: remaining,
    };
  }, [players, showAll, total]);

  return (
    <div className="rounded-2xl border border-[var(--sportlink-border)] bg-[var(--sportlink-panel)] p-6">
      <p className="mb-4 text-xs font-semibold uppercase text-[var(--sportlink-text-muted)]">
        Players going ({total})
      </p>

      <div className="space-y-3">
        {visiblePlayers.map((player) => (
          <div key={player.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={player.avatarUrl || `https://i.pravatar.cc/32?u=${player.id}`}
                alt={player.name}
                className="h-8 w-8 rounded-full"
              />
              <span className="text-sm text-[#e8e6de]">{player.name}</span>
            </div>
            {player.verificationStatus === "fully_verified" && (
              <span className="text-xs text-[var(--sportlink-green)]">
                ☑ Verified
              </span>
            )}
          </div>
        ))}

        {hiddenCount > 0 && !showAll && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="pt-2 text-left text-xs text-[var(--sportlink-green)] transition hover:opacity-80"
            aria-expanded={showAll}
          >
            + {hiddenCount} more player{hiddenCount === 1 ? "" : "s"}
          </button>
        )}

        {showAll && hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className="pt-2 text-left text-xs text-[var(--sportlink-green)] transition hover:opacity-80"
            aria-expanded={showAll}
          >
            Hide players
          </button>
        )}
      </div>
    </div>
  );
}
