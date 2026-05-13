"use client";

import { useState, useEffect } from "react";
import GameCard from "./GameCard";
import { gamesApi } from "@/lib/api";
import { MOCK_GAMES } from "@/lib/mockGames";
import type { GameSummaryDTO } from "@sportlink/types";

// Default to Sydney CBD for demo — in production use browser geolocation
const DEFAULT_LOCATION = { lat: -33.8688, lng: 151.2093 };

export default function GamesList() {
  const [games, setGames] = useState<GameSummaryDTO[]>(MOCK_GAMES);
  const [loading, setLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await gamesApi.list({
          lat: DEFAULT_LOCATION.lat,
          lng: DEFAULT_LOCATION.lng,
          radiusKm: 20,
        });
        if (res.data.length > 0) {
          setGames(res.data);
          setUsingMockData(false);
        }
      } catch {
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[26rem] animate-pulse rounded-2xl border border-[var(--sportlink-border)] bg-[var(--sportlink-panel)]" />
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <p className="mt-8 text-center text-sm text-[var(--sportlink-text-soft)]">
        No games found in this area. Be the first to create one!
      </p>
    );
  }

  return (
    <>
      {usingMockData && (
        <div className="mt-2 rounded-xl border border-[var(--sportlink-border)] bg-[rgba(29,158,117,0.08)] px-4 py-3 text-sm text-[var(--sportlink-text-soft)]">
          Showing sample games while the API is offline.
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </>
  );
}
