"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OCEAN_VILLA_LISTING_IDS, MAX_SITE_GUEST_CAPACITY } from "@/lib/ocean-villas";
import { trackEvent } from "@/lib/analytics";

type HostawayListing = {
  id: string;
  name: string;
  description?: string;
  city?: string;
  state?: string;
  country?: string;
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  heroUrl?: string;
  thumbnailUrl?: string;
  bookingEngineBase?: string;
};

// Shape returned by /api/hostaway/search — a subset of HostawayListing fields
// (that endpoint omits description/country, which the fallback endpoint has).
type HostawaySearchResult = Omit<HostawayListing, "heroUrl" | "thumbnailUrl"> & {
  thumbnailUrl?: string | null;
};

const LISTING_IDS = OCEAN_VILLA_LISTING_IDS;

const LISTING_DISPLAY_NAMES: Record<string, string> = {
  "489095": "The Penthouse Villa", // Villa 318
  "505671": "The View Villa",      // Villa 304
};

function getDisplayName(id: string, rawName: string): string {
  if (LISTING_DISPLAY_NAMES[id]) return LISTING_DISPLAY_NAMES[id];
  if (/\b(?:ov|villa|unit)?\s*318\b/i.test(rawName)) return "The Penthouse Villa";
  if (/\b(?:ov|villa|unit)?\s*304\b/i.test(rawName)) return "The View Villa";
  return rawName || `Villa ${id}`;
}

function formatISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(dateISO: string, days: number) {
  if (!dateISO) return "";
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return formatISO(dt);
}

