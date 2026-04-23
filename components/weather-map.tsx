"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { GeocodeResult, WeatherPayload } from "@/lib/open-meteo";
import { formatTemp, type Unit } from "@/lib/units";
import { getLabel } from "@/lib/wmo-codes";
import { cn } from "@/lib/utils";

type WeatherMapProps = {
  payload: WeatherPayload;
  location: GeocodeResult;
  unit: Unit;
  onSelect: (loc: GeocodeResult) => void;
  className?: string;
};

function buildMarkerIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `
      <span style="
        display: block;
        width: 18px;
        height: 18px;
        border-radius: 9999px;
        background: #ffffff;
        border: 3px solid #0ea5e9;
        box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.28), 0 6px 14px rgba(0, 0, 0, 0.45);
      "></span>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });
}

function ClickToRelocate({
  onSelect,
}: {
  onSelect: (loc: GeocodeResult) => void;
}) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      try {
        const res = await fetch(
          `/api/reverse?lat=${lat.toFixed(4)}&lon=${lng.toFixed(4)}`,
        );
        const data = res.ok
          ? ((await res.json()) as { result: GeocodeResult | null })
          : { result: null };
        onSelect(
          data.result ?? {
            id: Math.round(lat * 1e4) * 1e4 + Math.round(lng * 1e4),
            name: `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
            country: "",
            country_code: "",
            latitude: lat,
            longitude: lng,
          },
        );
      } catch {
        // Silent on network errors — click again to retry.
      }
    },
  });
  return null;
}

function FlyToLocation({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], Math.max(map.getZoom(), 10), { duration: 0.8 });
  }, [lat, lon, map]);
  return null;
}

export function WeatherMap({
  payload,
  location,
  unit,
  onSelect,
  className,
}: WeatherMapProps) {
  const icon = useMemo(() => buildMarkerIcon(), []);
  const { current } = payload.forecast;
  const temp = formatTemp(current.temperature_2m, unit, true);
  const label = getLabel(current.weather_code);

  return (
    <div
      className={cn(
        "relative h-96 overflow-hidden rounded-3xl border border-white/15 shadow-2xl",
        className,
      )}
      aria-label="Weather map"
    >
      <MapContainer
        center={[location.latitude, location.longitude]}
        zoom={10}
        scrollWheelZoom
        className="h-full w-full"
        style={{ background: "#0f172a" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains={["a", "b", "c", "d"]}
          maxZoom={19}
        />
        <Marker
          position={[location.latitude, location.longitude]}
          icon={icon}
        >
          <Popup>
            <div style={{ minWidth: "9rem" }}>
              <strong>{location.name}</strong>
              <div style={{ marginTop: 4, fontSize: 12, opacity: 0.85 }}>
                {temp} · {label}
              </div>
            </div>
          </Popup>
        </Marker>
        <ClickToRelocate onSelect={onSelect} />
        <FlyToLocation
          lat={location.latitude}
          lon={location.longitude}
        />
      </MapContainer>
      <p className="pointer-events-none absolute left-4 top-4 z-[400] rounded-full bg-black/45 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white/85 backdrop-blur">
        Tap anywhere to load weather
      </p>
    </div>
  );
}
