// app/rentals/page.tsx
//
// Server component: fetches all 7 villas from Hostaway server-side (Tier 1,
// revalidated every 5 minutes) so name, description, bedrooms, bathrooms,
// and guest capacity are present in the initial HTML rather than only
// appearing after a client-side fetch. Live pricing/availability enrichment
// and all filter/sort/compare interactivity live in RentalsClient.tsx.
import type { Metadata } from "next";
import Link from "next/link";
import { OCEAN_VILLA_LISTING_IDS, getVillaDetail } from "@/lib/ocean-villas";
import { fetchHostawayListings } from "@/lib/hostaway-listing";
import { getVillaCompliance } from "@/lib/villaCompliance";
import { getDisplayName } from "@/lib/villa-display";
import type { RentalListing } from "@/components/villas/types";
import RentalsClient from "./RentalsClient";

const SITE_URL = "https://oceanvillasturtlebay.com";
const BRAND_PHONE = "(858) 727-2427";

export const metadata: Metadata = {
  title: {
    absolute: "Luxury Villa Rentals at Turtle Bay, North Shore Oahu | Ocean Villas",
  },
  description:
    "Browse 7 luxury private villas at Turtle Bay, Oahu's North Shore. Compare bedrooms, guest capacity, and amenities, then book direct with live availability — no platform fees.",
  alternates: { canonical: "/rentals" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Luxury Villa Rentals at Turtle Bay, North Shore Oahu | Ocean Villas",
    description:
      "7 curated private villas at Turtle Bay, Oahu's North Shore. Live availability, transparent pricing, book direct.",
    url: "/rentals",
    siteName: "Ocean Villas at Turtle Bay",
    type: "website",
    images: [
      {
        url: "/brand/TTB-Logo.png",
        width: 1200,
        height: 630,
        alt: "Ocean Villas at Turtle Bay — Vacation Rental Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury Villa Rentals at Turtle Bay, North Shore Oahu | Ocean Villas",
    description: "7 curated private villas at Turtle Bay, Oahu's North Shore. Book direct — no platform fees.",
    images: ["/brand/TTB-Logo.png"],
  },
};

export default async function RentalsPage() {
  const { listings: fetched, failedIds } = await fetchHostawayListings(OCEAN_VILLA_LISTING_IDS);

  if (failedIds.length > 0) {
    console.error(
      `[rentals] ${failedIds.length}/${OCEAN_VILLA_LISTING_IDS.length} villa listings failed to load: ${failedIds.join(", ")}`
    );
  }

  const initialListings: RentalListing[] = fetched.map((listing) => ({
    id: listing.id,
    name: listing.name,
    description: listing.description ?? undefined,
    city: listing.city ?? undefined,
    state: listing.state ?? undefined,
    country: listing.country ?? undefined,
    maxGuests: listing.maxGuests ?? undefined,
    bedrooms: listing.bedrooms ?? undefined,
    bathrooms: listing.bathrooms ?? undefined,
    heroUrl: listing.heroUrl ?? undefined,
    images: listing.images,
    amenities: listing.amenities,
    bookingEngineBase: listing.bookingEngineBase,
    ...getVillaDetail(listing.id),
  }));

  const rentalsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ocean Villas at Turtle Bay — Vacation Rental Collection",
    description:
      "7 luxury private villa rentals at Turtle Bay on Oahu's North Shore. Book direct with live availability and no platform markups.",
    url: `${SITE_URL}/rentals`,
    numberOfItems: OCEAN_VILLA_LISTING_IDS.length,
    itemListElement: initialListings.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/listing/${l.id}`,
      name: l.name,
    })),
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-0">
      {/* Plain <script>, not next/script's <Script> — see app/listing/[id]/page.tsx
          for why: Script's default strategy never reaches the initial
          server-rendered HTML. */}
      <script
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

      {initialListings.length === 0 ? (
        // Zero listings loaded is a Hostaway fetch failure, not "no villas
        // match your filters" — that empty state (rendered inside
        // RentalsClient) is a different, guest-caused condition and must not
        // be conflated with a system outage that hides real inventory.
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
              <h2 className="text-2xl font-serif text-red-800">Villa information is temporarily unavailable</h2>
              <p className="mt-4 text-sm text-red-700">
                We&apos;re having trouble loading our villa listings right now. This is a temporary issue on our end
                — please try again in a moment, or call us directly to check availability.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                <a
                  href={`tel:+1${BRAND_PHONE.replace(/[^\d+]/g, "")}`}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  Call Us · {BRAND_PHONE}
                </a>
                <Link
                  href="/rentals"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Retry
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* AEO: question-shaped heading + answer-first paragraph + a real
              HTML table, since structured per-villa facts are extracted far
              more reliably by answer engines from a table than from prose. */}
          <section className="bg-white border-b border-slate-100 py-16 md:py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <h2 className="text-3xl font-serif tracking-tight text-slate-900 mb-4">
                How many guests does each villa at Ocean Villas at Turtle Bay sleep?
              </h2>
              <p className="text-base leading-relaxed text-slate-600 max-w-3xl mb-8">
                Ocean Villas at Turtle Bay operates 7 private villas at Turtle Bay on Oahu&apos;s North Shore, ranging from{" "}
                {Math.min(...initialListings.map((l) => l.maxGuests ?? Infinity).filter(Number.isFinite))} to{" "}
                {Math.max(...initialListings.map((l) => l.maxGuests ?? 0))} guests. Occupancy is set per bedroom under
                Hawaii licensing requirements — bedroom, bathroom, and sleeping-capacity details for every villa are
                listed below and on each villa&apos;s own listing page.
              </p>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                      <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wide text-[11px] text-slate-500">Villa</th>
                      <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wide text-[11px] text-slate-500">Bedrooms</th>
                      <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wide text-[11px] text-slate-500">Bathrooms</th>
                      <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wide text-[11px] text-slate-500">Sleeps</th>
                      <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wide text-[11px] text-slate-500">Bed Configuration</th>
                      <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wide text-[11px] text-slate-500">Notable Feature</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialListings.map((l) => {
                      const compliance = getVillaCompliance(l.id);
                      return (
                        <tr key={l.id} className="border-b border-slate-100 last:border-0">
                          <th scope="row" className="px-4 py-3 text-left font-semibold text-slate-900 whitespace-nowrap">
                            <Link href={`/listing/${l.id}`} className="hover:underline">
                              {getDisplayName(l.id, l.name || "")}
                            </Link>
                          </th>
                          <td className="px-4 py-3 text-slate-700">{l.bedrooms ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-700">{l.bathrooms ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-700">{l.maxGuests ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-700">{compliance?.occupancySummary ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-700">{l.shortFeature ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <RentalsClient initialListings={initialListings} />
        </>
      )}

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
    </main>
  );
}
