"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Suggestion {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
}

interface PickedLocation {
  lat: number;
  lng: number;
  address: string;
}

interface MapPickerProps {
  token?: string;
  onPick: (location: PickedLocation) => void;
  /** Pre-existing confirmed location to show on mount, if any. */
  initialAddress?: string;
}

export default function MapPicker({ token, onPick, initialAddress }: MapPickerProps) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapboxglRef = useRef<any>(null);

  const [query, setQuery] = useState(initialAddress ?? "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [confirmed, setConfirmed] = useState<PickedLocation | null>(
    {lat: -33.8931, lng: 151.2016, address: "Sydney Park Rd, Alexandria NSW"}
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Boot the map (no marker until a location is confirmed).
  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      if (!token || !mapNodeRef.current || mapRef.current) return;

      const { default: mapboxgl } = await import("mapbox-gl");
      if (cancelled || !mapNodeRef.current) return;

      mapboxglRef.current = mapboxgl;
      mapboxgl.accessToken = token;

      const map = new mapboxgl.Map({
        container: mapNodeRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [151.2093, -33.8688], // default: Sydney
        zoom: 11,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
      map.on("load", () => { if (!cancelled) setMapReady(true); });

      mapRef.current = map;
    };

    boot();

    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      markerRef.current = null;
    };
  }, [token]);

  // Forward-geocode the typed query.
  const search = useCallback(
    async (text: string) => {
      if (!token || text.trim().length < 3) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);

      try {
        const url = new URL(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json`
        );
        url.searchParams.set("access_token", token);
        url.searchParams.set("autocomplete", "true");
        url.searchParams.set("types", "address,place,locality,neighborhood,poi");
        url.searchParams.set("country", "au");
        url.searchParams.set("limit", "5");

        const res = await fetch(url.toString());
        const data = (await res.json()) as { features?: Suggestion[] };
        if (data.features) setSuggestions(data.features);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    },
    [token]
  );

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  };

  // User picks a suggestion → confirm and pin.
  const handleSelect = (suggestion: Suggestion) => {
    setSuggestions([]);
    setQuery(suggestion.place_name);

    const [lng, lat] = suggestion.center;
    const location: PickedLocation = { lat, lng, address: suggestion.place_name };

    setConfirmed(location);
    onPick(location);

    if (!mapRef.current || !mapboxglRef.current) return;

    const mapboxgl = mapboxglRef.current;

    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    } else {
      markerRef.current = new mapboxgl.Marker({ color: "#00c894" })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);
    }

    mapRef.current.flyTo({ center: [lng, lat], zoom: 15, speed: 1.4 });
  };

  if (!token) {
    return (
      <div className="rounded-2xl border border-[var(--sportlink-border)] bg-[#20211e] px-4 py-10 text-center text-sm text-[var(--sportlink-text-muted)]">
        Map unavailable — add <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> to{" "}
        <code>apps/web/.env</code>.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search input + suggestions */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Search for an address or place…"
          className="w-full rounded-xl border border-[var(--sportlink-border)] bg-[#30302d] px-4 py-2.5 text-base text-[#f3f2ee] outline-none transition focus:border-[#6f6e67]"
        />
        {isSearching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--sportlink-text-muted)]">
            Searching…
          </span>
        )}

        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-[var(--sportlink-border)] bg-[#2a2a27] shadow-xl">
            {suggestions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(s)}
                  className="w-full px-4 py-3 text-left text-sm text-[#e8e6de] transition hover:bg-[#35352f]"
                >
                  {s.place_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map — always visible, shows pin after confirmation */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--sportlink-border)]">
        <div ref={mapNodeRef} className="h-72 w-full bg-[#20211e]" />
        {!mapReady && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#20211e] text-sm text-[var(--sportlink-text-muted)]">
            Loading map…
          </div>
        )}
        {mapReady && !confirmed && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-[rgba(0,0,0,0.6)] px-4 py-1.5 text-xs text-[#ccc]">
            Search above to pin a location
          </div>
        )}
      </div>

      {confirmed && (
        <p className="text-sm text-[var(--sportlink-green)]">
          Pinned: {confirmed.address}
        </p>
      )}
    </div>
  );
}
