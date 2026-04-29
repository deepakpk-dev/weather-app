# Weather App

A polished, production-style weather dashboard built with Next.js, React, TypeScript, Tailwind CSS, Open-Meteo, and Leaflet. The app helps users search any city, view live weather conditions, compare the next 24 hours and 7 days, check air quality, and explore conditions from an interactive map.

Repository: [github.com/deepakprabh/weather-app](https://github.com/deepakprabh/weather-app)

## Highlights

- Real-time current conditions with temperature, feels-like temperature, humidity, UV index, wind speed, wind direction, sunrise, and sunset.
- 24-hour forecast strip with weather icons, precipitation probability, and a compact temperature trend sparkline.
- 7-day forecast with daily high/low range bars and precipitation probability.
- Air quality panel using US AQI plus pollutant-level detail for PM2.5, PM10, NO2, O3, SO2, and CO.
- Advisory banner for high-impact conditions such as extreme heat, severe cold, thunderstorms, high winds, heavy precipitation, high UV, and poor air quality.
- City search with debounced Open-Meteo geocoding, recent locations, and browser geolocation support.
- Interactive Leaflet map with dark Carto tiles, clickable relocation, reverse geocoding, and animated map navigation.
- Metric/imperial unit toggle with localStorage persistence.
- Server-side API routes that normalize upstream weather, air quality, search, and reverse-geocoding calls behind a clean application interface.
- Responsive, accessible UI with loading skeletons, keyboard-aware controls, ARIA labels, reduced-motion support, and a skip link.

## Tech Stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4, shadcn-style components |
| Data fetching | SWR, Next.js Route Handlers |
| Weather data | Open-Meteo Forecast API, Air Quality API, Geocoding API |
| Mapping | Leaflet, React Leaflet, CARTO dark basemap tiles |
| Icons | Lucide React, Meteocons weather SVG assets |
| Quality | ESLint, strict TypeScript configuration |
| Deployment | Vercel-ready configuration |

## Product Walkthrough

The default view opens on London and immediately fetches forecast and air quality data through the app's `/api/forecast` route. Users can search for another city, use their current browser location, or click anywhere on the map to load weather for that coordinate.

The dashboard is organized for quick scanning:

- Current conditions lead with the live temperature, weather state, feels-like temperature, daily high/low, wind, humidity, UV index, and sunrise/sunset.
- Air quality is shown as a separate card so health-related context is easy to find.
- The 24-hour forecast is horizontally scrollable and includes iconography, precipitation odds, and a visual trend line.
- The 7-day forecast compares daily ranges against the weekly min/max so temperature swings are visible at a glance.
- The map acts as both a location context view and an input surface for selecting new coordinates.

## Architecture

```text
app/
  api/
    forecast/route.ts   # Validates lat/lon and returns forecast + AQI payloads
    search/route.ts     # Debounced city search backend for Open-Meteo geocoding
    reverse/route.ts    # Reverse geocoding for map clicks and browser location
  layout.tsx            # Metadata, fonts, global shell, accessibility skip link
  page.tsx              # Parses URL location params and renders the dashboard

components/
  weather-dashboard.tsx # Main client-side dashboard orchestration
  current-conditions.tsx
  hourly-strip.tsx
  daily-forecast.tsx
  air-quality-card.tsx
  alerts-banner.tsx
  location-search.tsx
  weather-map.tsx
  weather-icon.tsx
  ui/                   # Reusable UI primitives

lib/
  open-meteo.ts         # Typed API client and normalized payload types
  alerts.ts             # Derived advisory rules
  geo.ts                # Browser geolocation + reverse geocode flow
  storage.ts            # Recent-location persistence
  units.ts              # Unit conversions and date/time formatting
  wmo-codes.ts          # WMO weather-code labels and icon mapping
```

The browser never calls Open-Meteo directly for the core forecast flow. Client components call local Next.js API routes, which validate request parameters, handle upstream errors, and set cache headers. This keeps the UI code focused on presentation and state while the data integration remains centralized in `lib/open-meteo.ts`.

## API Routes

| Route | Purpose | Query params |
| --- | --- | --- |
| `GET /api/forecast` | Fetches current, hourly, daily, and air-quality data | `lat`, `lon` |
| `GET /api/search` | Searches city/location names | `q` |
| `GET /api/reverse` | Resolves coordinates into a location label | `lat`, `lon` |

All coordinate-based routes validate latitude and longitude bounds before calling upstream services. Successful responses include shared cache headers with a 5-minute revalidation window and a 10-minute stale-while-revalidate window.

## Data Sources

This project uses Open-Meteo APIs:

- Forecast API for current weather, hourly forecast, and 7-day daily forecast.
- Air Quality API for US AQI and pollutant measurements.
- Geocoding API for location search and reverse geocoding.

No API key is required for local development.

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm

### Installation

```bash
git clone https://github.com/deepakprabh/weather-app.git
cd weather-app
npm install
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## Configuration

The app does not require environment variables. It uses public Open-Meteo endpoints and browser geolocation APIs.

For browser geolocation to work outside localhost, the site must be served over HTTPS. This is handled automatically on Vercel and most production hosting platforms.

## Deployment

The project is ready to deploy on Vercel:

1. Import the GitHub repository into Vercel.
2. Use the default Next.js framework settings.
3. Deploy without adding environment variables.

The included `vercel.json` adds long-term caching for static weather icon assets and security headers such as `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy`.

## Engineering Notes

- SWR refreshes forecast data every 5 minutes, deduplicates repeated requests, and keeps previous data during location changes.
- The Leaflet map is dynamically imported with server-side rendering disabled to avoid browser-only API issues during server rendering.
- Unit preference and recent locations are persisted client-side for a more convenient return experience.
- Air quality is treated as optional because some regions may not return complete AQI data.
- Advisory logic is derived from forecast and air-quality payloads, keeping presentation components simple and predictable.
- The app is designed to degrade gracefully with skeleton loading states, upstream error messages, and fallback coordinate labels when reverse geocoding is unavailable.

## Future Improvements

- Add automated component tests for dashboard states and API route validation.
- Add Playwright smoke tests for city search, unit switching, and map-based relocation.
- Support saved favorite locations across devices with an authenticated backend.
- Add precipitation radar or weather layers if a suitable tile provider is introduced.
- Add PWA support for installability and offline fallback behavior.

## License

No license file is currently included. Add a license before distributing or accepting external contributions.
