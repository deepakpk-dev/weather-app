import { NextResponse } from "next/server";
import { OpenMeteoError, searchLocations } from "@/lib/open-meteo";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchLocations(q);
    return NextResponse.json(
      { results },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    const status = error instanceof OpenMeteoError ? error.status : 502;
    const message = error instanceof Error ? error.message : "Geocoding failed";
    return NextResponse.json({ error: message }, { status });
  }
}