function isAfter(aISO: string, bISO: string) {
  if (!aISO || !bISO) return false;
  return new Date(aISO).getTime() > new Date(bISO).getTime();
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function AvailabilityCard({
  listing,
  startDate,
  endDate,
  guests,
}: {
  listing: HostawayListing;
  startDate: string;
  endDate: string;
  guests: string;
}) {
  const hero = listing.heroUrl || listing.thumbnailUrl || "/media/rentals/placeholder.jpg";
  const title = getDisplayName(listing.id, listing.name || "");
  const subtitle =
    (listing.description || "").replace(/\s+/g, " ").trim() ||
    (listing.city
      ? `${listing.city}${listing.state ? `, ${listing.state}` : ""}, Turtle Bay, North Shore Oahu`
      : "Turtle Bay · North Shore, Oahu");

  const detailHref = `/listing/${encodeURIComponent(listing.id)}?startDate=${encodeURIComponent(
    startDate
  )}&endDate=${encodeURIComponent(endDate)}&guests=${encodeURIComponent(guests)}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_6px_26px_rgba(15,23,42,0.06)] border border-slate-100 transition-all duration-300 hover:shadow-[0_18px_60px_rgba(15,23,42,0.14)]">
      {/* Fixed aspect-ratio image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 shrink-0">
        <Image
          src={hero}
          alt={`${title} at Turtle Bay`}
          fill
          unoptimized
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold tracking-wide text-slate-800 shadow-sm">
            Villa #{listing.id}
          </span>
        </div>
      </div>

      {/* flex-1 column — spacer pins stats+CTAs to card bottom */}
      <div className="flex flex-col flex-1 p-6">
        <h3 className="text-base font-semibold text-slate-900 line-clamp-2 leading-snug">{title}</h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-3">{subtitle}</p>

        {/* Spacer — aligns stats across cards of equal grid-row height */}
        <div className="flex-1" />

        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
          <Stat label="Sleeps" value={`${listing.maxGuests ?? "—"}`} />
          <Stat label="Beds" value={`${listing.bedrooms ?? "—"}`} />
          <Stat label="Baths" value={`${listing.bathrooms ?? "—"}`} />
        </div>

        <div className="mt-4">
          <Link
            href={detailHref}
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#0f172a] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_3px_12px_rgba(15,23,42,0.18)] hover:-translate-y-px hover:bg-[#1e293b] hover:shadow-[0_6px_18px_rgba(15,23,42,0.24)] active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2 transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            View Villa
          </Link>
        </div>
      </div>
    </article>
  );
}

function AvailabilitySearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const today = useMemo(() => formatISO(new Date()), []);

  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const guestsParam = searchParams.get("guests") || "2";
  const promoParam = searchParams.get("promo") || "";

  const [checkIn, setCheckIn] = useState(startDate);
  const [checkOut, setCheckOut] = useState(endDate);
  const [guests, setGuests] = useState(Number(guestsParam) || 2);
  const [promo, setPromo] = useState(promoParam);

  const [listings, setListings] = useState<HostawayListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fallbackNotice, setFallbackNotice] = useState("");

  useEffect(() => {
    setCheckIn(startDate);
    setCheckOut(endDate);
    setGuests(Number(guestsParam) || 2);
    setPromo(promoParam);
  }, [startDate, endDate, guestsParam, promoParam]);

  useEffect(() => {
    let alive = true;

    async function loadFallback() {
      const results = await Promise.all(
        LISTING_IDS.map(async (id) => {
          const res = await fetch(`/api/hostaway/listings?id=${encodeURIComponent(id)}`, {
            cache: "no-store",
          });
          const json = await res.json().catch(() => null);
          if (!res.ok || !json?.success || !json?.listing) return null;
          return json.listing as HostawayListing;
        })
      );

      return results.filter(Boolean) as HostawayListing[];
    }

    async function load() {
      if (!startDate || !endDate) {
        setListings([]);
        setLoading(false);
        setError("");
        setFallbackNotice("");
        return;
      }

      // Use the URL param directly so the search fires exactly once per URL
      // change and is never double-triggered by local guests state updates.
      // Clamped to the largest resolved villa capacity, not a hardcoded
      // number — a stale "10" here silently dropped the 12-guest combined
      // 489097 unit from any 11-12 guest search.
      const guestsNum = Math.min(Number(guestsParam) || 2, MAX_SITE_GUEST_CAPACITY);

      setLoading(true);
      setError("");
      setFallbackNotice("");

      try {
        const res = await fetch(
          `/api/hostaway/search?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(
            endDate
          )}&guests=${encodeURIComponent(String(guestsNum))}`,
          { cache: "no-store" }
        );

        const json = await res.json().catch(() => null);

        if (res.ok && json?.success && Array.isArray(json?.availableListings)) {
          const normalized = (json.availableListings as HostawaySearchResult[]).map((l) => ({
            id: String(l.id),
            name: l.name,
            city: l.city,
            state: l.state,
            maxGuests: l.maxGuests,
            bedrooms: l.bedrooms,
            bathrooms: l.bathrooms,
            heroUrl: l.thumbnailUrl || null,
            thumbnailUrl: l.thumbnailUrl || null,
            bookingEngineBase: l.bookingEngineBase,
          })) as HostawayListing[];

          if (!alive) return;
          setListings(normalized);
          if (normalized.length === 0) {
            trackEvent("no_availability_result", { check_in: startDate, check_out: endDate, guest_count: guestsNum });
          }
        } else {
          const fallback = await loadFallback();
          if (!alive) return;
          setListings(fallback);
          setFallbackNotice(
            "We couldn’t confirm live availability right now, but you can still browse the villas below and continue to direct booking."
          );
          trackEvent("availability_search_failed", { reason: "api_error", check_in: startDate, check_out: endDate });
        }
      } catch {
        const fallback = await loadFallback();
        if (!alive) return;
        setListings(fallback);
        setFallbackNotice(
          "We couldn’t confirm live availability right now, but you can still browse the villas below and continue to direct booking."
        );
        trackEvent("availability_search_failed", { reason: "exception", check_in: startDate, check_out: endDate });
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
    // Depend only on URL params — not on local `guests` state which syncs
    // from these same params and would cause a redundant second search.
  }, [startDate, endDate, guestsParam]);

  function onSearch() {
    setError("");

    if (!checkIn || !checkOut) return setError("Please choose your check-in and check-out dates.");
    if (isAfter(checkIn, checkOut) || checkIn === checkOut) return setError("Check-out must be after check-in.");
    if (isAfter(today, checkIn)) return setError("Check-in date must be today or later.");
    if (guests < 1) return setError("Guests must be at least 1.");

    trackEvent("availability_search", {
      check_in: checkIn,
      check_out: checkOut,
      guest_count: guests,
      source: "availability_page",
    });
    router.push(
      `/availability?startDate=${encodeURIComponent(checkIn)}&endDate=${encodeURIComponent(
        checkOut
      )}&guests=${encodeURIComponent(String(guests))}${promo.trim() ? `&promo=${encodeURIComponent(promo.trim())}` : ""}`
    );
  }

  return (
    <>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_140px_180px_120px] md:items-end">
          <div>
            <label htmlFor="av-checkin" className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Check-in</label>
            <input
              id="av-checkin"
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => {
                const v = e.target.value;
                setCheckIn(v);
                if (checkOut && (v === checkOut || isAfter(v, checkOut))) {
                  setCheckOut(addDays(v, 2));
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label htmlFor="av-checkout" className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Check-out</label>
            <input
              id="av-checkout"
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label htmlFor="av-guests" className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Guests</label>
            <select
              id="av-guests"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {/* Not villa-scoped yet at this point in the flow, so bounded by
                  the largest resolved capacity across all villas rather than
                  a hardcoded number — otherwise a guest could never even
                  select a party size that the combined 489097 unit sleeps. */}
              {Array.from({ length: MAX_SITE_GUEST_CAPACITY }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} Guests
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="av-promo" className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Promo</label>
            <input
              id="av-promo"
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="Optional"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={onSearch}
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </div>

        {error && <div className="mt-4 text-sm text-red-600 font-medium">{error}</div>}
      </div>

      <div className="mt-12">
        {startDate && endDate ? (
          <div className="mb-8">
            <div className="text-sm text-slate-500">
              Showing results for{" "}
              <span className="font-semibold text-slate-900">{startDate}</span>{" "}–{" "}
              <span className="font-semibold text-slate-900">{endDate}</span>{" "}
              <span className="text-slate-300">•</span>{" "}
              <span className="font-semibold text-slate-900">{Number(guestsParam) || 2} guests</span>
            </div>
          </div>
        ) : null}

        {fallbackNotice ? (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            {fallbackNotice}
          </div>
        ) : null}

        {!startDate || !endDate ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-2xl font-serif text-slate-900">Choose your dates to begin</h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
              Enter your check-in and check-out dates above to browse your Turtle Bay villa options.
            </p>
          </div>
        ) : loading ? (
          <div className="text-center py-20 text-slate-500">Loading villa options...</div>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-2xl font-serif text-slate-900">No villas found</h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
              Try adjusting your dates or guest count and search again.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <AvailabilityCard
                key={listing.id}
                listing={listing}
                startDate={startDate}
                endDate={endDate}
                guests={guestsParam}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function AvailabilitySearch() {
  return (
    <Suspense
      fallback={
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          Loading availability search...
        </div>
      }
    >
      <AvailabilitySearchForm />
    </Suspense>
  );
}
