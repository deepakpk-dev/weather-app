const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const REVERSE_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/reverse";

const REVALIDATE_SECONDS = 300;

export type GeocodeResult = {
  id: number;
  name: string;
  country: string;
  country_code: string;
  admin1?: string;
  admin2?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  population?: number;
};

export type CurrentWeather = {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: 0 | 1;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  uv_index: number;
};

export type HourlyWeather = {
  time: string[];
  temperature_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  precipitation: number[];
  weather_code: number[];
  wind_speed_10m: number[];
};

export type DailyWeather = {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  sunrise: string[];
  sunset: string[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  uv_index_max: number[];
};

export type ForecastResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  utc_offset_seconds: number;
  current: CurrentWeather;
  hourly: HourlyWeather;
  daily: DailyWeather;
};

export type AirQuality = {
  time: string;
  us_aqi: number;
  pm2_5: number;
  pm10: number;
  nitrogen_dioxide: number;
  ozone: number;
  sulphur_dioxide: number;
  carbon_monoxide: number;
};

export type AirQualityResponse = {
  latitude: number;
  longitude: number;
  current: AirQuality;
};

export type WeatherPayload = {
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
    utcOffsetSeconds: number;
  };
  forecast: ForecastResponse;
  airQuality: AirQuality | null;
};

export class OpenMeteoError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "OpenMeteoError";
  }
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) {
    throw new OpenMeteoError(
      `Open-Meteo request failed (${res.status}): ${res.statusText}`,
      res.status,
    );
  }
  return (await res.json()) as T;
}

const FORECAST_PARAMS = new URLSearchParams({
  current: [
    "temperature_2m",
    "relative_humidity_2m",
    "apparent_temperature",
    "is_day",
    "precipitation",
    "weather_code",
    "wind_speed_10m",
    "wind_direction_10m",
    "uv_index",
  ].join(","),
  hourly: [
    "temperature_2m",
    "apparent_temperature",
    "precipitation_probability",
    "precipitation",
    "weather_code",
    "wind_speed_10m",
  ].join(","),
  daily: [
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "sunrise",
    "sunset",
    "precipitation_sum",
    "precipitation_probability_max",
    "wind_speed_10m_max",
    "uv_index_max",
  ].join(","),
  timezone: "auto",
  forecast_days: "7",
  wind_speed_unit: "kmh",
  temperature_unit: "celsius",
  precipitation_unit: "mm",
});

const AIR_QUALITY_PARAMS = new URLSearchParams({
  current: [
    "us_aqi",
    "pm2_5",
    "pm10",
    "nitrogen_dioxide",
    "ozone",
    "sulphur_dioxide",
    "carbon_monoxide",
  ].join(","),
  timezone: "auto",
});

export async function fetchForecast(
  latitude: number,
  longitude: number,
): Promise<ForecastResponse> {
  const params = new URLSearchParams(FORECAST_PARAMS);
  params.set("latitude", latitude.toString());
  params.set("longitude", longitude.toString());
  return fetchJSON<ForecastResponse>(`${FORECAST_URL}?${params.toString()}`);
}

export async function fetchAirQuality(
  latitude: number,
  longitude: number,
): Promise<AirQuality | null> {
  const params = new URLSearchParams(AIR_QUALITY_PARAMS);
  params.set("latitude", latitude.toString());
  params.set("longitude", longitude.toString());
  try {
    const data = await fetchJSON<AirQualityResponse>(
      `${AIR_QUALITY_URL}?${params.toString()}`,
    );
    return data.current;
  } catch {
    // AQI is optional — some regions return empty.
    return null;
  }
}

export async function fetchWeatherPayload(
  latitude: number,
  longitude: number,
): Promise<WeatherPayload> {
  const [forecast, airQuality] = await Promise.all([
    fetchForecast(latitude, longitude),
    fetchAirQuality(latitude, longitude),
  ]);

  return {
    location: {
      latitude: forecast.latitude,
      longitude: forecast.longitude,
      timezone: forecast.timezone,
      utcOffsetSeconds: forecast.utc_offset_seconds,
    },
    forecast,
    airQuality,
  };
}

export async function searchLocations(query: string): Promise<GeocodeResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const params = new URLSearchParams({
    name: trimmed,
    count: "6",
    language: "en",
    format: "json",
  });

  const data = await fetchJSON<{ results?: GeocodeResult[] }>(
    `${GEOCODING_URL}?${params.toString()}`,
  );
  return data.results ?? [];
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<GeocodeResult | null> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    count: "1",
    language: "en",
    format: "json",
  });

  try {
    const data = await fetchJSON<{ results?: GeocodeResult[] }>(
      `${REVERSE_GEOCODING_URL}?${params.toString()}`,
    );
    return data.results?.[0] ?? null;
  } catch {
    return null;
  }
}

export function formatLocationLabel(result: GeocodeResult): string {
  const parts = [result.name];
  if (result.admin1 && result.admin1 !== result.name) parts.push(result.admin1);
  parts.push(result.country);
  return parts.join(", ");
}
