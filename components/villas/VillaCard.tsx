// components/villas/VillaCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { computeAutoLabels, type RentalListing } from "./types";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default function VillaCard({
  listing,
  title,
  heroUrl,
  selected,
  onToggleCompare,
  compareDisabled,
}: {
  listing: RentalListing;
  title: string;
  heroUrl: string;
  selected: boolean;
  onToggleCompare: (id: string) => void;
  compareDisabled: boolean;
}) {
  const subtitle =
    (listing.description || "").replace(/\s+/g, " ").trim() ||
    (listing.city
      ? `${listing.city}${listing.state ? `, ${listing.state}` : ""}, Turtle Bay, North Shore Oahu`
      : "Turtle Bay · North Shore, Oahu");

  const labels = [...(listing.editorialLabels ?? []), ...computeAutoLabels(listing)].filter(
    (v, i, arr) => arr.indexOf(v) === i
  );

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_6px_26px_rgba(15,23,42,0.06)] border border-slate-100 transition-all duration-300 hover:shadow-[0_18px_60px_rgba(15,23,42,0.14)]">
      {/* Compare checkbox */}
      <label className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm cursor-pointer select-none">
        <input
          type="checkbox"
          checked={selected}
          disabled={compareDisabled && !selected}
          onChange={() => onToggleCompare(listing.id)}
          className="h-3.5 w-3.5 accent-slate-900"
          aria-label={`Add ${title} to compare`}
        />
        Compare
      </label>

      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 shrink-0">
        {heroUrl ? (
          <Image
            src={heroUrl}
            alt={`${title} at Turtle Bay`}
            fill
            unoptimized
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-medium text-slate-400">
            Photo coming soon
          </div>
        )}
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold tracking-wide text-slate-800 shadow-sm">
            Ocean Villas at Turtle Bay
          </span>
        </div>

        {listing.isAvailable !== undefined && (
          <div className="absolute bottom-4 left-4 z-10">
            <span
              className={[
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm",
                listing.isAvailable ? "bg-emerald-600 text-white" : "bg-slate-700/90 text-white",
              ].join(" ")}
            >
              {listing.isAvailable ? "Available for your dates" : "Not available for your dates"}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-6">
        {labels.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {labels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full bg-[#3f5f4a]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#3f5f4a]"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        <h3 className="text-base font-semibold text-slate-900 line-clamp-2 leading-snug">{title}</h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-3">{subtitle}</p>

        {listing.shortFeature && (
          <p className="mt-2 text-xs font-medium text-slate-600 flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 shrink-0 text-[#3f5f4a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {listing.shortFeature}
          </p>
        )}

        <div className="flex-1" />

        {listing.hasPricing && typeof listing.minNightlyPrice === "number" && listing.minNightlyPrice > 0 && (
          <div className="mt-4 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">From ${Math.round(listing.minNightlyPrice)}</span>{" "}
            <span className="text-slate-500">/ night</span>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
          <Stat label="Sleeps" value={`${listing.maxGuests ?? "—"}`} />
          <Stat label="Beds" value={`${listing.bedrooms ?? "—"}`} />
          <Stat label="Baths" value={`${listing.bathrooms ?? "—"}`} />
        </div>

        {(listing.view || listing.floorLevel) && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            {listing.view && <span>{listing.view}</span>}
            {listing.view && listing.floorLevel && <span>·</span>}
            {listing.floorLevel && <span>{listing.floorLevel}</span>}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            href={`/listing/${encodeURIComponent(listing.id)}`}
            onClick={() => trackEvent("villa_card_click", { listing_id: listing.id, cta: "view_villa", source_page: "rentals_collection" })}
            className="inline-flex items-center justify-center rounded-xl bg-[#0f172a] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_3px_12px_rgba(15,23,42,0.18)] hover:-translate-y-px hover:bg-[#1e293b] hover:shadow-[0_6px_18px_rgba(15,23,42,0.24)] active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2 transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            View Villa
          </Link>
          <Link
            href={`/listing/${encodeURIComponent(listing.id)}`}
            onClick={() => trackEvent("villa_card_click", { listing_id: listing.id, cta: "check_availability", source_page: "rentals_collection" })}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-px active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            Check Availability
          </Link>
        </div>
      </div>
    </article>
  );
}
