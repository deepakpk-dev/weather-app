"use client";

import { Droplets, Eye, Sunrise, Sunset, Wind } from "lucide-react";
import { WeatherIcon } from "@/components/weather-icon";
import { getLabel } from "@/lib/wmo-codes";
import {
  formatShortTime,
  formatTemp,
  formatWind,
  windCompass,
  type Unit,
} from "@/lib/units";
import type { WeatherPayload } from "@/lib/open-meteo";
import { cn } from "@/lib/utils";

type CurrentConditionsProps = {
  payload: WeatherPayload;
  unit: Unit;
  onUnitChange: (unit: Unit) => void;
  className?: string;
};

export function CurrentConditions({
  payload,
  unit,
  onUnitChange,
  className,
}: CurrentConditionsProps) {
  const { current, daily } = payload.forecast;
  const isDay = current.is_day === 1;
  const label = getLabel(current.weather_code);
  const sunrise = daily.sunrise[0];
  const sunset = daily.sunset[0];
  const highLow = `H ${formatTemp(daily.temperature_2m_max[0], unit)} · L ${formatTemp(daily.temperature_2m_min[0], unit)}`;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-xl sm:p-8",
        className,
      )}
      aria-label="Current conditions"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/45">
            Now
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold tracking-wide text-white/85 sm:text-2xl">
            {label}
          </p>
        </div>
        <UnitToggle unit={unit} onChange={onUnitChange} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-6">
        <WeatherIcon
          code={current.weather_code}
          isDay={isDay}
          size={160}
          priority
          className="-my-2 motion-safe:animate-[float_6s_ease-in-out_infinite]"
        />
        <div className="flex flex-col">
          <p className="font-[family-name:var(--font-display)] text-[7rem] font-black leading-none tracking-tight sm:text-[9rem]">
            {formatTemp(current.temperature_2m, unit)}
          </p>
          <p className="mt-1.5 text-xs text-white/55">
            Feels like{" "}
            <span className="font-mono tabular-nums text-white/80">
              {formatTemp(current.apparent_temperature, unit)}
            </span>
            {" · "}
            <span className="font-mono tabular-nums text-white/80">{highLow}</span>
          </p>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 sm:grid-cols-4">
        <Metric
          icon={<Wind className="size-4" />}
          label="Wind"
          value={`${formatWind(current.wind_speed_10m, unit)} ${windCompass(current.wind_direction_10m)}`}
        />
        <Metric
          icon={<Droplets className="size-4" />}
          label="Humidity"
          value={`${Math.round(current.relative_humidity_2m)}%`}
        />
        <Metric
          icon={<Eye className="size-4" />}
          label="UV index"
          value={current.uv_index.toFixed(1)}
        />
        <Metric
          icon={<Sunrise className="size-4" />}
          label="Sunrise / Sunset"
          value={
            <span className="font-mono tabular-nums">
              {formatShortTime(sunrise)}
              <Sunset className="mx-1.5 inline size-3.5 -translate-y-0.5 opacity-60" aria-hidden />
              {formatShortTime(sunset)}
            </span>
          }
        />
      </dl>

    </section>
  );
}

const UNITS = ["metric", "imperial"] as const;

function UnitToggle({
  unit,
  onChange,
}: {
  unit: Unit;
  onChange: (u: Unit) => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key))
      return;
    e.preventDefault();
    const buttons = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'),
    );
    const currentIdx = buttons.findIndex(
      (b) => b.getAttribute("aria-checked") === "true",
    );
    const dir =
      e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const nextIdx = (currentIdx + dir + buttons.length) % buttons.length;
    buttons[nextIdx].focus();
    onChange(UNITS[nextIdx]);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Temperature unit"
      onKeyDown={handleKeyDown}
      className="inline-flex rounded-full border border-white/15 bg-black/20 p-0.5 text-xs font-medium backdrop-blur"
    >
      {UNITS.map((u) => (
        <button
          key={u}
          role="radio"
          aria-checked={unit === u}
          tabIndex={unit === u ? 0 : -1}
          onClick={() => onChange(u)}
          className={cn(
            "rounded-full px-3 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-black/20",
            unit === u
              ? "bg-white text-slate-900"
              : "text-white/70 hover:text-white",
          )}
        >
          {u === "metric" ? "°C" : "°F"}
        </button>
      ))}
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-xs text-white/70">
        <span aria-hidden>{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium text-white/95">{value}</dd>
    </div>
  );
}
