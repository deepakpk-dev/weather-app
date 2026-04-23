"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Navigation, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatLocationLabel, type GeocodeResult } from "@/lib/open-meteo";
import { addRecentLocation, getRecentLocations } from "@/lib/storage";
import { resolveCurrentLocation } from "@/lib/geo";
import { cn } from "@/lib/utils";

type LocationSearchProps = {
  value?: GeocodeResult | null;
  onSelect: (location: GeocodeResult) => void;
  className?: string;
};

const DEBOUNCE_MS = 250;

export function LocationSearch({
  value,
  onSelect,
  className,
}: LocationSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [recent, setRecent] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (open) setRecent(getRecentLocations());
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const id = ++requestIdRef.current;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(`Search failed (${res.status})`);
        const data = (await res.json()) as { results: GeocodeResult[] };
        if (id !== requestIdRef.current) return;
        setResults(data.results ?? []);
        setLoading(false);
      } catch (err) {
        if (controller.signal.aborted) return;
        if (id !== requestIdRef.current) return;
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const handleSelect = useCallback(
    (location: GeocodeResult) => {
      setRecent(addRecentLocation(location));
      onSelect(location);
      setOpen(false);
      setQuery("");
    },
    [onSelect],
  );

  const handleUseLocation = useCallback(async () => {
    setLocating(true);
    setError(null);
    try {
      const location = await resolveCurrentLocation();
      handleSelect(location);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't detect your location",
      );
    } finally {
      setLocating(false);
    }
  }, [handleSelect]);

  const hasQuery = query.trim().length >= 2;
  const label = value ? formatLocationLabel(value) : "Choose a location";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Search for a location"
        render={
          <Button
            variant="outline"
            className={cn(
              "h-11 min-w-[14rem] justify-start rounded-full border-white/10 bg-background/60 px-5 text-left shadow-lg backdrop-blur-md hover:bg-background/80",
              className,
            )}
          >
            <MapPin className="mr-2 size-4 shrink-0 opacity-70" />
            <span className="truncate text-sm font-medium">{label}</span>
            <Search className="ml-3 size-4 shrink-0 opacity-60" />
          </Button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[min(24rem,calc(100vw-2rem))] p-0"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search cities..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandGroup heading="Quick">
              <CommandItem
                value="__use-current-location__"
                onSelect={handleUseLocation}
                disabled={locating}
              >
                {locating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Navigation className="size-4" />
                )}
                <span>
                  {locating ? "Detecting…" : "Use current location"}
                </span>
              </CommandItem>
            </CommandGroup>

            {hasQuery && (
              <>
                <CommandSeparator />
                <CommandGroup heading={loading ? "Searching…" : "Results"}>
                  {!loading && results.length === 0 && !error && (
                    <div
                      role="status"
                      className="px-2 py-6 text-center text-sm text-muted-foreground"
                    >
                      No matches found.
                    </div>
                  )}
                  {results.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={`result-${result.id}`}
                      onSelect={() => handleSelect(result)}
                    >
                      <MapPin className="size-4 opacity-70" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate">{result.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {[result.admin1, result.country]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {!hasQuery && recent.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Recent">
                  {recent.map((location) => (
                    <CommandItem
                      key={`recent-${location.id}`}
                      value={`recent-${location.id}`}
                      onSelect={() => handleSelect(location)}
                    >
                      <MapPin className="size-4 opacity-60" />
                      <span className="truncate">
                        {formatLocationLabel(location)}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {error && (
              <div
                role="alert"
                className="mx-1 mt-1 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive"
              >
                {error}
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
