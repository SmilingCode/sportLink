/**
 * Builds a raw SQL fragment for filtering games within a radius.
 * Requires PostGIS extension: CREATE EXTENSION IF NOT EXISTS postgis;
 *
 * Usage in Prisma raw query:
 *   WHERE ST_DWithin(
 *     ST_MakePoint(lng, lat)::geography,
 *     ST_MakePoint($userLng, $userLat)::geography,
 *     $radiusMetres
 *   )
 */

export interface GeoPoint {
  lat: number;
  lng: number;
}

export function radiusToMetres(radiusKm: 10 | 20 | 60): number {
  return radiusKm * 1000;
}

/**
 * Returns the distance in km between two geo points using the
 * Haversine formula — used for in-memory distance annotation
 * when PostGIS is unavailable (e.g. local dev without extension).
 */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinDlat = Math.sin(dLat / 2);
  const sinDlng = Math.sin(dLng / 2);
  const chord =
    sinDlat * sinDlat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDlng * sinDlng;
  return R * 2 * Math.atan2(Math.sqrt(chord), Math.sqrt(1 - chord));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
