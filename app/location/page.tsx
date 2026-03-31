// app/location/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Location — Turtle Bay, North Shore Oahu | Ocean Villas",
  description:
    "Ocean Villas at Turtle Bay sits on Oahu's legendary North Shore. Discover what makes this destination unique — world-class surf, pristine beaches, and luxury villa living.",
  alternates: { canonical: "/location" },
  robots: { index: true, follow: true },
};

const NEARBY = [
  { name: "Turtle Bay Resort Beach", distance: "2 min walk", desc: "Private resort beach with calm water on one side, surf breaks on the other." },
  { name: "Banzai Pipeline", distance: "12 min drive", desc: "One of the most famous surf breaks on earth. Spectating season runs November–February." },
  { name: "Haleiwa Town", distance: "15 min drive", desc: "Historic surf town with farm-to-table dining, art galleries, shave ice, and boutique shopping." },
  { name: "Waimea Bay", distance: "10 min drive", desc: "Iconic jump-rock beach with big-wave surf in winter and calm snorkeling in summer." },
  { name: "Shark's Cove", distance: "11 min drive", desc: "One of Oahu's best snorkeling spots, perfect for families and underwater photography." },
  { name: "Kahuku Farms", distance: "5 min drive", desc: "Award-winning farm stand serving fresh acai bowls, local produce, and tropical smoothies." },
];

export default function LocationPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
            ← Back to Home
          </Link>
          <span className="text-sm font-medium text-slate-500">Ocean Villas at Turtle Bay</span>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-slate-100 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">
            North Shore · Oahu · Hawaii
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight text-slate-900 max-w-4xl leading-tight">
            Turtle Bay — The Heart of Oahu's North Shore
          </h1>
          <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl">
            Oahu's North Shore is one of the most storied surf destinations in the world. Turtle Bay anchors the northeastern tip of the island — a quieter, wilder, and more premium alternative to Waikiki — with access to legendary breaks, hidden beaches, and an unhurried island pace.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              Check Villa Availability
            </Link>
          </div>
        </div>
      </section>

      {/* Context blocks */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3 mb-16">
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
              What's nearby
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
                body: "Turtle Bay is approximately 35 miles north of HNL via the H-2 and Kamehameha Highway. The drive takes 45–60 minutes depending on traffic and is highly scenic once you pass through the pineapple fields.",
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

      {/* CTA */}
      <section className="bg-slate-900 py-16 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl font-serif font-medium text-white">
            Stay at Turtle Bay with Ocean Villas
          </h2>
          <p className="mt-4 text-slate-300 leading-relaxed">
            Browse available villas and lock in your North Shore stay with direct booking powered by Hostaway.
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
          <div className="text-sm text-slate-500">© {new Date().getFullYear()} Ocean Villas at Turtle Bay. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
