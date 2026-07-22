// components/villas/VillaFilterBar.tsx
"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { hasActiveFilters, type VillaFilters } from "./types";

function FilterControls({
  filters,
  onChange,
  maxBedrooms,
  maxGuests,
  showOceanViewFilter,
  showGroundFloorFilter,
  showPriceFilter,
  priceRange,
}: {
  filters: VillaFilters;
  onChange: (next: VillaFilters) => void;
  maxBedrooms: number;
  maxGuests: number;
  showOceanViewFilter: boolean;
  showGroundFloorFilter: boolean;
  showPriceFilter: boolean;
  priceRange: { min: number; max: number } | null;
}) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <label htmlFor="f-bedrooms" className="block text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">
          Bedrooms
        </label>
        <select
          id="f-bedrooms"
          value={filters.bedroomsMin ?? ""}
          onChange={(e) => onChange({ ...filters, bedroomsMin: e.target.value ? Number(e.target.value) : null })}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        >
          <option value="">Any</option>
          {Array.from({ length: maxBedrooms }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}+ bedroom{n > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="f-guests" className="block text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">
          Guests
        </label>
        <select
          id="f-guests"
          value={filters.guestsMin ?? ""}
          onChange={(e) => onChange({ ...filters, guestsMin: e.target.value ? Number(e.target.value) : null })}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        >
          <option value="">Any</option>
          {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}+ guests
            </option>
          ))}
        </select>
      </div>

      {showPriceFilter && priceRange && (
        <div>
          <label htmlFor="f-price" className="block text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">
            Nightly rate
          </label>
          <select
            id="f-price"
            value={filters.priceMax ?? ""}
            onChange={(e) =>
              onChange({ ...filters, priceMax: e.target.value ? Number(e.target.value) : null, priceMin: null })
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="">Any</option>
            <option value={String(Math.round(priceRange.min + (priceRange.max - priceRange.min) * 0.33))}>
              Under ${Math.round(priceRange.min + (priceRange.max - priceRange.min) * 0.33)}
            </option>
            <option value={String(Math.round(priceRange.min + (priceRange.max - priceRange.min) * 0.66))}>
              Under ${Math.round(priceRange.min + (priceRange.max - priceRange.min) * 0.66)}
            </option>
            <option value={String(Math.ceil(priceRange.max))}>Under ${Math.ceil(priceRange.max)}</option>
          </select>
        </div>
      )}

      {showOceanViewFilter && (
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.oceanViewOnly}
            onChange={(e) => onChange({ ...filters, oceanViewOnly: e.target.checked })}
            className="h-4 w-4 accent-slate-900"
          />
          Ocean view
        </label>
      )}

      {showGroundFloorFilter && (
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.groundFloorOnly}
            onChange={(e) => onChange({ ...filters, groundFloorOnly: e.target.checked })}
            className="h-4 w-4 accent-slate-900"
          />
          Ground floor
        </label>
      )}
    </div>
  );
}

export default function VillaFilterBar(props: {
  filters: VillaFilters;
  onChange: (next: VillaFilters) => void;
  onClearAll: () => void;
  maxBedrooms: number;
  maxGuests: number;
  showOceanViewFilter: boolean;
  showGroundFloorFilter: boolean;
  showPriceFilter: boolean;
  priceRange: { min: number; max: number } | null;
  resultCount: number;
  totalCount: number;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const active = hasActiveFilters(props.filters);

  // Match the escape-to-close + body-scroll-lock pattern already used by
  // CompareModal and the villa page's InquiryModal.
  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  return (
    <div className="mb-8">
      {/* Desktop filter bar */}
      <div className="hidden md:flex md:items-end md:justify-between md:gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <FilterControls {...props} onChange={props.onChange} />
        <div className="flex items-center gap-3 shrink-0">
          {active && (
            <button
              type="button"
              onClick={() => {
                props.onClearAll();
                trackEvent("filter_clear");
              }}
              className="text-sm font-semibold text-slate-500 hover:text-slate-900 underline underline-offset-2"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Mobile trigger */}
      <div className="flex md:hidden items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm"
          aria-haspopup="dialog"
          aria-expanded={drawerOpen}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M6 9h12M10 14h4" />
          </svg>
          Filters
          {active && <span className="h-2 w-2 rounded-full bg-[#3f5f4a]" />}
        </button>
      </div>

      {/* Result count + active summary */}
      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>
          Showing {props.resultCount} of {props.totalCount} villas
        </span>
        {active && (
          <button
            type="button"
            onClick={props.onClearAll}
            className="md:hidden text-slate-500 hover:text-slate-900 underline underline-offset-2 font-semibold"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[400] md:hidden" role="dialog" aria-modal="true" aria-label="Filter villas">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(env(safe-area-inset-bottom)+20px)] shadow-[0_-12px_40px_rgba(15,23,42,0.2)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                aria-label="Close filters"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <FilterControls {...props} onChange={props.onChange} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  props.onClearAll();
                }}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => {
                  trackEvent("filter_apply", { source: "mobile_drawer" });
                  setDrawerOpen(false);
                }}
                className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Show {props.resultCount} villas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
