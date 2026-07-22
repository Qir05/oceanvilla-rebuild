// components/villas/CompareBar.tsx
"use client";

import { trackEvent } from "@/lib/analytics";
import type { RentalListing } from "./types";

export default function CompareBar({
  selected,
  onRemove,
  onClear,
  onOpenCompare,
}: {
  selected: RentalListing[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onOpenCompare: () => void;
}) {
  if (selected.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[70] border-t border-slate-200 bg-white/97 backdrop-blur-md shadow-[0_-8px_30px_rgba(15,23,42,0.1)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 overflow-x-auto">
        <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-slate-500">
          Compare ({selected.length}/4)
        </span>
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
          {selected.map((l) => (
            <span
              key={l.id}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
            >
              {l.name || `Villa ${l.id}`}
              <button
                type="button"
                onClick={() => onRemove(l.id)}
                aria-label={`Remove ${l.name || l.id} from compare`}
                className="text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 text-xs font-semibold text-slate-500 hover:text-slate-900 underline underline-offset-2"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => {
            trackEvent("compare_view", { count: selected.length });
            onOpenCompare();
          }}
          disabled={selected.length < 2}
          className="shrink-0 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition"
        >
          Compare
        </button>
      </div>
    </div>
  );
}
