export type Unit = "metric" | "imperial";

export const UNIT_STORAGE_KEY = "weather-app:unit";

export function cToF(c: number): number {
  return c * 9 / 5 + 32;
}

export function kmhToMph(kmh: number): number {
  return kmh * 0.621371;
}

export function mmToIn(mm: number): number {
  return mm / 25.4;
}

export function formatTemp(celsius: number, unit: Unit, withUnit = false): string {
  const value = unit === "imperial" ? cToF(celsius) : celsius;
  const rounded = Math.round(value);
  if (!withUnit) return `${rounded}°`;
  return `${rounded}°${unit === "imperial" ? "F" : "C"}`;
}

export function formatWind(kmh: number, unit: Unit): string {
  if (unit === "imperial") return `${Math.round(kmhToMph(kmh))} mph`;
  return `${Math.round(kmh)} km/h`;
}

export function formatPrecip(mm: number, unit: Unit): string {
  if (unit === "imperial") return `${mmToIn(mm).toFixed(2)} in`;
  return `${mm.toFixed(1)} mm`;
}

const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

export function windCompass(deg: number): string {
  const i = Math.round(deg / 45) % 8;
  return COMPASS[i];
}

export function formatHour(iso: string): string {
  const hh = iso.slice(11, 13);
  const hour = Number.parseInt(hh, 10);
  if (!Number.isFinite(hour)) return iso.slice(11, 16);
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

export function formatShortTime(iso: string): string {
  return iso.slice(11, 16);
}

export function formatDayName(iso: string, opts?: { today?: boolean }): string {
  if (opts?.today) return "Today";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const date = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  return date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}
