"use client";

import { GameDTO } from "@sportlink/types";

interface LocationCardProps {
  game: GameDTO;
}

export default function LocationCard({ game }: LocationCardProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Static map image from Mapbox
  const mapImageUrl = mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+00c894(${game.location.lng},${game.location.lat})/${game.location.lng},${game.location.lat},15/400x300@2x?access_token=${mapboxToken}`
    : null;

  return (
    <div className="sticky top-8 space-y-3">
      <div className="overflow-hidden rounded-2xl border border-[var(--sportlink-border)] bg-[var(--sportlink-panel)]">
        <div className="overflow-hidden">
          {mapImageUrl ? (
            <img
              src={mapImageUrl}
              alt="Game location"
              className="h-48 w-full object-cover"
            />
          ) : (
            <div className="flex h-48 w-full items-center justify-center bg-[#2a2a27] text-sm text-[var(--sportlink-text-muted)]">
              Map unavailable
            </div>
          )}
        </div>

        <div className="border-t border-[var(--sportlink-border)] p-4">
          <div className="space-y-2">
            <h3 className="font-medium text-[#f3f2ee]">
              {game.location.suburb}
            </h3>
            <p className="text-sm text-[var(--sportlink-text-soft)]">
              {game.location.address}
            </p>

            {game.distanceKm !== undefined && (
              <div className="pt-2 text-sm text-[var(--sportlink-text-muted)]">
                {game.distanceKm.toFixed(1)} km from your location
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
