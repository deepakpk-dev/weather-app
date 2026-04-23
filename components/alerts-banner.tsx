"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, X } from "lucide-react";
import type { Advisory, AlertSeverity } from "@/lib/alerts";
import { cn } from "@/lib/utils";

type AlertsBannerProps = {
  advisories: Advisory[];
  className?: string;
};

const SEVERITY_STYLE: Record<AlertSeverity, string> = {
  high: "border-red-300/40 bg-red-500/20 text-red-50",
  medium: "border-amber-300/40 bg-amber-400/20 text-amber-50",
  low: "border-sky-300/40 bg-sky-400/20 text-sky-50",
};

const SEVERITY_BADGE: Record<AlertSeverity, string> = {
  high: "bg-red-500/40 text-red-50",
  medium: "bg-amber-500/40 text-amber-50",
  low: "bg-sky-500/40 text-sky-50",
};

export function AlertsBanner({ advisories, className }: AlertsBannerProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  const visible = advisories.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  const top = visible[0];
  const rest = visible.slice(1);
  const showExpand = rest.length > 0;

  return (
    <section
      role="alert"
      aria-live="polite"
      className={cn(
        "rounded-2xl border shadow-xl backdrop-blur-xl",
        SEVERITY_STYLE[top.severity],
        className,
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                SEVERITY_BADGE[top.severity],
              )}
            >
              {top.severity}
            </span>
            <h3 className="truncate text-sm font-semibold">{top.title}</h3>
            {visible.length > 1 && (
              <span className="text-xs opacity-70">
                +{visible.length - 1} more
              </span>
            )}
          </div>
          <p className="mt-1 text-sm opacity-90">{top.detail}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {showExpand && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-label="Show all advisories"
              className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            >
              <ChevronDown
                className={cn("size-4 transition-transform duration-200", expanded && "rotate-180")}
              />
            </button>
          )}
          <button
            type="button"
            onClick={() => setDismissed((prev) => [...prev, top.id])}
            aria-label="Dismiss advisory"
            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {expanded && rest.length > 0 && (
        <ul role="list" className="divide-y divide-white/10 border-t border-white/10">
          {rest.map((advisory) => (
            <li key={advisory.id} className="flex items-start gap-3 px-4 py-2.5">
              <span
                className={cn(
                  "mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  SEVERITY_BADGE[advisory.severity],
                )}
              >
                {advisory.severity}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{advisory.title}</p>
                <p className="text-xs opacity-80">{advisory.detail}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDismissed((prev) => [...prev, advisory.id])
                }
                aria-label={`Dismiss ${advisory.title}`}
                className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
