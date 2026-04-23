import type { GeocodeResult } from "@/lib/open-meteo";

export class GeolocationUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeolocationUnavailableError";
  }
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      reject(new GeolocationUnavailableError("Geolocation is not supported in this environment."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10_000,
      maximumAge: 5 * 60 * 1000,
    });
  });
}

export async function resolveCurrentLocation(): Promise<GeocodeResult> {
  const position = await getCurrentPosition();
  const { latitude, longitude } = position.coords;

  const params = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
  });
  const res = await fetch(`/api/reverse?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Reverse geocode failed (${res.status})`);
  }
  const data = (await res.json()) as { result: GeocodeResult | null };

  if (data.result) return data.result;

  // Fallback: synthesize a minimal GeocodeResult from coords when the
  // reverse geocoder returns no match (rare — oceans, polar regions).
  return {
    id: Math.round(latitude * 1e4) * 1e4 + Math.round(longitude * 1e4),
    name: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
    country: "",
    country_code: "",
    latitude,
    longitude,
  };
}
