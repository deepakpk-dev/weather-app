export type WmoCondition = {
  label: string;
  iconDay: string;
  iconNight: string;
  gradientDay: string;
  gradientNight: string;
  isSevere?: boolean;
};

const grad = (...stops: string[]) =>
  `linear-gradient(160deg, ${stops.join(", ")})`;

const SKY_DAY = grad("#38bdf8 0%", "#0ea5e9 45%", "#4338ca 100%");
const SKY_NIGHT = grad("#1e1b4b 0%", "#0f172a 55%", "#020617 100%");
const CLOUDY_DAY = grad("#0ea5e9 0%", "#64748b 55%", "#334155 100%");
const CLOUDY_NIGHT = grad("#1e293b 0%", "#0f172a 60%", "#020617 100%");
const FOG_DAY = grad("#cbd5e1 0%", "#94a3b8 50%", "#475569 100%");
const FOG_NIGHT = grad("#334155 0%", "#1e293b 55%", "#020617 100%");
const RAIN_DAY = grad("#64748b 0%", "#0369a1 55%", "#0f172a 100%");
const RAIN_NIGHT = grad("#1e293b 0%", "#082f49 55%", "#020617 100%");
const SNOW_DAY = grad("#bae6fd 0%", "#a5b4fc 50%", "#6366f1 100%");
const SNOW_NIGHT = grad("#4338ca 0%", "#1e293b 55%", "#020617 100%");
const STORM_DAY = grad("#6d28d9 0%", "#1e293b 55%", "#020617 100%");
const STORM_NIGHT = grad("#4c1d95 0%", "#020617 60%", "#000000 100%");

