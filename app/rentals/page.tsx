"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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
  images?: string[];
  bookingEngineBase?: string;
};

const LISTING_IDS = ["489089", "489092", "489093", "489094", "489095", "489097", "505671"] as const;

const LISTING_DISPLAY_NAMES: Record<string, string> = {
  "505671": "The Penthouse Villa",
};

const HERO_IMAGE_OVERRIDES: Record<string, number> = {
  "505671": 1,
};

function getDisplayName(id: string, rawName: string): string {
  if (LISTING_DISPLAY_NAMES[id]) return LISTING_DISPLAY_NAMES[id];
  if (/unit\s*304\b/i.test(rawName)) return "The Penthouse Villa";
  return rawName || `Villa ${id}`;
}

function getPreferredHero(id: string, heroUrl: string | undefined, images?: string[]): string {
  const overrideIdx = HERO_IMAGE_OVERRIDES[id];
  if (overrideIdx !== undefined && images && images.length > overrideIdx) {
    return images[overrideIdx];
  }
  return heroUrl || "/media/rentals/placeholder.jpg";
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

function VillaCard({ listing }: { listing: HostawayListing }) {
  const title = getDisplayName(listing.id, listing.name || "");
  const subtitle =
    (listing.description || "").replace(/\s+/g, " ").trim() ||
    (listing.city
      ? `${listing.city}${listing.state ? `, ${listing.state}` : ""} — Turtle Bay, North Shore Oahu`
      : "Turtle Bay · North Shore, Oahu");

  const hero = getPreferredHero(listing.id, listing.heroUrl, listing.images);

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

      {/* flex-1 column — spacer keeps stats+CTAs pinned to card bottom */}
      <div className="flex flex-col flex-1 p-6">
        <h3 className="text-base font-semibold text-slate-900 line-clamp-2 leading-snug">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-3">
          {subtitle}
        </p>

        {/* Spacer — fills remaining space so stats align across cards */}
        <div className="flex-1" />

        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
          <Stat label="Sleeps" value={`${listing.maxGuests ?? "—"}`} />
          <Stat label="Beds" value={`${listing.bedrooms ?? "—"}`} />
          <Stat label="Baths" value={`${listing.bathrooms ?? "—"}`} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            href={`/listing/${encodeURIComponent(listing.id)}`}
            className="inline-flex items-center justify-center rounded-xl bg-[#0f172a] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_3px_12px_rgba(15,23,42,0.18)] hover:-translate-y-px hover:bg-[#1e293b] hover:shadow-[0_6px_18px_rgba(15,23,42,0.24)] active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2 transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            View Villa
          </Link>
          <Link
            href="/#availability"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-px active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            Check Dates
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function RentalsPage() {
  const [listings, setListings] = useState<HostawayListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const results = await Promise.all(
          LISTING_IDS.map(async (id) => {
            const res = await fetch(`/api/hostaway/listings?id=${encodeURIComponent(id)}`, {
              cache: "no-store",
            });

            const json = await res.json().catch(() => null);

            if (!res.ok || !json?.success || !json?.listing) {
              throw new Error(`Failed to load listing ${id}`);
            }

            return json.listing as HostawayListing;
          })
        );

        if (!alive) return;
        setListings(results);
      } catch (e) {
        if (!alive) return;
        setError("Hostaway listings failed to load. Please check API/ENV and try again.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            Back to Home
          </Link>
          <span className="text-sm font-medium text-slate-500">
            Ocean Villas at Turtle Bay
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-slate-100 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">
            The Collection
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-slate-900 max-w-3xl leading-tight">
            Luxury Vacation Rentals on Oahu's North Shore
          </h1>

          <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-2xl">
            Ocean Villas at Turtle Bay offers premium private villa rentals on Oahu&apos;s
            North Shore — each managed through Hostaway for live availability, accurate pricing,
            and a direct booking experience without platform markups.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/#availability"
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
            <div className="text-center py-20 text-slate-500">Loading featured villas...</div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-red-700">
              {error}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <VillaCard key={listing.id} listing={listing} />
              ))}
            </div>
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
                desc: "All rates are sourced directly from Hostaway — the same platform that manages the properties — so you always see accurate, up-to-date pricing.",
              },
              {
                title: "No platform markups",
                desc: "Booking direct means you avoid the service fees added by third-party travel platforms, keeping more value in your pocket.",
              },
              {
                title: "North Shore, Oahu access",
                desc: "Turtle Bay is one of Oahu's most coveted destinations. Ocean Villas puts you in the heart of the North Shore experience.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <h3 className="text-lg font-semibold text-slate-900">{c.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-lg font-serif font-bold text-slate-900">
            Ocean Villas at Turtle Bay
          </div>
          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} Ocean Villas at Turtle Bay. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
