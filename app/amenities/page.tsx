// app/amenities/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import MobileStickyBookingBar from "@/components/MobileStickyBookingBar";
import AmenityDisclaimer from "@/components/AmenityDisclaimer";
import {
  AMENITIES_LIVING_COMFORT,
  AMENITIES_OUTDOOR_PROPERTY,
  AMENITIES_BOOKING_AND_SERVICE,
  AMENITIES_RITZ_CARLTON_RESORT,
} from "@/lib/amenities-data";

export const metadata: Metadata = {
  title: {
    absolute: "Villa Amenities — Turtle Bay, North Shore Oahu | Ocean Villas",
  },
  description:
    "See what's included in every Ocean Villas rental: gourmet kitchen, private lanai, beach gear, and more, plus what's available separately through Turtle Bay Resort. Book direct on Oahu's North Shore.",
  alternates: { canonical: "/amenities" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Villa Amenities — Turtle Bay, North Shore Oahu | Ocean Villas",
    description:
      "Every Ocean Villas rental includes a gourmet kitchen, private lanai, and beach gear. Book direct — no platform fees.",
    url: "/amenities",
    siteName: "Ocean Villas at Turtle Bay",
    type: "website",
    images: [
      {
        url: "/brand/TTB-Logo.png",
        width: 1200,
        height: 630,
        alt: "Ocean Villas at Turtle Bay",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Villa Amenities — Turtle Bay, North Shore Oahu | Ocean Villas",
    description:
      "Every Ocean Villas rental includes a gourmet kitchen, private lanai, and beach gear.",
    images: ["/brand/TTB-Logo.png"],
  },
};

const AMENITY_GROUPS = [
  { group: "Living & Comfort", items: AMENITIES_LIVING_COMFORT },
  { group: "Outdoor & Property", items: AMENITIES_OUTDOOR_PROPERTY },
  { group: "Booking & Service", items: AMENITIES_BOOKING_AND_SERVICE },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do Ocean Villas at Turtle Bay have pool access?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Turtle Bay Resort has a pool, but it is managed by the resort, not Ocean Villas, and current access terms for villa guests have not yet been confirmed. Contact our local team before your stay to confirm the latest pool access policy.",
      },
    },
    {
      "@type": "Question",
      name: "What kitchen amenities are included?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every villa comes with a fully equipped gourmet kitchen: cookware, appliances, and everything your group needs to cook meals during your stay.",
      },
    },
    {
      "@type": "Question",
      name: "Is beach gear included with the rental?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Beach chairs, umbrellas, and snorkel sets are provided with every villa so you can head straight to the beach without extra equipment rentals.",
      },
    },
    {
      "@type": "Question",
      name: "Do the villas have ocean views?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "View varies by villa. Check the individual villa page for its specific, confirmed view and layout.",
      },
    },
    {
      "@type": "Question",
      name: "Are there extra fees for villa amenities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Amenities provided by the villa itself are included in the nightly rate, sourced live from Hostaway, with no third-party platform markups added. Amenities provided separately by Turtle Bay Resort may involve a reservation, day pass, or fee — confirm current terms with our local team.",
      },
    },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://oceanvillasturtlebay.com/" },
    { "@type": "ListItem", position: 2, name: "Amenities", item: "https://oceanvillasturtlebay.com/amenities" },
  ],
};

