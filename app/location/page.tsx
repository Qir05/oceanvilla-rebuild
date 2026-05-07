// app/location/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Turtle Bay, Oahu — North Shore Location Guide | Ocean Villas",
  },
  description:
    "Near Pipeline, Waimea Bay & Haleiwa — Ocean Villas at Turtle Bay sits on Oahu's North Shore, 35 min from HNL. Explore beaches, surf spots, and local dining.",
  alternates: { canonical: "/location" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Turtle Bay, Oahu — North Shore Location Guide | Ocean Villas",
    description:
      "Turtle Bay sits on Oahu's North Shore, 35 miles from Honolulu. Walk to the beach, drive to Pipeline, Waimea Bay & Haleiwa. Stay at Ocean Villas and book direct.",
    type: "website",
  },
};

const NEARBY = [
  { name: "Turtle Bay Resort Beach", distance: "2 min walk", desc: "Private resort beach with calm water on one side, surf breaks on the other — steps from the villas." },
  { name: "Kokololio Beach Park", distance: "10 min drive", desc: "A quieter North Shore beach in Hauula with soft sand, grassy picnic areas, and an easy, family-friendly local feel — one of the more relaxed and less-crowded stretches on this side of the island." },
  { name: "Banzai Pipeline", distance: "12 min drive", desc: "One of the most famous surf breaks on earth. Winter swells reach 20+ feet. Spectating season runs November–February — a bucket-list experience even for non-surfers." },
  { name: "Waimea Bay", distance: "10 min drive", desc: "Iconic jump-rock beach with big-wave surf in winter and calm, crystal-clear water for snorkeling and swimming in summer." },
  { name: "Shark's Cove", distance: "11 min drive", desc: "One of Oahu's best snorkeling spots, with shallow tide pools and rich marine life — ideal for families and underwater photography." },
  { name: "Haleiwa Town", distance: "15 min drive", desc: "Historic surf town with farm-to-table dining, art galleries, Matsumoto's shave ice, and boutique shopping along the main strip." },
  { name: "Kahuku Farms", distance: "5 min drive", desc: "Award-winning farm stand serving fresh acai bowls, local produce, and tropical smoothies — a North Shore morning ritual." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How far is Turtle Bay from Honolulu International Airport?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Turtle Bay is approximately 35 miles north of Honolulu International Airport (HNL) via the H-2 freeway and Kamehameha Highway. The drive takes 45–60 minutes depending on traffic and is highly scenic through the North Shore pineapple fields.",
      },
    },
    {
      "@type": "Question",
      name: "What surf beaches are near Turtle Bay on Oahu's North Shore?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Banzai Pipeline is 12 minutes away, Waimea Bay is 10 minutes, Shark's Cove is 11 minutes, and Haleiwa Town is 15 minutes. Turtle Bay Resort beach is a 2-minute walk from Ocean Villas.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need a rental car to stay at Turtle Bay?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, a rental car is strongly recommended for a North Shore stay. Public transit exists but is limited. Having a vehicle lets you move freely between beaches, surf spots, restaurants, and the full stretch of the North Shore.",
      },
    },
    {
      "@type": "Question",
      name: "What is the best time of year to visit Turtle Bay?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Turtle Bay is great year-round. Winter (November–February) brings large swells and the famous Triple Crown of Surfing — ideal for spectators. Summer offers flat, clear water perfect for snorkeling, paddleboarding, and diving. Both seasons deliver warm weather and the North Shore's signature golden light.",
      },
    },
    {
      "@type": "Question",
      name: "How is Turtle Bay different from Waikiki?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Turtle Bay is on Oahu's North Shore — far less crowded, more local, and more scenic than Waikiki. There are no high-rise hotels, no tourist-trap strips, and far more open beach. It's the side of Oahu that regular Hawaii visitors return to every year.",
      },
    },
  ],
};

const placeJsonLd = {
  "@context": "https://schema.org",
  "@type": "TouristDestination",
  name: "Turtle Bay, North Shore Oahu",
  description:
    "Turtle Bay sits at the northeastern tip of Oahu, Hawaii — a premier North Shore destination known for world-class surf, luxury villa stays, and an unhurried island pace far from the crowds of Waikiki.",
  geo: {
    "@type": "GeoCoordinates",
    latitude: 21.6977,
    longitude: -157.9952,
  },
  touristType: ["Surfers", "Beach lovers", "Luxury travelers", "Families"],
  includesAttraction: [
    { "@type": "TouristAttraction", name: "Banzai Pipeline" },
    { "@type": "TouristAttraction", name: "Waimea Bay" },
    { "@type": "TouristAttraction", name: "Shark's Cove" },
    { "@type": "TouristAttraction", name: "Haleiwa Town" },
    { "@type": "TouristAttraction", name: "Kahuku Farms" },
  ],
};

