"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

const LISTING_IDS = ["489089", "489093", "489095", "489097", "489092", "489094"] as const;

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

function clampText(s?: string, max = 110) {
  const clean = (s || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trimEnd() + "…";
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
        {label}
      </div>
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
  const title = listing.name || `Villa ${listing.id}`;
  const subtitle =
    clampText(listing.description, 110) ||
    (listing.city
      ? `${listing.city}${listing.state ? `, ${listing.state}` : ""}`
      : "Turtle Bay · North Shore, Oahu");

  const detailHref = `/listing/${encodeURIComponent(listing.id)}?startDate=${encodeURIComponent(
    startDate
  )}&endDate=${encodeURIComponent(endDate)}&guests=${encodeURIComponent(guests)}`;

  const base = (listing.bookingEngineBase || "https://182003_1.holidayfuture.com").replace(/\/$/, "");
  const bookUrl = `${base}/listings/${encodeURIComponent(listing.id)}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_6px_26px_rgba(15,23,42,0.06)] border border-slate-100 transition-all duration-300 hover:shadow-[0_18px_60px_rgba(15,23,42,0.14)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
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

      <div className="flex flex-col flex-grow p-6">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Sleeps" value={`${listing.maxGuests ?? "-"}`} />
          <Stat label="Beds" value={`${listing.bedrooms ?? "-"}`} />
          <Stat label="Baths" value={`${listing.bathrooms ?? "-"}`} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href={detailHref}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
          >
            View Villa
          </Link>

          <a
            href={bookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            Book Direct
          </a>
        </div>
      </div>
    </article>
  );
}

export default function AvailabilityPage() {
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

      setLoading(true);
      setError("");
      setFallbackNotice("");

      try {
        const res = await fetch(
          `/api/hostaway/search?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(
            endDate
          )}&guests=${encodeURIComponent(String(guests))}`,
          { cache: "no-store" }
        );

        const json = await res.json().catch(() => null);

        if (res.ok && json?.success && Array.isArray(json?.availableListings)) {
          const normalized = json.availableListings.map((l: any) => ({
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
        } else {
          const fallback = await loadFallback();
          if (!alive) return;
          setListings(fallback);
          setFallbackNotice(
            "We couldn’t confirm live availability right now, but you can still browse the villas below and continue to direct booking."
          );
        }
      } catch {
        const fallback = await loadFallback();
        if (!alive) return;
        setListings(fallback);
        setFallbackNotice(
          "We couldn’t confirm live availability right now, but you can still browse the villas below and continue to direct booking."
        );
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [startDate, endDate, guests]);

  function onSearch() {
    setError("");

    if (!checkIn || !checkOut) return setError("Please choose your check-in and check-out dates.");
    if (isAfter(checkIn, checkOut) || checkIn === checkOut) return setError("Check-out must be after check-in.");
    if (isAfter(today, checkIn)) return setError("Check-in date must be today or later.");
    if (guests < 1) return setError("Guests must be at least 1.");

    router.push(
      `/availability?startDate=${encodeURIComponent(checkIn)}&endDate=${encodeURIComponent(
        checkOut
      )}&guests=${encodeURIComponent(String(guests))}${promo.trim() ? `&promo=${encodeURIComponent(promo.trim())}` : ""}`
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            ← Back to Home
          </Link>
          <span className="text-sm font-medium text-slate-500">Ocean Villas at Turtle Bay</span>
        </div>
      </header>

      <section className="bg-white border-b border-slate-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-slate-900">
            Check Availability
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600 leading-relaxed">
            Search your dates below, then browse the villas that best fit your stay at Turtle Bay.
          </p>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_140px_180px_120px] md:items-end">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Check-in</label>
                <input
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
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Check-out</label>
                <input
                  type="date"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {Array.from({ length: 14 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Guests
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Promo</label>
                <input
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
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {startDate && endDate ? (
            <div className="mb-8">
              <div className="text-sm text-slate-500">
                Showing results for{" "}
                <span className="font-semibold text-slate-900">{startDate}</span> →{" "}
                <span className="font-semibold text-slate-900">{endDate}</span>{" "}
                <span className="text-slate-300">•</span>{" "}
                <span className="font-semibold text-slate-900">{guests} guests</span>
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
                  guests={String(guests)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
