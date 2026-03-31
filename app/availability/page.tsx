// app/availability/page.tsx
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check Availability | Ocean Villas at Turtle Bay",
  description:
    "Search live availability for luxury vacation rentals at Turtle Bay on Oahu's North Shore. View open dates, compare villas, and book direct.",
  alternates: { canonical: "/availability" },
  robots: { index: true, follow: true },
};

type SP = { startDate?: string; endDate?: string; guests?: string; promo?: string };

async function getBaseUrlFromHeaders() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("x-forwarded-host") || h.get("host");
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: SP | Promise<SP>;
}) {
  const sp = await Promise.resolve(searchParams);
  const startDate = sp.startDate || "";
  const endDate = sp.endDate || "";
  const guests = sp.guests || "2";
  const hasValidDates =
    startDate.length === 10 &&
    endDate.length === 10 &&
    /^\d{4}-\d{2}-\d{2}$/.test(startDate) &&
    /^\d{4}-\d{2}-\d{2}$/.test(endDate) &&
    new Date(endDate).getTime() > new Date(startDate).getTime();

  // No-dates state: render a useful landing page instead of an error
  if (!hasValidDates) {
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
        <section className="mx-auto max-w-3xl px-6 py-24 text-center">
          <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-6">
            Live Availability Search
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-slate-900 leading-tight">
            Find Your Turtle Bay Villa
          </h1>
          <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-xl mx-auto">
            Enter your travel dates below to search live availability across all Ocean Villas at Turtle Bay. All pricing and booking is powered by Hostaway.
          </p>
          <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_8px_40px_rgba(15,23,42,0.07)] text-left">
            {/* Client-side search form rendered via a small island */}
            <NoDatesForm />
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { label: "Villas Available", value: "6" },
              { label: "Location", value: "Turtle Bay, Oahu" },
              { label: "Booking", value: "100% Direct" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white border border-slate-100 px-6 py-5 shadow-sm">
                <div className="text-2xl font-serif font-semibold text-slate-900">{s.value}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  // Has valid dates: fetch and show results
  const baseUrl = await getBaseUrlFromHeaders();
  const apiUrl = `${baseUrl}/api/hostaway/search?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&guests=${encodeURIComponent(guests)}`;

  let data: any = null;
  let error: any = null;
  let status = 200;

  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    status = res.status;
    data = await res.json().catch(() => null);
    if (!res.ok) error = data || { error: "Search failed." };
  } catch (e: any) {
    error = { error: e?.message || "Search failed." };
    status = 500;
  }

  const listings = data?.availableListings || [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
            ← Back to Home
          </Link>
          <div className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{startDate}</span>{" "}
            <span className="text-slate-400">→</span>{" "}
            <span className="font-semibold text-slate-900">{endDate}</span>{" "}
            <span className="text-slate-300 mx-1">•</span>
            Guests: <span className="font-semibold text-slate-900">{guests}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-10">
        <div className="mb-10">
          <h1 className="text-4xl font-serif font-medium tracking-tight text-slate-900">
            Available Ocean Villas
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Select a villa below to continue to secure checkout.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl bg-red-50 border border-red-100 p-8">
            <h3 className="font-bold text-red-800 text-lg">Availability search failed</h3>
            <p className="mt-2 text-sm text-red-700">
              We couldn't retrieve availability right now. Please try again or return to the homepage.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/"
                className="inline-flex px-5 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition text-sm"
              >
                Back to Home
              </Link>
              <Link
                href="/availability"
                className="inline-flex px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition text-sm"
              >
                New Search
              </Link>
            </div>
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-lg text-slate-500 font-medium">No villas available for these dates.</p>
            <p className="mt-2 text-sm text-slate-400">
              Try adjusting your dates or guest count.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
            >
              Change Dates
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((l: any) => {
              const base = String(l.bookingEngineBase || "https://182003_1.holidayfuture.com").replace(/\/$/, "");
              const bookUrl = `${base}/listings/${encodeURIComponent(l.id)}`;
              const hero = l.thumbnailUrl || "/media/rentals/placeholder.jpg";
              return (
                <a
                  key={l.id}
                  href={bookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_6px_26px_rgba(15,23,42,0.06)] border border-slate-100 transition-all duration-300 hover:shadow-[0_18px_60px_rgba(15,23,42,0.14)] hover:-translate-y-1.5"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <Image
                      src={hero}
                      alt={l.name || `Listing ${l.id}`}
                      fill
                      unoptimized={true}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 z-10">
                      <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold tracking-wide text-slate-800 shadow-sm">
                        Available
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col flex-grow p-6">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">
                        {l.name || `Listing ${l.id}`}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {l.city ? `${l.city}${l.state ? `, ${l.state}` : ""}` : "Turtle Bay"}
                      </p>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
                      {[
                        { label: "Sleeps", value: l.maxGuests ?? "–" },
                        { label: "Beds", value: l.bedrooms ?? "–" },
                        { label: "Baths", value: l.bathrooms ?? "–" },
                      ].map((s) => (
                        <div key={s.label} className="rounded-lg bg-slate-50 border border-slate-100 py-2">
                          <div className="font-semibold text-slate-900">{String(s.value)}</div>
                          <div className="text-slate-400">{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5">
                      <span className="flex w-full items-center justify-center rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition group-hover:bg-slate-800">
                        View & Book
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

// Small inline client component for the no-dates search form
// (avoids making the whole page client-side)
function NoDatesForm() {
  // This is a server component — we render a plain HTML form that GET-submits to /availability
  // This works without JS and is SEO-safe
  return (
    <form method="GET" action="/availability">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
            Check-in
          </label>
          <input
            type="date"
            name="startDate"
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
            Check-out
          </label>
          <input
            type="date"
            name="endDate"
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
            Guests
          </label>
          <select
            name="guests"
            defaultValue="2"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            {Array.from({ length: 14 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} Guest{i > 0 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
            Promo Code
          </label>
          <input
            type="text"
            name="promo"
            placeholder="Optional"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
      >
        Search Availability
      </button>
    </form>
  );
}
