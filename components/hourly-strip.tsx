"use client";

import { Droplets } from "lucide-react";
import { WeatherIcon } from "@/components/weather-icon";
import type { WeatherPayload } from "@/lib/open-meteo";
import { cToF, formatHour, formatTemp, type Unit } from "@/lib/units";
import { cn } from "@/lib/utils";

type HourlyStripProps = {
  payload: WeatherPayload;
  unit: Unit;
  className?: string;
};

const HOURS = 24;

export function HourlyStrip({ payload, unit, className }: HourlyStripProps) {
  const { hourly, current } = payload.forecast;
  const startIdx = Math.max(0, hourly.time.indexOf(current.time));
  const end = Math.min(startIdx + HOURS, hourly.time.length);

  const slice = {
    time: hourly.time.slice(startIdx, end),
    temp: hourly.temperature_2m.slice(startIdx, end),
    code: hourly.weather_code.slice(startIdx, end),
    precipProb: hourly.precipitation_probability.slice(startIdx, end),
  };

  const inUnit = (c: number) => (unit === "imperial" ? cToF(c) : c);
  const temps = slice.temp.map(inUnit);
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const range = Math.max(1, maxT - minT);
  const sparklinePoints = temps
    .map((t, i) => {
      const x = (i / Math.max(1, temps.length - 1)) * 100;
      const y = 100 - ((t - minT) / range) * 100;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const currentHourIso = current.time;

  return (
    <section
      className={cn(
        "rounded-3xl border border-white/15 bg-white/10 p-5 text-white shadow-2xl backdrop-blur-xl sm:p-6",
        className,
      )}
      aria-label="Hourly forecast"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
          Next 24 hours
        </h2>
        <p className="text-xs text-white/50">Scroll horizontally</p>
      </div>

      <div className="relative mt-4">
        <svg
          viewBox="0 0 100 28"
          preserveAspectRatio="none"
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-7 w-full"
        >
          <polyline
            points={sparklinePoints}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.75"
            vectorEffect="non-scaling-stroke"
            transform="scale(1 0.28)"
          />
        </svg>
        <ul
          tabIndex={0}
          role="list"
          aria-label="Hourly forecast, scroll horizontally to see more"
          className="relative flex gap-2 overflow-x-auto scroll-smooth pb-1 pt-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-inset"
        >
          {slice.time.map((iso, i) => {
            const isNow = iso === currentHourIso;
            const isDay = hourIsDay(iso, payload.forecast.daily.sunrise, payload.forecast.daily.sunset);
            return (
              <li
                key={iso}
                className={cn(
                  "flex min-w-16 shrink-0 flex-col items-center gap-1 rounded-2xl px-2 py-3 text-center transition-all duration-200 hover:bg-white/15 hover:ring-1 hover:ring-amber-300/25",
                  isNow && "bg-white/15 ring-1 ring-white/30",
                )}
              >
                <span className="text-[11px] font-medium text-white/70">
                  {isNow ? "Now" : formatHour(iso)}
                </span>
                <WeatherIcon code={slice.code[i]} isDay={isDay} size={40} className="drop-shadow-none" />
                <span className="font-mono text-sm tabular-nums text-white">
                  {formatTemp(slice.temp[i], unit)}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-0.5 text-[10px] tabular-nums",
                    slice.precipProb[i] >= 30 ? "text-sky-200" : "text-white/40",
                  )}
                >
                  <Droplets className="size-3" />
                  {slice.precipProb[i] ?? 0}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function hourIsDay(iso: string, sunrises: string[], sunsets: string[]): boolean {
  const date = iso.slice(0, 10);
  const idx = sunrises.findIndex((s) => s.startsWith(date));
  if (idx < 0) return true;
  const hour = iso.slice(11, 16);
  const sr = sunrises[idx].slice(11, 16);
  const ss = sunsets[idx].slice(11, 16);
  return hour >= sr && hour <= ss;
}
