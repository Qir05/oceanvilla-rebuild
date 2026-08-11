// app/amenities/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import MobileStickyBookingBar from "@/components/MobileStickyBookingBar";
import AmenityDisclaimer from "@/components/AmenityDisclaimer";
import {
  AMENITIES_RELAX_COMFORT,
  AMENITIES_COOK_GATHER,
  AMENITIES_BEACH_DAYS,
  AMENITIES_ISLAND_LIVING,
  AMENITIES_BOOKING_AND_SERVICE,
  AMENITIES_RITZ_CARLTON_RESORT,
} from "@/lib/amenities-data";

export const metadata: Metadata = {
  title: {
    absolute: "Villa Amenities — Luxury Beachfront Rentals, Turtle Bay Oahu | Ocean Villas",
  },
  description:
    "Explore villa amenities at Ocean Villas: gourmet kitchens, private lanais, and beach gear at our family-friendly beachfront North Shore Oahu vacation rentals — plus what's available through Turtle Bay Resort. Book direct.",
  alternates: { canonical: "/amenities" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Villa Amenities — Luxury Beachfront Rentals, Turtle Bay Oahu | Ocean Villas",
    description:
      "Family-friendly luxury villa amenities at Turtle Bay: gourmet kitchens, private lanais, and beach gear. Book direct — no platform fees.",
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
    title: "Villa Amenities — Luxury Beachfront Rentals, Turtle Bay Oahu | Ocean Villas",
    description:
      "Family-friendly luxury villa amenities at Turtle Bay: gourmet kitchens, private lanais, and beach gear.",
    images: ["/brand/TTB-Logo.png"],
  },
};

const AMENITY_EXPERIENCE_GROUPS = [
  {
    group: "Relax in Luxury",
    narrative:
      "Enjoy spacious living areas and modern comforts designed to help you unwind after a day exploring Oahu’s North Shore.",
    items: AMENITIES_RELAX_COMFORT,
  },
  {
    group: "Cook, Gather & Celebrate",
    narrative:
      "Whether preparing breakfast before a beach day or gathering for dinner after sunset, the villas provide the space and kitchen conveniences needed to enjoy meals together.",
    items: AMENITIES_COOK_GATHER,
  },
  {
    group: "Beach Days Made Easy",
    eyebrow: "Pack Less. Experience More.",
    narrative:
      "Selected beach essentials are provided so guests can spend more time enjoying the North Shore and less time arranging equipment after arrival.",
    items: AMENITIES_BEACH_DAYS,
  },
  {
    group: "Indoor Comfort Meets Island Living",
    narrative:
      "Enjoy the relaxed rhythm of island living with comfortable indoor spaces and outdoor areas designed for slow mornings, shared meals, and peaceful evenings.",
    items: AMENITIES_ISLAND_LIVING,
  },
  {
    group: "Booking & Service",
    narrative:
      "The details that make booking direct simple: transparent live pricing and local support from search through check-out.",
    items: AMENITIES_BOOKING_AND_SERVICE,
  },
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

      {/* HERO */}
      <section className="bg-white border-b border-slate-100 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">
            What&apos;s Included
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-slate-900 max-w-3xl leading-tight">
            Luxury Villa Amenities at Turtle Bay, North Shore Oahu
          </h1>
          <h2 className="mt-6 text-2xl md:text-3xl font-serif tracking-tight text-slate-900">
            Everything You Need for an Exceptional Stay
          </h2>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-2xl">
            Every Ocean Villa is thoughtfully appointed with premium amenities designed to make your North Shore vacation as relaxing as it is unforgettable. From fully equipped kitchens and spacious living areas to private outdoor spaces and everyday conveniences, each villa is prepared so guests can spend less time planning and more time enjoying Oahu.
          </p>
          <p className="mt-3 text-sm text-slate-400 max-w-2xl">
            Exact features and layouts vary by villa — see each villa&apos;s listing page for confirmed details.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/rentals"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              Explore Our Luxury Villas
            </Link>
            <Link
              href="/availability"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Check Availability
            </Link>
          </div>
        </div>
      </section>

      {/* AMENITY EXPERIENCE GROUPS */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {AMENITY_EXPERIENCE_GROUPS.map((group) => (
              <div
                key={group.group}
                className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_4px_20px_rgba(15,23,42,0.05)]"
              >
                {group.eyebrow && (
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                    {group.eyebrow}
                  </div>
                )}
                <h3 className="text-xl font-semibold text-slate-900">{group.group}</h3>
                <p className="mt-2 mb-5 text-sm leading-6 text-slate-600">{group.narrative}</p>
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
        </div>
      </section>

      {/* FAMILIES & GROUPS */}
      <section className="bg-white border-t border-slate-100 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">For Every Group</div>
          <h2 className="text-3xl font-serif tracking-tight text-slate-900 mb-4">
            Designed for Families & Groups
          </h2>
          <p className="text-base leading-relaxed text-slate-600">
            From spacious living areas and multiple bedrooms to kitchens and everyday conveniences, Ocean Villas gives families and friends room to relax, reconnect, and enjoy more time together.
          </p>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Bedroom counts and layouts vary by villa — browse the{" "}
            <Link href="/rentals" className="font-semibold text-slate-900 hover:underline">
              full villa collection
            </Link>{" "}
            to find the space that fits your group.
          </p>
        </div>
      </section>

      {/* TURTLE BAY RESORT EXPERIENCES */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
            <h2 className="text-2xl font-serif tracking-tight text-slate-900 mb-3">
              Enhance Your Stay with Nearby Resort Experiences
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 mb-2 max-w-2xl">
              As an Ocean Villas guest, you&apos;re located near many of Turtle Bay Resort&apos;s dining, golf, spa, and recreational experiences.
            </p>
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

      {/* WHY GUESTS LOVE OUR AMENITIES */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-3xl font-serif tracking-tight text-slate-900 mb-4">
            Why Guests Love Staying at Ocean Villas
          </h2>
          <p className="text-base leading-relaxed text-slate-600">
            It&apos;s the small conveniences that can make a vacation feel effortless. From comfortable gathering spaces and well-equipped kitchens to outdoor areas and beach-day essentials where available, the villas are designed to help guests relax and enjoy more time together.
          </p>
        </div>
      </section>

      {/* LIFESTYLE CLOSING */}
      <section className="py-12 md:py-16 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-2xl px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-serif tracking-tight text-slate-900 mb-3">
            More Than Just a Place to Stay
          </h2>
          <p className="text-base leading-relaxed text-slate-600">
            Every detail is designed to help guests enjoy more of Oahu&apos;s North Shore — whether relaxing on the lanai, preparing meals together, heading out for a beach day, or returning to a comfortable villa after exploring the island.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
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
              href="/rentals"
              className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
            >
              Explore Our Luxury Villas
            </Link>
            <Link
              href="/availability"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              Check Availability
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
