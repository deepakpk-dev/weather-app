import { NextResponse } from "next/server";
import { fetchWeatherPayload, OpenMeteoError } from "@/lib/open-meteo";

export const runtime = "nodejs";

function parseCoord(value: string | null, min: number, max: number): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseCoord(searchParams.get("lat"), -90, 90);
  const lon = parseCoord(searchParams.get("lon"), -180, 180);

  if (lat === null || lon === null) {
    return NextResponse.json(
      { error: "Query params 'lat' (-90..90) and 'lon' (-180..180) are required." },
      { status: 400 },
    );
  }

  try {
    const payload = await fetchWeatherPayload(lat, lon);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    const status = error instanceof OpenMeteoError ? error.status : 502;
    const message = error instanceof Error ? error.message : "Upstream fetch failed";
    return NextResponse.json({ error: message }, { status });
  }
}
