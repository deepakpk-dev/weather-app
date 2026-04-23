import type { GeocodeResult } from "@/lib/open-meteo";

const RECENTS_KEY = "weather-app:recent-locations";
const MAX_RECENTS = 5;

function isGeocodeResult(value: unknown): value is GeocodeResult {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "number" &&
    typeof v.name === "string" &&
    typeof v.country === "string" &&
    typeof v.country_code === "string" &&
    typeof v.latitude === "number" &&
    typeof v.longitude === "number"
  );
}

export function getRecentLocations(): GeocodeResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isGeocodeResult).slice(0, MAX_RECENTS);
  } catch {
    return [];
  }
}

export function addRecentLocation(location: GeocodeResult): GeocodeResult[] {
  if (typeof window === "undefined") return [];
  const current = getRecentLocations();
  const filtered = current.filter((item) => item.id !== location.id);
  const next = [location, ...filtered].slice(0, MAX_RECENTS);
  try {
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    // Storage may be unavailable (private mode, quota). Silent.
  }
  return next;
}

export function clearRecentLocations(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(RECENTS_KEY);
  } catch {
    // noop
  }
}
