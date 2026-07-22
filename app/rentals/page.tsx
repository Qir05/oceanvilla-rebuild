"use client";

import Link from "next/link";
import Script from "next/script";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { OCEAN_VILLA_LISTING_IDS, getVillaDetail } from "@/lib/ocean-villas";
import { trackEvent } from "@/lib/analytics";
import MobileStickyBookingBar from "@/components/MobileStickyBookingBar";
import VillaCard from "@/components/villas/VillaCard";
import VillaCardSkeleton from "@/components/villas/VillaCardSkeleton";
import VillaFilterBar from "@/components/villas/VillaFilterBar";
import VillaSortSelect from "@/components/villas/VillaSortSelect";
import CompareBar from "@/components/villas/CompareBar";
import CompareModal from "@/components/villas/CompareModal";
import {
  DEFAULT_FILTERS,
  filterListings,
  sortListings,
  type RentalListing,
  type VillaFilters,
  type VillaSort,
} from "@/components/villas/types";

const LISTING_IDS = OCEAN_VILLA_LISTING_IDS;

const LISTING_DISPLAY_NAMES: Record<string, string> = {
  "489095": "The Penthouse Villa", // Villa 318
  "505671": "The View Villa",      // Villa 304
};

// Original per-villa hero override (restored from HEAD) — some listings'
// default Hostaway image (index 0) is not the preferred display photo, so a
// specific gallery index is pinned here instead.
const HERO_IMAGE_OVERRIDES: Record<string, number> = {
  "505671": 1,
};

function getDisplayName(id: string, rawName: string): string {
  if (LISTING_DISPLAY_NAMES[id]) return LISTING_DISPLAY_NAMES[id];
  if (/\b(?:ov|villa|unit)?\s*318\b/i.test(rawName)) return "The Penthouse Villa";
  if (/\b(?:ov|villa|unit)?\s*304\b/i.test(rawName)) return "The View Villa";
  return rawName || `Villa ${id}`;
}

// Restored from HEAD's getPreferredHero(): applies the per-villa override
// index when present, otherwise falls back to heroUrl / images[0]. The only
// intentional change from HEAD is the final fallback: HEAD pointed to
// "/media/rentals/placeholder.jpg", a path that does not exist in
// public/media (confirmed via file listing) and would 404. Returning ""
// instead lets VillaCard render its "Photo coming soon" placeholder rather
// than a broken <img>. This only affects listings with zero images — every
// currently active villa has images, so this path is not otherwise exercised.
function getPreferredHero(id: string, heroUrl: string | undefined, images?: string[]): string {
  const overrideIdx = HERO_IMAGE_OVERRIDES[id];
  if (overrideIdx !== undefined && images && images.length > overrideIdx) {
    return images[overrideIdx];
  }
  return heroUrl || images?.[0] || "";
}

const SITE_URL = "https://oceanvillasturtlebay.com";

const rentalsJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Ocean Villas at Turtle Bay — Vacation Rental Collection",
  description:
    "7 luxury private villa rentals at Turtle Bay on Oahu's North Shore. Book direct with live availability and no platform markups.",
  url: `${SITE_URL}/rentals`,
  numberOfItems: LISTING_IDS.length,
};

function formatISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(dateISO: string, days: number) {
  const d = new Date(dateISO);
  d.setDate(d.getDate() + days);
  return formatISO(d);
}