export default function AmenitiesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
            Back to Ocean Villas
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium text-slate-500">
            <Link href="/rentals" className="hover:text-slate-900 transition">Rentals</Link>
            <Link href="/location" className="hover:text-slate-900 transition">Location</Link>
          </nav>
        </div>
      </header>

      <section className="bg-white border-b border-slate-100 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">
            What&apos;s Included
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-slate-900 max-w-3xl leading-tight">
            Luxury Villa Amenities at Turtle Bay, North Shore Oahu
          </h1>
          <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-2xl">
            Every Ocean Villa is set up for a complete North Shore stay: gourmet kitchens, private lanais, and beach gear are included with your villa. Turtle Bay Resort amenities are available separately — see below for what&apos;s confirmed.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/availability"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              Check Availability
            </Link>
            <Link
              href="/rentals"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Browse Villas
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-10">
          <div className="grid gap-8 md:grid-cols-2">
            {AMENITY_GROUPS.map((group) => (
              <div
                key={group.group}
                className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_4px_20px_rgba(15,23,42,0.05)]"
              >
                <h2 className="text-xl font-semibold text-slate-900 mb-5">{group.group}</h2>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li key={item.name} className="flex items-start gap-3 text-sm text-slate-600">
                      <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-slate-900 flex items-center justify-center">
                        <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                          <path d="M6.5 1.5L3 5 1.5 3.5l-1 1L3 7l4.5-4.5z" />
                        </svg>
                      </span>
                      <span>
                        {item.name}
                        {item.note && <span className="block text-xs text-slate-400 mt-0.5">{item.note}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Turtle Bay Resort amenities — clearly separated, never presented as confirmed */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Turtle Bay Resort Amenities</h2>
            <p className="text-sm text-slate-500 mb-5">
              Provided by Turtle Bay Resort, not Ocean Villas at Turtle Bay directly.
            </p>
            <ul className="space-y-4 mb-6">
              {AMENITIES_RITZ_CARLTON_RESORT.map((item) => (
                <li key={item.name} className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-amber-400 flex items-center justify-center">
                    <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                      <path d="M4 0l1 3h3L5.5 5 6.5 8 4 6 1.5 8l1-3L0 3h3z" />
                    </svg>
                  </span>
                  <span>
                    <span className="font-medium text-slate-700">{item.name}</span>
                    {item.note && <span className="block text-xs text-slate-400 mt-0.5">{item.note}</span>}
                  </span>
                </li>
              ))}
            </ul>
            <AmenityDisclaimer />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">FAQ</div>
          <h2 className="text-3xl font-serif tracking-tight text-slate-900 mb-3">
            Common questions about villa amenities
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-10">
            Everything guests typically want to know before arriving at a Turtle Bay villa.
          </p>

          <div className="space-y-4">
            <details className="group rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
                Do Ocean Villas at Turtle Bay have pool access?
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Turtle Bay Resort has a pool, but it is managed by the resort, not Ocean Villas, and current access terms for villa guests have not yet been confirmed. Contact our local team before your stay to confirm the latest policy.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
                What kitchen amenities are included?
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Every villa comes with a fully equipped gourmet kitchen: cookware, appliances, and everything your group needs to cook meals during your stay.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
                Is beach gear included with the rental?
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Yes. Beach chairs, umbrellas, and snorkel sets are provided with every villa so you can head straight to the beach without extra equipment rentals.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
                Do the villas have ocean views?
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                View varies by villa. Check the individual villa page for its specific, confirmed view and layout.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
                Are there extra fees for villa amenities?
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Amenities provided by the villa itself are included in the nightly rate, sourced live from Hostaway, with no third-party platform markups added. Amenities provided separately by Turtle Bay Resort may involve a reservation, day pass, or fee — confirm current terms with our local team.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-16 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl font-serif font-medium text-white">
            Ready to book your North Shore stay?
          </h2>
          <p className="mt-4 text-slate-300 leading-relaxed">
            Browse available villas and check live dates. All bookings are handled directly through Hostaway for secure, transparent pricing, with no platform fees.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/availability"
              className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
            >
              Search Availability
            </Link>
            <Link
              href="/rentals"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              Browse Villas
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-lg font-serif font-bold text-slate-900">Ocean Villas at Turtle Bay</div>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-500">
            <Link href="/rentals" className="hover:text-slate-700 transition">Rentals</Link>
            <Link href="/location" className="hover:text-slate-700 transition">Location</Link>
            <Link href="/about" className="hover:text-slate-700 transition">About</Link>
            <Link href="/contact" className="hover:text-slate-700 transition">Contact</Link>
          </nav>
          <div className="text-sm text-slate-500">© {new Date().getFullYear()} Ocean Villas at Turtle Bay. All rights reserved.</div>
        </div>
      </footer>

      <MobileStickyBookingBar />
    </main>
  );
}