export default function LocationPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }}
      />

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
            ← Back to Ocean Villas
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium text-slate-500">
            <Link href="/rentals" className="hover:text-slate-900 transition">Rentals</Link>
            <Link href="/amenities" className="hover:text-slate-900 transition">Amenities</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-slate-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">
            North Shore · Oahu · Hawaii
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight text-slate-900 max-w-4xl leading-tight">
            Turtle Bay — The Heart of Oahu&apos;s North Shore
          </h1>
          <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl">
            Oahu&apos;s North Shore is one of the most storied surf destinations in the world. Turtle Bay anchors the northeastern tip of the island — quieter, wilder, and more authentic than Waikiki — with access to legendary breaks, hidden beaches, and an unhurried island pace just 35 miles from Honolulu.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              Check Villa Availability
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

      {/* Context blocks */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3 mb-10">
            {[
              {
                title: "World-Class Surf",
                body: "The 7-Mile Miracle — the stretch of coastline from Sunset Beach to Haleiwa — hosts more elite surf contests than anywhere on the planet. Even if you're not surfing, watching a 20-foot Pipe set is a bucket-list experience.",
              },
              {
                title: "Secluded Luxury",
                body: "Turtle Bay is one of Oahu's least crowded resort destinations. Ocean Villas puts guests in private villa accommodations — far from the bustle of Waikiki, with all the North Shore lifestyle within reach.",
              },
              {
                title: "Year-Round Appeal",
                body: "Winter brings big swell and the famous Triple Crown of Surfing. Summer offers flat, clear water perfect for snorkeling, paddleboarding, and diving. Both seasons deliver the North Shore's signature golden light and open skies.",
              },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">{c.title}</h2>
                <p className="text-sm leading-7 text-slate-600">{c.body}</p>
              </div>
            ))}
          </div>

          {/* Nearby */}
          <div>
            <h2 className="text-3xl font-serif tracking-tight text-slate-900 mb-8">
              What&apos;s nearby
            </h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {NEARBY.map((place) => (
                <div key={place.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900">{place.name}</h3>
                    <span className="text-xs font-medium text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1">
                      {place.distance}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{place.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Getting here */}
      <section className="bg-white border-t border-slate-100 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-serif tracking-tight text-slate-900 mb-8">Getting to Turtle Bay</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: "From Honolulu International Airport (HNL)",
                body: "Turtle Bay is approximately 35 miles north of HNL via the H-2 freeway and Kamehameha Highway. The drive takes 45–60 minutes and becomes highly scenic once you pass through the pineapple fields heading north.",
              },
              {
                title: "Car rental recommended",
                body: "A rental car is strongly recommended for a North Shore stay. Public transit exists but is limited. Having a vehicle lets you move freely between beaches, restaurants, and surf spots across the full North Shore stretch.",
              },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl bg-slate-50 border border-slate-100 p-6">
                <h3 className="font-semibold text-slate-900 mb-3">{c.title}</h3>
                <p className="text-sm leading-7 text-slate-600">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-slate-50 border-t border-slate-100">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">FAQ</div>
          <h2 className="text-3xl font-serif tracking-tight text-slate-900 mb-3">
            Common questions about Turtle Bay&apos;s location
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-10">
            Everything guests typically ask before planning a North Shore Oahu stay.
          </p>

          <div className="space-y-4">
            <details className="group rounded-2xl border border-slate-200 bg-white p-5">
              <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
                How far is Turtle Bay from Honolulu International Airport?
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Approximately 35 miles north of HNL — about a 45–60 minute drive via H-2 and Kamehameha Highway. The drive becomes scenic through the pineapple fields heading north.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-200 bg-white p-5">
              <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
                What surf beaches are near Turtle Bay?
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Banzai Pipeline is 12 minutes away, Waimea Bay 10 minutes, Shark&apos;s Cove 11 minutes, and Haleiwa Town 15 minutes. Turtle Bay Resort beach is a 2-minute walk from the villas.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-200 bg-white p-5">
              <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
                Do I need a rental car for Turtle Bay?
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Yes, a rental car is strongly recommended. Public transit is limited on the North Shore. Having a car lets you explore Pipeline, Haleiwa Town, and beaches across the full North Shore stretch freely.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-200 bg-white p-5">
              <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
                What is the best time of year to visit Turtle Bay?
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Turtle Bay is excellent year-round. Winter (November–February) brings large swells and the Triple Crown of Surfing. Summer offers flat, clear water ideal for snorkeling and paddleboarding. Both seasons have warm weather and the North Shore&apos;s signature golden light.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-200 bg-white p-5">
              <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
                How is Turtle Bay different from Waikiki?
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Turtle Bay is far less crowded, more local, and more scenic. No high-rise hotels, no tourist strips — just open beach, world-class surf nearby, and a genuine North Shore atmosphere. It&apos;s the side of Oahu that repeat visitors return to every year.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 py-16 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl font-serif font-medium text-white">
            Stay at Turtle Bay with Ocean Villas
          </h2>
          <p className="mt-4 text-slate-300 leading-relaxed">
            Browse available villas and lock in your North Shore stay with direct booking powered by Hostaway — no platform fees.
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
            <Link href="/amenities" className="hover:text-slate-700 transition">Amenities</Link>
            <Link href="/" className="hover:text-slate-700 transition">Book Direct</Link>
          </nav>
          <div className="text-sm text-slate-500">© {new Date().getFullYear()} Ocean Villas at Turtle Bay. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
