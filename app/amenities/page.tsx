// app/amenities/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Villa Amenities — Turtle Bay, North Shore Oahu | Ocean Villas",
  },
  description:
    "See what's included in every Ocean Villas rental: gourmet kitchen, resort pool access, private lanai, ocean views, beach gear, and more. Book direct on Oahu's North Shore.",
  alternates: { canonical: "/amenities" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Villa Amenities — Turtle Bay, North Shore Oahu | Ocean Villas",
    description:
      "Every Ocean Villas rental includes gourmet kitchen, resort pool, private lanai, ocean views, and beach gear. Book direct — no platform fees.",
    type: "website",
  },
};

const AMENITY_GROUPS = [
  {
    group: "Living & Comfort",
    items: [
      "Fully equipped gourmet kitchen",
      "High-speed WiFi throughout",
      "Central air conditioning",
      "Premium bed linens and towels",
      "Smart TV with streaming services",
      "Washer and dryer in unit",
    ],
  },
  {
    group: "Outdoor & Recreation",
    items: [
      "Private lanai or terrace",
      "Ocean or garden views",
      "Resort pool access",
      "BBQ grill",
      "Beach gear (chairs, umbrellas, snorkel sets)",
      "Surf storage and rinse station",
    ],
  },
  {
    group: "Property & Access",
    items: [
      "Secure keyless entry",
      "Dedicated parking space",
      "Resort concierge access",
      "Walkable to Turtle Bay beach",
      "Close to North Shore dining and surf breaks",
      "Pet policy varies by villa — check listing",
    ],
  },
  {
    group: "Booking & Service",
    items: [
      "Direct booking via Hostaway (no platform markups)",
      "Live availability and pricing",
      "Flexible check-in / check-out",
      "Professional housekeeping",
      "24/7 owner support contact",
      "Secure Hostaway checkout",
    ],
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do Ocean Villas at Turtle Bay have a pool?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. All Ocean Villas guests receive resort pool access as part of their stay, in addition to a short walk to Turtle Bay Resort beach.",
      },
    },
    {
      "@type": "Question",
      name: "What kitchen amenities are included in the villas?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every villa comes with a fully equipped gourmet kitchen — including cookware, appliances, and everything needed to prepare meals for your group. No need to eat out every night.",
      },
    },
    {
      "@type": "Question",
      name: "Is beach gear included with the rental?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Beach chairs, umbrellas, and snorkel sets are included with every villa rental so you can head straight to the beach without extra equipment rentals.",
      },
    },
    {
      "@type": "Question",
      name: "Do the villas have ocean views?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most villas feature ocean or garden views from a private lanai or terrace. Individual listing pages show the specific view and layout for each villa.",
      },
    },
    {
      "@type": "Question",
      name: "Is WiFi included at Ocean Villas?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. High-speed WiFi is included throughout all villas at no extra charge.",
      },
    },
    {
      "@type": "Question",
      name: "Are there extra fees for amenities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No hidden amenity fees. All listed amenities are included in the nightly rate. Rates are pulled live from Hostaway so what you see is what you pay — with no third-party platform markups on top.",
      },
    },
  ],
};

export default function AmenitiesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
            ← Back to Ocean Villas
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
            Every Ocean Villa is set up for a complete North Shore stay. Gourmet kitchens, resort pool access, private lanais, beach gear, and ocean views — the details are handled so you can focus on Oahu.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/"
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
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {AMENITY_GROUPS.map((group) => (
              <div
                key={group.group}
                className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_4px_20px_rgba(15,23,42,0.05)]"
              >
                <h2 className="text-xl font-semibold text-slate-900 mb-5">{group.group}</h2>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                      <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-slate-900 flex items-center justify-center">
                        <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                          <path d="M6.5 1.5L3 5 1.5 3.5l-1 1L3 7l4.5-4.5z" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
                Do Ocean Villas at Turtle Bay have a pool?
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Yes. All guests receive resort pool access as part of their stay, and Turtle Bay Resort beach is a short walk from the villas.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
                What kitchen amenities are included?
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Every villa comes with a fully equipped gourmet kitchen — cookware, appliances, and everything your group needs to cook meals during your stay.
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
                Most villas feature ocean or garden views from a private lanai or terrace. Check the individual listing page for the specific view and layout for each villa.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
                Are there extra fees for amenities?
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                No hidden amenity fees. All listed amenities are included in the nightly rate, sourced live from Hostaway. No third-party platform markups are added on top.
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
            Browse available villas and check live dates. All bookings are handled directly through Hostaway for secure, transparent pricing — no platform fees.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/"
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
          <nav className="flex items-center gap-5 text-sm text-slate-500">
            <Link href="/rentals" className="hover:text-slate-700 transition">Rentals</Link>
            <Link href="/location" className="hover:text-slate-700 transition">Location</Link>
            <Link href="/" className="hover:text-slate-700 transition">Book Direct</Link>
          </nav>
          <div className="text-sm text-slate-500">© {new Date().getFullYear()} Ocean Villas at Turtle Bay. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
