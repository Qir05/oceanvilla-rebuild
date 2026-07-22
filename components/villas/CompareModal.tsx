// components/villas/CompareModal.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { RentalListing } from "./types";

function Row({ label, cells }: { label: string; cells: React.ReactNode[] }) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <th scope="row" className="sticky left-0 bg-white py-3 pr-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap">
        {label}
      </th>
      {cells.map((cell, i) => (
        <td key={i} className="py-3 px-4 text-sm text-slate-800 text-center whitespace-nowrap">
          {cell}
        </td>
      ))}
    </tr>
  );
}

export default function CompareModal({
  listings,
  onClose,
  getTitle,
}: {
  listings: RentalListing[];
  onClose: () => void;
  getTitle: (l: RentalListing) => string;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label="Compare villas">
      <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-[3px]" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full h-[92dvh] sm:h-auto sm:max-h-[85vh] sm:max-w-4xl flex flex-col bg-white rounded-t-3xl sm:rounded-3xl shadow-[0_32px_80px_rgba(15,23,42,0.28)] overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">Compare Villas</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            aria-label="Close compare"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-auto px-5 sm:px-6 py-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="sticky left-0 bg-white py-2 pr-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                  Villa
                </th>
                {listings.map((l) => (
                  <th key={l.id} className="py-2 px-4 text-center min-w-[160px]">
                    <div className="text-sm font-semibold text-slate-900">{getTitle(l)}</div>
                    <div className="text-[11px] text-slate-400">Villa #{l.id}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row label="Bedrooms" cells={listings.map((l) => l.bedrooms ?? "—")} />
              <Row label="Bathrooms" cells={listings.map((l) => l.bathrooms ?? "—")} />
              <Row label="Max Guests" cells={listings.map((l) => l.maxGuests ?? "—")} />
              <Row label="View" cells={listings.map((l) => l.view ?? "Not yet available")} />
              <Row label="Floor" cells={listings.map((l) => l.floorLevel ?? "Not yet available")} />
              <Row
                label="Key Amenities"
                cells={listings.map((l) =>
                  l.amenities && l.amenities.length > 0 ? (
                    <span key="a" className="line-clamp-3 text-xs">
                      {l.amenities.slice(0, 3).join(", ")}
                    </span>
                  ) : (
                    "—"
                  )
                )}
              />
              <Row
                label="Starting Price"
                cells={listings.map((l) =>
                  l.hasPricing && typeof l.minNightlyPrice === "number" && l.minNightlyPrice > 0
                    ? `From $${Math.round(l.minNightlyPrice)}/night`
                    : "Check availability"
                )}
              />
              <Row
                label="Availability"
                cells={listings.map((l) =>
                  l.isAvailable === undefined ? "Search dates to check" : l.isAvailable ? "Available" : "Not available"
                )}
              />
              <Row
                label=""
                cells={listings.map((l) => (
                  <Link
                    key="cta"
                    href={`/listing/${encodeURIComponent(l.id)}`}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
                  >
                    View Villa
                  </Link>
                ))}
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
