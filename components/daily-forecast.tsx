"use client";

import { Droplets } from "lucide-react";
import { WeatherIcon } from "@/components/weather-icon";
import type { WeatherPayload } from "@/lib/open-meteo";
import { cToF, formatDayName, formatTemp, type Unit } from "@/lib/units";
import { cn } from "@/lib/utils";

type DailyForecastProps = {
  payload: WeatherPayload;
  unit: Unit;
  className?: string;
};

export function DailyForecast({ payload, unit, className }: DailyForecastProps) {
  const { daily } = payload.forecast;
  const inUnit = (c: number) => (unit === "imperial" ? cToF(c) : c);

  const highs = daily.temperature_2m_max.map(inUnit);
  const lows = daily.temperature_2m_min.map(inUnit);
  const weekMin = Math.min(...lows);
  const weekMax = Math.max(...highs);
  const span = Math.max(1, weekMax - weekMin);

  return (
    <section
      className={cn(
        "rounded-3xl border border-white/15 bg-white/10 p-5 text-white shadow-2xl backdrop-blur-xl sm:p-6",
        className,
      )}
      aria-label="7-day forecast"
    >
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
        7-day forecast
      </h2>
      <ol role="list" className="mt-4 divide-y divide-white/10">
        {daily.time.map((iso, i) => {
          const lo = lows[i];
          const hi = highs[i];
          const left = ((lo - weekMin) / span) * 100;
          const width = Math.max(3, ((hi - lo) / span) * 100);
          return (
            <li
              key={iso}
              className="-mx-2 grid grid-cols-[4rem_2.25rem_1fr_auto] items-center gap-3 rounded-2xl px-2 py-2.5 transition-all duration-150 hover:-translate-y-px hover:bg-white/[0.06]"
            >
              <span className="text-sm font-medium text-white/90">
                {formatDayName(iso, { today: i === 0 })}
              </span>
              <WeatherIcon
                code={daily.weather_code[i]}
                isDay
                size={32}
                className="drop-shadow-none"
              />
              <div className="flex items-center gap-3">
                <span className="w-9 text-right font-mono text-xs tabular-nums text-white/70">
                  {formatTemp(daily.temperature_2m_min[i], unit)}
                </span>
                <div className="relative h-1.5 flex-1 rounded-full bg-white/10">
                  <div
                    className="absolute h-1.5 rounded-full bg-gradient-to-r from-sky-300 via-white to-amber-300"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                </div>
                <span className="w-9 font-mono text-xs tabular-nums text-white">
                  {formatTemp(daily.temperature_2m_max[i], unit)}
                </span>
              </div>
              <span
                className={cn(
                  "flex w-12 items-center justify-end gap-0.5 text-[11px] tabular-nums",
                  (daily.precipitation_probability_max[i] ?? 0) >= 30
                    ? "text-sky-200"
                    : "text-white/40",
                )}
              >
                <Droplets className="size-3" />
                {daily.precipitation_probability_max[i] ?? 0}%
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
