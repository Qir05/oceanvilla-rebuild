// app/about/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Ocean Villas at Turtle Bay",
  description:
    "Learn about Ocean Villas at Turtle Bay — a collection of luxury vacation rentals on Oahu's North Shore managed with direct booking through Hostaway.",
  alternates: { canonical: "/about" },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
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

      <section className="bg-white border-b border-slate-100 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">
            About
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-slate-900 leading-tight">
            Ocean Villas at Turtle Bay
          </h1>
          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            Ocean Villas at Turtle Bay is a curated collection of luxury vacation rental properties on Oahu's North Shore. We offer direct booking with live availability managed through Hostaway, giving guests a cleaner, more transparent path to a premium Hawaii vacation.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 space-y-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">The Property Collection</h2>
            <p className="text-sm leading-8 text-slate-600">
              Our six villas are positioned within the Turtle Bay area on Oahu's North Shore — one of Hawaii's most desirable and unspoiled destinations. Each property is fully managed with professional housekeeping, secure keyless entry, and access to resort amenities. Availability, pricing, and booking are powered by Hostaway to ensure accuracy and reliability.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Why Direct Booking</h2>
            <p className="text-sm leading-8 text-slate-600">
              We built this site to give guests a better alternative to third-party travel platforms. When you book direct through oceanvillasturtlebay.com, you see real pricing sourced from Hostaway — without the platform markups and service fees that inflate costs on aggregator sites. It's a simpler, more honest booking experience.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">The North Shore</h2>
            <p className="text-sm leading-8 text-slate-600">
              Turtle Bay is located on the northeastern tip of Oahu — quieter than Waikiki, wilder than Ko Olina, and home to the island's most iconic surf coastline. The 7-Mile Miracle runs from Sunset Beach to Haleiwa and hosts world-renowned competitions each winter. In summer, the same coastline transforms into calm, crystal-clear water perfect for snorkeling and exploration. Ocean Villas puts you at the center of it.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-16 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl font-serif font-medium text-white">Plan your North Shore stay</h2>
          <p className="mt-4 text-slate-300">Browse villas and check live availability with direct booking.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/" className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition">
              Search Availability
            </Link>
            <Link href="/rentals" className="inline-flex items-center justify-center rounded-xl border border-white/30 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10 transition">
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
