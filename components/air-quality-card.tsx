import { Leaf } from "lucide-react";
import { aqiCategory } from "@/lib/alerts";
import type { AirQuality } from "@/lib/open-meteo";
import { cn } from "@/lib/utils";

type AirQualityCardProps = {
  aqi: AirQuality | null;
  className?: string;
};

const TONE_CLASS: Record<ReturnType<typeof aqiCategory>["tone"], string> = {
  green: "bg-emerald-400/20 text-emerald-100 ring-emerald-300/40",
  yellow: "bg-amber-300/20 text-amber-100 ring-amber-200/40",
  orange: "bg-orange-400/25 text-orange-100 ring-orange-300/50",
  red: "bg-red-500/25 text-red-100 ring-red-300/50",
  purple: "bg-purple-500/30 text-purple-100 ring-purple-300/50",
  maroon: "bg-red-900/60 text-red-100 ring-red-500/60",
};

export function AirQualityCard({ aqi, className }: AirQualityCardProps) {
  if (!aqi) {
    return (
      <section
        className={cn(
          "flex flex-col rounded-3xl border border-white/15 bg-white/10 p-5 text-white shadow-2xl backdrop-blur-xl sm:p-6",
          className,
        )}
        aria-label="Air quality"
      >
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
          Air quality
        </h2>
        <p className="mt-4 text-sm text-white/60">
          Air quality data isn&apos;t available for this location.
        </p>
      </section>
    );
  }

  const category = aqiCategory(aqi.us_aqi);

  return (
    <section
      className={cn(
        "flex flex-col rounded-3xl border border-white/15 bg-white/10 p-5 text-white shadow-2xl backdrop-blur-xl sm:p-6",
        className,
      )}
      aria-label="Air quality"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
          Air quality
        </h2>
        <Leaf className="size-4 text-white/40" aria-hidden />
      </div>

      <div className="mt-4 flex items-end gap-4">
        <p className="font-[family-name:var(--font-display)] text-6xl font-black leading-none tracking-tight">
          {Math.round(aqi.us_aqi)}
        </p>
        <span
          className={cn(
            "mb-1 rounded-full px-3 py-1 text-xs font-medium ring-1 backdrop-blur",
            TONE_CLASS[category.tone],
          )}
        >
          {category.label}
        </span>
      </div>
      <p className="mt-1 text-xs text-white/50">US AQI</p>

      <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <Pollutant label="PM2.5" value={aqi.pm2_5} unit="µg/m³" />
        <Pollutant label="PM10" value={aqi.pm10} unit="µg/m³" />
        <Pollutant label="NO₂" value={aqi.nitrogen_dioxide} unit="µg/m³" />
        <Pollutant label="O₃" value={aqi.ozone} unit="µg/m³" />
        <Pollutant label="SO₂" value={aqi.sulphur_dioxide} unit="µg/m³" />
        <Pollutant label="CO" value={aqi.carbon_monoxide} unit="µg/m³" />
      </ul>
    </section>
  );
}

function Pollutant({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <li className="flex items-baseline justify-between gap-2 border-b border-white/5 pb-1">
      <span className="text-white/55">{label}</span>
      <span className="font-mono tabular-nums text-white/90">
        {Number.isFinite(value) ? value.toFixed(1) : "—"}
        <span className="ml-1 text-[10px] text-white/40">{unit}</span>
      </span>
    </li>
  );
}
