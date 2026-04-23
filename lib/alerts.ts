import type { WeatherPayload } from "@/lib/open-meteo";

export type AlertSeverity = "low" | "medium" | "high";

export type Advisory = {
  id: string;
  title: string;
  detail: string;
  severity: AlertSeverity;
};

const STORM_CODES = new Set([95, 96, 99]);

function aqiSeverity(aqi: number): AlertSeverity {
  if (aqi >= 200) return "high";
  if (aqi >= 150) return "medium";
  return "low";
}

function aqiLabel(aqi: number): string {
  if (aqi >= 301) return "Hazardous";
  if (aqi >= 201) return "Very Unhealthy";
  if (aqi >= 151) return "Unhealthy";
  if (aqi >= 101) return "Unhealthy for sensitive groups";
  return "Moderate";
}

export function deriveAlerts(payload: WeatherPayload): Advisory[] {
  const out: Advisory[] = [];
  const { hourly, daily, current } = payload.forecast;

  const startIdx = Math.max(0, hourly.time.indexOf(current.time));
  const endIdx = Math.min(startIdx + 24, hourly.time.length);

  let maxApparent = -Infinity;
  let minApparent = Infinity;
  let maxWind = 0;
  let maxPrecip = 0;
  let hasStorm = false;

  for (let i = startIdx; i < endIdx; i++) {
    maxApparent = Math.max(maxApparent, hourly.apparent_temperature[i]);
    minApparent = Math.min(minApparent, hourly.apparent_temperature[i]);
    maxWind = Math.max(maxWind, hourly.wind_speed_10m[i]);
    maxPrecip = Math.max(maxPrecip, hourly.precipitation[i]);
    if (STORM_CODES.has(hourly.weather_code[i])) hasStorm = true;
  }

  const maxUv = Math.max(daily.uv_index_max[0] ?? 0, daily.uv_index_max[1] ?? 0);

  if (maxApparent >= 35) {
    out.push({
      id: "heat",
      title: "Extreme heat",
      detail: `Feels-like temperatures up to ${Math.round(maxApparent)}°C expected in the next 24 hours.`,
      severity: "high",
    });
  }
  if (minApparent <= -15) {
    out.push({
      id: "cold",
      title: "Severe cold",
      detail: `Feels-like temperatures down to ${Math.round(minApparent)}°C expected in the next 24 hours.`,
      severity: "high",
    });
  }
  if (hasStorm) {
    out.push({
      id: "storm",
      title: "Thunderstorm",
      detail: "Thunderstorms are forecast within the next 24 hours.",
      severity: "high",
    });
  }
  if (maxWind >= 50) {
    out.push({
      id: "wind",
      title: "High winds",
      detail: `Wind gusts up to ${Math.round(maxWind)} km/h expected.`,
      severity: "medium",
    });
  }
  if (maxPrecip >= 10) {
    out.push({
      id: "precip",
      title: "Heavy precipitation",
      detail: `Up to ${maxPrecip.toFixed(1)} mm/h of rain possible.`,
      severity: "medium",
    });
  }
  if (maxUv >= 8) {
    out.push({
      id: "uv",
      title: "Extreme UV",
      detail: `UV index forecast to reach ${Math.round(maxUv)} — protect skin and eyes.`,
      severity: "low",
    });
  }
  if (payload.airQuality && payload.airQuality.us_aqi >= 100) {
    const aqi = payload.airQuality.us_aqi;
    out.push({
      id: "aqi",
      title: `Poor air quality — ${aqiLabel(aqi)}`,
      detail: `US AQI is ${Math.round(aqi)}. Consider limiting outdoor activity.`,
      severity: aqiSeverity(aqi),
    });
  }

  return out.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}

function severityRank(s: AlertSeverity): number {
  return s === "high" ? 2 : s === "medium" ? 1 : 0;
}

export function aqiCategory(aqi: number): {
  label: string;
  tone: "green" | "yellow" | "orange" | "red" | "purple" | "maroon";
} {
  if (aqi >= 301) return { label: "Hazardous", tone: "maroon" };
  if (aqi >= 201) return { label: "Very Unhealthy", tone: "purple" };
  if (aqi >= 151) return { label: "Unhealthy", tone: "red" };
  if (aqi >= 101) return { label: "Sensitive groups", tone: "orange" };
  if (aqi >= 51) return { label: "Moderate", tone: "yellow" };
  return { label: "Good", tone: "green" };
}
