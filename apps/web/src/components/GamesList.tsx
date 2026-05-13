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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-52 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500 mt-4">{error}</p>;
  }

  if (games.length === 0) {
    return (
      <p className="text-sm text-gray-400 mt-8 text-center">
        No games found in this area. Be the first to create one!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