export const WMO_TABLE: Record<number, WmoCondition> = {
  0: {
    label: "Clear sky",
    iconDay: "clear-day",
    iconNight: "clear-night",
    gradientDay: SKY_DAY,
    gradientNight: SKY_NIGHT,
  },
  1: {
    label: "Mainly clear",
    iconDay: "clear-day",
    iconNight: "clear-night",
    gradientDay: SKY_DAY,
    gradientNight: SKY_NIGHT,
  },
  2: {
    label: "Partly cloudy",
    iconDay: "partly-cloudy-day",
    iconNight: "partly-cloudy-night",
    gradientDay: CLOUDY_DAY,
    gradientNight: CLOUDY_NIGHT,
  },
  3: {
    label: "Overcast",
    iconDay: "overcast-day",
    iconNight: "overcast-night",
    gradientDay: CLOUDY_DAY,
    gradientNight: CLOUDY_NIGHT,
  },
  45: {
    label: "Fog",
    iconDay: "fog-day",
    iconNight: "fog-night",
    gradientDay: FOG_DAY,
    gradientNight: FOG_NIGHT,
  },
  48: {
    label: "Depositing rime fog",
    iconDay: "fog-day",
    iconNight: "fog-night",
    gradientDay: FOG_DAY,
    gradientNight: FOG_NIGHT,
  },
  51: {
    label: "Light drizzle",
    iconDay: "partly-cloudy-day-drizzle",
    iconNight: "partly-cloudy-night-drizzle",
    gradientDay: RAIN_DAY,
    gradientNight: RAIN_NIGHT,
  },
  53: {
    label: "Moderate drizzle",
    iconDay: "drizzle",
    iconNight: "drizzle",
    gradientDay: RAIN_DAY,
    gradientNight: RAIN_NIGHT,
  },
  55: {
    label: "Dense drizzle",
    iconDay: "drizzle",
    iconNight: "drizzle",
    gradientDay: RAIN_DAY,
    gradientNight: RAIN_NIGHT,
  },
  56: {
    label: "Light freezing drizzle",
    iconDay: "sleet",
    iconNight: "sleet",
    gradientDay: SNOW_DAY,
    gradientNight: SNOW_NIGHT,
  },
  57: {
    label: "Dense freezing drizzle",
    iconDay: "sleet",
    iconNight: "sleet",
    gradientDay: SNOW_DAY,
    gradientNight: SNOW_NIGHT,
  },
  61: {
    label: "Light rain",
    iconDay: "partly-cloudy-day-rain",
    iconNight: "partly-cloudy-night-rain",
    gradientDay: RAIN_DAY,
    gradientNight: RAIN_NIGHT,
  },
  63: {
    label: "Moderate rain",
    iconDay: "rain",
    iconNight: "rain",
    gradientDay: RAIN_DAY,
    gradientNight: RAIN_NIGHT,
  },
  65: {
    label: "Heavy rain",
    iconDay: "rain",
    iconNight: "rain",
    gradientDay: RAIN_DAY,
    gradientNight: RAIN_NIGHT,
    isSevere: true,
  },
  66: {
    label: "Light freezing rain",
    iconDay: "sleet",
    iconNight: "sleet",
    gradientDay: SNOW_DAY,
    gradientNight: SNOW_NIGHT,
  },
  67: {
    label: "Heavy freezing rain",
    iconDay: "sleet",
    iconNight: "sleet",
    gradientDay: SNOW_DAY,
    gradientNight: SNOW_NIGHT,
    isSevere: true,
  },
  71: {
    label: "Light snow",
    iconDay: "partly-cloudy-day-snow",
    iconNight: "partly-cloudy-night-snow",
    gradientDay: SNOW_DAY,
    gradientNight: SNOW_NIGHT,
  },
  73: {
    label: "Moderate snow",
    iconDay: "snow",
    iconNight: "snow",
    gradientDay: SNOW_DAY,
    gradientNight: SNOW_NIGHT,
  },
  75: {
    label: "Heavy snow",
    iconDay: "snow",
    iconNight: "snow",
    gradientDay: SNOW_DAY,
    gradientNight: SNOW_NIGHT,
    isSevere: true,
  },
  77: {
    label: "Snow grains",
    iconDay: "snow",
    iconNight: "snow",
    gradientDay: SNOW_DAY,
    gradientNight: SNOW_NIGHT,
  },
  80: {
    label: "Light rain showers",
    iconDay: "partly-cloudy-day-rain",
    iconNight: "partly-cloudy-night-rain",
    gradientDay: RAIN_DAY,
    gradientNight: RAIN_NIGHT,
  },
  81: {
    label: "Moderate rain showers",
    iconDay: "rain",
    iconNight: "rain",
    gradientDay: RAIN_DAY,
    gradientNight: RAIN_NIGHT,
  },
  82: {
    label: "Violent rain showers",
    iconDay: "rain",
    iconNight: "rain",
    gradientDay: RAIN_DAY,
    gradientNight: RAIN_NIGHT,
    isSevere: true,
  },
  85: {
    label: "Light snow showers",
    iconDay: "partly-cloudy-day-snow",
    iconNight: "partly-cloudy-night-snow",
    gradientDay: SNOW_DAY,
    gradientNight: SNOW_NIGHT,
  },
  86: {
    label: "Heavy snow showers",
    iconDay: "snow",
    iconNight: "snow",
    gradientDay: SNOW_DAY,
    gradientNight: SNOW_NIGHT,
    isSevere: true,
  },
  95: {
    label: "Thunderstorm",
    iconDay: "thunderstorms-day",
    iconNight: "thunderstorms-night",
    gradientDay: STORM_DAY,
    gradientNight: STORM_NIGHT,
    isSevere: true,
  },
  96: {
    label: "Thunderstorm with light hail",
    iconDay: "thunderstorms-day-rain",
    iconNight: "thunderstorms-night-rain",
    gradientDay: STORM_DAY,
    gradientNight: STORM_NIGHT,
    isSevere: true,
  },
  99: {
    label: "Thunderstorm with heavy hail",
    iconDay: "thunderstorms-day-rain",
    iconNight: "thunderstorms-night-rain",
    gradientDay: STORM_DAY,
    gradientNight: STORM_NIGHT,
    isSevere: true,
  },
};

const FALLBACK: WmoCondition = {
  label: "Unknown",
  iconDay: "not-available",
  iconNight: "not-available",
  gradientDay: CLOUDY_DAY,
  gradientNight: CLOUDY_NIGHT,
};

export function getCondition(code: number): WmoCondition {
  return WMO_TABLE[code] ?? FALLBACK;
}

export function getIconName(code: number, isDay: boolean): string {
  const condition = getCondition(code);
  return isDay ? condition.iconDay : condition.iconNight;
}

export function getGradient(code: number, isDay: boolean): string {
  const condition = getCondition(code);
  return isDay ? condition.gradientDay : condition.gradientNight;
}

export function getLabel(code: number): string {
  return getCondition(code).label;
}

export function isSevere(code: number): boolean {
  return getCondition(code).isSevere ?? false;
}
