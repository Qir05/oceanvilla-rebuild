// app/amenities/page.tsx  ← correct spelling
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Villa Amenities | Ocean Villas at Turtle Bay",
  description:
    "Explore the amenities at Ocean Villas at Turtle Bay — luxury finishes, ocean views, resort access, private pools, and everything needed for a premium North Shore Oahu vacation.",
  alternates: { canonical: "/amenities" },
  robots: { index: true, follow: true },
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

export default function AmenitiesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
            Back to Home
          </Link>
          <span className="text-sm font-medium text-slate-500">Ocean Villas at Turtle Bay</span>
        </div>
      </header>

      <section className="bg-white border-b border-slate-100 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">
            What's Included
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-slate-900 max-w-3xl leading-tight">
            Villa Amenities at Turtle Bay
          </h1>
          <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-2xl">
            Every Ocean Villa is set up for a full luxury North Shore stay. From fully-equipped kitchens to resort beach access, the details are taken care of so you can focus on Oahu.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              Check Availability
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

      <section className="bg-white border-t border-slate-100 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-serif font-medium text-slate-900">
            Ready to book your North Shore stay?
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Browse available villas and check live dates. All bookings are handled directly through Hostaway for secure, transparent pricing.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-8 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              Search Availability
            </Link>
            <Link
              href="/rentals"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Browse Villas
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-lg font-serif font-bold text-slate-900">Ocean Villas at Turtle Bay</div>
          <div className="text-sm text-slate-500">© {new Date().getFullYear()} Ocean Villas at Turtle Bay. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