function RentalsContent() {
  const searchParams = useSearchParams();
  const urlStartDate = searchParams.get("startDate") || "";
  const urlEndDate = searchParams.get("endDate") || "";
  const hasDateSearch = Boolean(urlStartDate && urlEndDate);

  const [listings, setListings] = useState<RentalListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState<VillaFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<VillaSort>("recommended");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const today = formatISO(new Date());
      const pricingWindowEnd = addDays(today, 90);

      const results = await Promise.all(
        LISTING_IDS.map(async (id) => {
          const res = await fetch(`/api/hostaway/listings?id=${encodeURIComponent(id)}`, {
            cache: "no-store",
          });
          const json = await res.json().catch(() => null);
          if (!res.ok || !json?.success || !json?.listing) {
            throw new Error(`Failed to load listing ${id}`);
          }

          const listing = json.listing as RentalListing;
          const detail = getVillaDetail(id);

          // Best-effort pricing enrichment — never blocks the card if it fails.
          let minNightlyPrice: number | undefined;
          let hasPricing = false;
          try {
            const priceRes = await fetch(
              `/api/hostaway/pricing?listingId=${encodeURIComponent(id)}&startDate=${today}&endDate=${pricingWindowEnd}`,
              { cache: "no-store" }
            );
            const priceJson = await priceRes.json().catch(() => null);
            if (priceRes.ok && priceJson?.success && priceJson?.hasPricing && priceJson.minNightlyPrice > 0) {
              minNightlyPrice = priceJson.minNightlyPrice;
              hasPricing = true;
            }
          } catch {
            /* pricing is an enhancement, not a requirement */
          }

          return {
            ...listing,
            ...detail,
            minNightlyPrice,
            hasPricing,
          } satisfies RentalListing;
        })
      );

      // Optional availability enrichment when the guest arrived with real dates.
      if (hasDateSearch) {
        try {
          const searchRes = await fetch(
            `/api/hostaway/search?startDate=${encodeURIComponent(urlStartDate)}&endDate=${encodeURIComponent(urlEndDate)}`,
            { cache: "no-store" }
          );
          const searchJson = await searchRes.json().catch(() => null);
          if (searchRes.ok && searchJson?.success) {
            const availableIds = new Set(
              (searchJson.availableListings || []).map((l: { id: string }) => l.id)
            );
            for (const l of results) {
              l.isAvailable = availableIds.has(l.id);
            }
          }
        } catch {
          /* availability is an enhancement; cards still render without the badge */
        }
      }

      setListings(results);
    } catch {
      setError("Hostaway listings failed to load. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [hasDateSearch, urlStartDate, urlEndDate]);

  useEffect(() => {
    load();
  }, [load]);

  const titleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const l of listings) map.set(l.id, getDisplayName(l.id, l.name || ""));
    return map;
  }, [listings]);

  const heroById = useMemo(() => {
    const map = new Map<string, string>();
    for (const l of listings) map.set(l.id, getPreferredHero(l.id, l.heroUrl, l.images));
    return map;
  }, [listings]);

  const maxBedrooms = useMemo(() => Math.max(1, ...listings.map((l) => l.bedrooms ?? 0)), [listings]);
  const maxGuestsBound = useMemo(() => Math.max(1, ...listings.map((l) => l.maxGuests ?? 0)), [listings]);

  const showOceanViewFilter = useMemo(() => listings.some((l) => l.view), [listings]);
  const showGroundFloorFilter = useMemo(() => listings.some((l) => l.groundFloor !== undefined), [listings]);

  const priceRange = useMemo(() => {
    const priced = listings.filter((l) => l.hasPricing && typeof l.minNightlyPrice === "number");
    if (priced.length === 0) return null;
    const values = priced.map((l) => l.minNightlyPrice as number);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [listings]);
  const showPriceFilter = priceRange !== null;

  const filtered = useMemo(() => filterListings(listings, filters), [listings, filters]);
  const sorted = useMemo(() => sortListings(filtered, sort), [filtered, sort]);

  const compareSelected = useMemo(
    () => compareIds.map((id) => listings.find((l) => l.id === id)).filter((l): l is RentalListing => Boolean(l)),
    [compareIds, listings]
  );

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id);
      if (prev.length >= 4) return prev;
      const next = [...prev, id];
      trackEvent("compare_select", { listing_id: id, count: next.length });
      return next;
    });
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-0">
      <Script
        id="ov-rentals-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(rentalsJsonLd) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
            Back to Ocean Villas
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium text-slate-500">
            <Link href="/location" className="hover:text-slate-900 transition">Location</Link>
            <Link href="/amenities" className="hover:text-slate-900 transition">Amenities</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-slate-100 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">
            The Collection
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-slate-900 max-w-3xl leading-tight">
            Luxury Vacation Rentals at Turtle Bay, North Shore Oahu
          </h1>

          <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-2xl">
            Ocean Villas at Turtle Bay offers premium private villas on Oahu&apos;s North Shore — each managed with a direct booking experience without platform markups.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/availability"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              Check Availability
            </Link>
            <Link
              href="/location"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Explore Location
            </Link>
          </div>
        </div>
      </section>

      {/* Villa cards */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {LISTING_IDS.map((id) => (
                <VillaCardSkeleton key={id} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
              <p className="text-red-700">{error}</p>
              <button
                type="button"
                onClick={load}
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-red-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="hidden md:block" />
                <VillaSortSelect
                  value={sort}
                  onChange={(s) => {
                    setSort(s);
                    trackEvent("sort_change", { sort: s });
                  }}
                />
              </div>

              <VillaFilterBar
                filters={filters}
                onChange={(next) => {
                  setFilters(next);
                  trackEvent("filter_apply", { ...next } as Record<string, string | number | boolean>);
                }}
                onClearAll={() => setFilters(DEFAULT_FILTERS)}
                maxBedrooms={maxBedrooms}
                maxGuests={maxGuestsBound}
                showOceanViewFilter={showOceanViewFilter}
                showGroundFloorFilter={showGroundFloorFilter}
                showPriceFilter={showPriceFilter}
                priceRange={priceRange}
                resultCount={sorted.length}
                totalCount={listings.length}
              />

              {sorted.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                  <h3 className="text-lg font-semibold text-slate-900">No villas match these filters</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Try widening your bedroom, guest, or price criteria.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {sorted.map((listing) => (
                    <VillaCard
                      key={listing.id}
                      listing={listing}
                      title={titleById.get(listing.id) || listing.name}
                      heroUrl={heroById.get(listing.id) || ""}
                      selected={compareIds.includes(listing.id)}
                      compareDisabled={compareIds.length >= 4}
                      onToggleCompare={toggleCompare}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Why book direct */}
      <section className="bg-white border-t border-slate-100 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-serif tracking-tight text-slate-900 mb-10">
            Why book direct with Ocean Villas?
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Live pricing via Hostaway",
                desc: "All rates are sourced directly from Hostaway — the same platform that manages the properties — so you always see accurate, up-to-date pricing without surprises at checkout.",
              },
              {
                title: "No platform markups",
                desc: "Booking direct means you avoid the service fees added by Airbnb, VRBO, and other third-party travel platforms — keeping more value in your pocket.",
              },
              {
                title: "North Shore, Oahu access",
                desc: "Turtle Bay is one of Oahu's most coveted destinations — close to Pipeline, Waimea Bay, Haleiwa, and some of the island's best beaches. Ocean Villas puts you right at the heart of it.",
              },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900">{c.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plan your stay — internal links */}
      <section className="py-16 md:py-20 bg-slate-50 border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Plan Your Stay</div>
          <h2 className="text-3xl font-serif tracking-tight text-slate-900 mb-3">
            Everything you need to know before you book
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-10 max-w-2xl">
            Explore the details that matter — what&apos;s included in each villa, what surrounds Turtle Bay, and how to check availability and book direct.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <Link
              href="/amenities"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_16px_50px_rgba(15,23,42,0.1)]"
            >
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700">Villa Amenities</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                See what&apos;s included — gourmet kitchens, private lanais, and beach gear, plus what Turtle Bay Resort offers separately.
              </p>
              <span className="mt-5 inline-flex text-sm font-semibold text-slate-900">View Amenities</span>
            </Link>

            <Link
              href="/location"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_16px_50px_rgba(15,23,42,0.1)]"
            >
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700">Location &amp; Nearby</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Discover what surrounds Turtle Bay — Pipeline, Waimea Bay, Haleiwa Town, Shark&apos;s Cove, and more.
              </p>
              <span className="mt-5 inline-flex text-sm font-semibold text-slate-900">Explore Location</span>
            </Link>

            <Link
              href="/availability"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_16px_50px_rgba(15,23,42,0.1)]"
            >
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700">Check Availability</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Search live dates across all villas, see open nights, and continue straight into booking — no extra steps.
              </p>
              <span className="mt-5 inline-flex text-sm font-semibold text-slate-900">Search Dates</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-lg font-serif font-bold text-slate-900">Ocean Villas at Turtle Bay</div>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-500">
            <Link href="/amenities" className="hover:text-slate-700 transition">Amenities</Link>
            <Link href="/location" className="hover:text-slate-700 transition">Location</Link>
            <Link href="/about" className="hover:text-slate-700 transition">About</Link>
            <Link href="/contact" className="hover:text-slate-700 transition">Contact</Link>
          </nav>
          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} Ocean Villas at Turtle Bay. All rights reserved.
          </div>
        </div>
      </footer>

      {compareSelected.length > 0 && (
        <CompareBar
          selected={compareSelected}
          onRemove={toggleCompare}
          onClear={() => setCompareIds([])}
          onOpenCompare={() => setCompareOpen(true)}
        />
      )}

      {compareOpen && (
        <CompareModal
          listings={compareSelected}
          onClose={() => setCompareOpen(false)}
          getTitle={(l) => titleById.get(l.id) || l.name}
        />
      )}

      {compareSelected.length === 0 && <MobileStickyBookingBar />}
    </main>
  );
}

export default function RentalsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {LISTING_IDS.map((id) => (
              <VillaCardSkeleton key={id} />
            ))}
          </div>
        </main>
      }
    >
      <RentalsContent />
    </Suspense>
  );
}
