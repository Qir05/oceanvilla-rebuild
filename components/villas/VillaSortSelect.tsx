// components/villas/VillaSortSelect.tsx
"use client";

import { SORT_OPTIONS, type VillaSort } from "./types";

export default function VillaSortSelect({
  value,
  onChange,
}: {
  value: VillaSort;
  onChange: (sort: VillaSort) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="villa-sort" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
        Sort by
      </label>
      <select
        id="villa-sort"
        value={value}
        onChange={(e) => onChange(e.target.value as VillaSort)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
