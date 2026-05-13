"use client";

import { useState, useEffect } from "react";
import GameCard from "./GameCard";
import { gamesApi } from "@/lib/api";
import type { GameSummaryDTO } from "@sportlink/types";

// Default to Sydney CBD for demo — in production use browser geolocation
const DEFAULT_LOCATION = { lat: -33.8688, lng: 151.2093 };

export default function GamesList() {
  const [games, setGames] = useState<GameSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await gamesApi.list({
          lat: DEFAULT_LOCATION.lat,
          lng: DEFAULT_LOCATION.lng,
          radiusKm: 20,
        });
        setGames(res.data);
      } catch (e) {
        setError("Could not load games. Is the API running?");
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

  if (error) {
    return <p className="mt-4 text-sm text-[#ff8f87]">{error}</p>;
  }

  if (games.length === 0) {
    return (
      <p className="mt-8 text-center text-sm text-[var(--sportlink-text-soft)]">
        No games found in this area. Be the first to create one!
      </p>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
