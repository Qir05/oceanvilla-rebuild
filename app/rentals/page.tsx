// app/rentals/page.tsx
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Vacation Rentals | Ocean Villas at Turtle Bay",
  description:
    "Browse luxury vacation rentals at Turtle Bay on Oahu's North Shore. All six Ocean Villas offer direct booking with live availability through Hostaway.",
  alternates: { canonical: "/rentals" },
  robots: { index: true, follow: true },
};

type FeaturedListing = {
  id: string;
  name: string;
  tagline?: string;
  sleeps?: number;
  beds?: number;
  baths?: number;
  highlight?: string;
  image?: string | null;
};

async function getBaseUrlFromHeaders() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("x-forwarded-host") || h.get("host");
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

async function getFeaturedListings(): Promise<FeaturedListing[]> {
  try {
    const baseUrl = await getBaseUrlFromHeaders();
    const res = await fetch(`${baseUrl}/api/hostaway/featured`, {
      cache: "no-store",
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success || !Array.isArray(json?.featured)) {
      return [];
    }

    return json.featured as FeaturedListing[];
  } catch {
    return [];
  }
}

export default async function RentalsPage() {
  const listings = await getFeaturedListings();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            ← Back to Home
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
            Luxury Vacation Rentals at Turtle Bay, Oahu
          </h1>

          <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-2xl">
            Ocean Villas at Turtle Bay offers six premium vacation rental villas on Oahu&apos;s
            North Shore. Each property is managed through Hostaway, ensuring live
            availability, accurate pricing, and a smooth direct booking experience.
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
          {listings.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <h2 className="text-2xl font-serif text-slate-900">
                Rentals are temporarily unavailable
              </h2>
              <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
                We couldn&apos;t load the live villa collection right now. Please try again
                shortly, or return to the homepage to search availability directly.
              </p>
              <div className="mt-6">
                <Link
                  href="/#availability"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
                >
                  Return to Availability Search
                </Link>
              </div>
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

function VillaCard({ listing }: { listing: FeaturedListing }) {
  const imageSrc = listing.image || "/media/rentals/placeholder.jpg";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_6px_26px_rgba(15,23,42,0.06)] border border-slate-100 transition-all duration-300 hover:shadow-[0_18px_60px_rgba(15,23,42,0.14)] hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={imageSrc}
          alt={listing.name || `Ocean Villa ${listing.id}`}
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
        <h3 className="text-lg font-semibold text-slate-900">
          {listing.name || `Ocean Villa ${listing.id}`}
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          {listing.tagline || "Turtle Bay · North Shore, Oahu"}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Sleeps" value={`${listing.sleeps ?? 0}`} />
          <Stat label="Beds" value={`${listing.beds ?? 0}`} />
          <Stat label="Baths" value={`${listing.baths ?? 0}`} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href={`/listing/${encodeURIComponent(listing.id)}`}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
          >
            View Villa
          </Link>

          <Link
            href="/#availability"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            Check Dates
          </Link>
        </div>
      </div>
    </div>
  );
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
