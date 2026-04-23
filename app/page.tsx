import { WeatherDashboard } from "@/components/weather-dashboard";
import type { GeocodeResult } from "@/lib/open-meteo";

const DEFAULT_LOCATION: GeocodeResult = {
  id: 2643743,
  name: "London",
  country: "United Kingdom",
  country_code: "GB",
  admin1: "England",
  latitude: 51.5074,
  longitude: -0.1278,
};

function parseCoord(
  value: string | undefined,
  min: number,
  max: number,
): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

function first(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const lat = parseCoord(first(params.lat), -90, 90);
  const lon = parseCoord(first(params.lon), -180, 180);
  const name = first(params.name);
  const admin1 = first(params.admin1);
  const cc = first(params.cc);

  const location: GeocodeResult =
    lat !== null && lon !== null && name
      ? {
          id: Math.round(lat * 1e4) * 1e4 + Math.round(lon * 1e4),
          name,
          country: "",
          country_code: cc ?? "",
          admin1,
          latitude: lat,
          longitude: lon,
        }
      : DEFAULT_LOCATION;

  return <WeatherDashboard initialLocation={location} />;
}
