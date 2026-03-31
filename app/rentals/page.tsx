// app/rentals/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vacation Rentals | Ocean Villas at Turtle Bay",
  description:
    "Browse luxury vacation rentals at Turtle Bay on Oahu's North Shore. All six Ocean Villas offer direct booking with live availability through Hostaway.",
  alternates: { canonical: "/rentals" },
  robots: { index: true, follow: true },
};

const LISTING_IDS = ["489089", "489093", "489095", "489097", "489092", "489094"] as const;

export default function RentalsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
            ← Back to Home
          </Link>
          <span className="text-sm font-medium text-slate-500">Ocean Villas at Turtle Bay</span>
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
            Ocean Villas at Turtle Bay offers six premium vacation rental villas on Oahu's North Shore. Each property is managed through Hostaway, ensuring live availability, accurate pricing, and a smooth direct booking experience.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/"
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {LISTING_IDS.map((id) => (
              <VillaCard key={id} id={id} />
            ))}
          </div>
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
          <div className="text-lg font-serif font-bold text-slate-900">Ocean Villas at Turtle Bay</div>
          <div className="text-sm text-slate-500">© {new Date().getFullYear()} Ocean Villas at Turtle Bay. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}

function VillaCard({ id }: { id: string }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_6px_26px_rgba(15,23,42,0.06)] border border-slate-100 transition-all duration-300 hover:shadow-[0_18px_60px_rgba(15,23,42,0.14)] hover:-translate-y-1">
      {/* Placeholder image area while listings load client-side on homepage */}
      <div className="relative aspect-[4/3] bg-slate-100 flex items-center justify-center">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Villa #{id}
        </span>
      </div>
      <div className="flex flex-col flex-grow p-6">
        <h3 className="text-lg font-semibold text-slate-900">Ocean Villa {id}</h3>
        <p className="mt-2 text-sm text-slate-500">
          Turtle Bay · North Shore, Oahu
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href={`/listing/${encodeURIComponent(id)}`}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
          >
            View Villa
          </Link>
          <Link
            href={`/?villa=${id}#availability`}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            Check Dates
          </Link>
        </div>
      </div>
    </div>
  );
}
