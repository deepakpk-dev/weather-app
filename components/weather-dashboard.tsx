"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { AlertTriangle, MapPin } from "lucide-react";
import { LocationSearch } from "@/components/location-search";
import { GradientBackdrop } from "@/components/gradient-backdrop";
import { CurrentConditions } from "@/components/current-conditions";
import { HourlyStrip } from "@/components/hourly-strip";
import { DailyForecast } from "@/components/daily-forecast";
import { AirQualityCard } from "@/components/air-quality-card";
import { AlertsBanner } from "@/components/alerts-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { deriveAlerts } from "@/lib/alerts";
import { UNIT_STORAGE_KEY, type Unit } from "@/lib/units";
import type { GeocodeResult, WeatherPayload } from "@/lib/open-meteo";

const WeatherMap = dynamic(
  () => import("@/components/weather-map").then((m) => m.WeatherMap),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-96 rounded-3xl bg-white/10 lg:col-span-1" />
    ),
  },
);

type DashboardProps = {
  initialLocation: GeocodeResult;
};

async function fetcher(url: string): Promise<WeatherPayload> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return (await res.json()) as WeatherPayload;
}

export function WeatherDashboard({ initialLocation }: DashboardProps) {
  const router = useRouter();
  const location = initialLocation;

  const [unit, setUnit] = useState<Unit>("metric");
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(UNIT_STORAGE_KEY);
      if (stored === "metric" || stored === "imperial") setUnit(stored);
    } catch {
      // noop
    }
  }, []);
  const handleUnit = useCallback((next: Unit) => {
    setUnit(next);
    try {
      window.localStorage.setItem(UNIT_STORAGE_KEY, next);
    } catch {
      // noop
    }
  }, []);

  const swrKey = `/api/forecast?lat=${location.latitude}&lon=${location.longitude}`;
  const { data, error, isLoading } = useSWR<WeatherPayload>(swrKey, fetcher, {
    dedupingInterval: 5 * 60 * 1000,
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const handleSelect = useCallback(
    (next: GeocodeResult) => {
      const params = new URLSearchParams();
      params.set("lat", next.latitude.toString());
      params.set("lon", next.longitude.toString());
      params.set("name", next.name);
      if (next.admin1) params.set("admin1", next.admin1);
      if (next.country_code) params.set("cc", next.country_code);
      router.replace(`/?${params.toString()}`);
    },
    [router],
  );

  const advisories = useMemo(() => (data ? deriveAlerts(data) : []), [data]);

  const current = data?.forecast.current;
  const weatherCode = current?.weather_code ?? 0;
  const isDay = current?.is_day === 1 || current === undefined;

  return (
    <>
      <GradientBackdrop weatherCode={weatherCode} isDay={isDay} />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col">
            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/70">
              Live weather
            </span>
            <h1 className="flex items-baseline gap-2 text-2xl font-semibold text-white sm:text-3xl">
              <MapPin className="size-5 self-center opacity-80" aria-hidden />
              <span className="truncate">{location.name}</span>
              {location.admin1 && location.admin1 !== location.name && (
                <span className="truncate text-base font-normal text-white/70">
                  {location.admin1}
                </span>
              )}
            </h1>
          </div>
          <LocationSearch value={location} onSelect={handleSelect} />
        </header>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-300/30 bg-red-500/15 px-4 py-3 text-sm text-red-50 backdrop-blur-md"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div className="min-w-0">
              <p className="font-medium">Couldn&apos;t load the latest weather.</p>
              <p className="truncate text-red-100/80">{(error as Error).message}</p>
            </div>
          </div>
        )}

        {data && advisories.length > 0 && (
          <AlertsBanner advisories={advisories} />
        )}

        <main
          id="main-content"
          aria-live="polite"
          aria-busy={isLoading}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {!data && isLoading ? (
            <DashboardSkeleton />
          ) : data ? (
            <>
              <CurrentConditions
                payload={data}
                unit={unit}
                onUnitChange={handleUnit}
                className="lg:col-span-2"
              />
              <AirQualityCard aqi={data.airQuality} className="lg:col-span-1" />
              <HourlyStrip
                payload={data}
                unit={unit}
                className="lg:col-span-3"
              />
              <DailyForecast
                payload={data}
                unit={unit}
                className="lg:col-span-2"
              />
              <WeatherMap
                payload={data}
                location={location}
                unit={unit}
                onSelect={handleSelect}
                className="lg:col-span-1"
              />
            </>
          ) : null}
        </main>
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <Skeleton className="h-72 rounded-3xl bg-white/10 lg:col-span-2" />
      <Skeleton className="h-72 rounded-3xl bg-white/10" />
      <Skeleton className="h-40 rounded-3xl bg-white/10 lg:col-span-3" />
      <Skeleton className="h-96 rounded-3xl bg-white/10 lg:col-span-2" />
      <Skeleton className="h-96 rounded-3xl bg-white/10" />
    </>
  );
}
