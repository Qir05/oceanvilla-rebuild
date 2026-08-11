"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import MobileStickyBookingBar from "@/components/MobileStickyBookingBar";
import VillaCard from "@/components/villas/VillaCard";
import VillaFilterBar from "@/components/villas/VillaFilterBar";
import VillaSortSelect from "@/components/villas/VillaSortSelect";
import CompareBar from "@/components/villas/CompareBar";
import CompareModal from "@/components/villas/CompareModal";
import { getDisplayName, getPreferredHero } from "@/lib/villa-display";
import {
  DEFAULT_FILTERS,
  filterListings,
  sortListings,
  type RentalListing,
  type VillaFilters,
  type VillaSort,
} from "@/components/villas/types";

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

// Progressive enhancement on top of server-fetched initial data: live
// nightly pricing (rolling 90-day window) and, when the guest arrived with
// real dates, per-listing availability. Both are inherently time-sensitive
// and can't be baked into the server-rendered HTML the way name/description/
// bedrooms/bathrooms/maxGuests already are.
function useEnrichedListings(initialListings: RentalListing[]) {
  const searchParams = useSearchParams();
  const urlStartDate = searchParams.get("startDate") || "";
  const urlEndDate = searchParams.get("endDate") || "";
  const hasDateSearch = Boolean(urlStartDate && urlEndDate);

  const [listings, setListings] = useState<RentalListing[]>(initialListings);

  useEffect(() => {
    let alive = true;

    async function enrich() {
      const today = formatISO(new Date());
      const pricingWindowEnd = addDays(today, 90);

      const priced = await Promise.all(
        initialListings.map(async (listing) => {
          try {
            const priceRes = await fetch(
              `/api/hostaway/pricing?listingId=${encodeURIComponent(listing.id)}&startDate=${today}&endDate=${pricingWindowEnd}`,
              { cache: "no-store" }
            );
            const priceJson = await priceRes.json().catch(() => null);
            if (priceRes.ok && priceJson?.success && priceJson?.hasPricing && priceJson.minNightlyPrice > 0) {
              return { ...listing, minNightlyPrice: priceJson.minNightlyPrice, hasPricing: true };
            }
          } catch {
            /* pricing is an enhancement, not a requirement */
          }
          return listing;
        })
      );

      if (!alive) return;

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
            for (const l of priced) {
              l.isAvailable = availableIds.has(l.id);
            }
          }
        } catch {
          /* availability is an enhancement; cards still render without the badge */
        }
      }

      if (alive) setListings(priced);
    }

    enrich();
    return () => {
      alive = false;
    };
  }, [initialListings, hasDateSearch, urlStartDate, urlEndDate]);

  return listings;
}

function RentalsContent({ initialListings }: { initialListings: RentalListing[] }) {
  const listings = useEnrichedListings(initialListings);

  const [filters, setFilters] = useState<VillaFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<VillaSort>("recommended");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

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

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id);
      if (prev.length >= 4) return prev;
      const next = [...prev, id];
      trackEvent("compare_select", { listing_id: id, count: next.length });
      return next;
    });
  }, []);

  return (
    <>
      {/* Villa cards */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
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
        </div>
      </section>

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
    </>
  );
}

function VillaGridFallback({ count }: { count: number }) {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-[420px] rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    </section>
  );
}

export default function RentalsClient({ initialListings }: { initialListings: RentalListing[] }) {
  return (
    <Suspense fallback={<VillaGridFallback count={initialListings.length} />}>
      <RentalsContent initialListings={initialListings} />
    </Suspense>
  );
}
