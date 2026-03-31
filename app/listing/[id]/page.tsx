// app/listing/[id]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import type { Metadata } from "next";

type SearchParams = {
  startDate?: string;
  endDate?: string;
  guests?: string;
};

async function getBaseUrlFromHeaders() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("x-forwarded-host") || h.get("host");
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

export async function generateMetadata({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}): Promise<Metadata> {
  const p = await Promise.resolve(params);
  return {
    title: `Villa ${p.id} | Ocean Villas at Turtle Bay`,
    description: `View details, availability, and direct booking for Ocean Villa ${p.id} at Turtle Bay on Oahu's North Shore.`,
    robots: { index: true, follow: true },
  };
}

export default async function ListingDetailsPage({
  params,
  searchParams,
}: {
  params: { id: string } | Promise<{ id: string }>;
  searchParams: SearchParams | Promise<SearchParams>;
}) {
  const p = await Promise.resolve(params);
  const sp = await Promise.resolve(searchParams);
  const id = p?.id;
  const startDate = sp?.startDate || "";
  const endDate = sp?.endDate || "";
  const guests = sp?.guests || "2";

  if (!id) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">No listing ID provided.</p>
          <Link href="/" className="mt-4 inline-block text-sm font-semibold text-slate-900 underline">
            Return Home
          </Link>
        </div>
      </main>
    );
  }

  const baseUrl = await getBaseUrlFromHeaders();
  // FIXED: was /api/hostaway/listings/${id} (path param) — correct route uses ?id= query param
  const apiUrl = `${baseUrl}/api/hostaway/listings?id=${encodeURIComponent(id)}`;
  const res = await fetch(apiUrl, { cache: "no-store" });
  const data = await res.json().catch(() => null);
  const listing = data?.listing;

  if (!listing) {
    return (
      <main className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex h-20 max-w-7xl items-center px-6 lg:px-8">
            <Link href="/rentals" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
              ← Back to Rentals
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-3xl font-serif text-slate-900">Villa not found</h1>
          <p className="mt-4 text-slate-500">This villa could not be loaded. It may have been removed or the ID is incorrect.</p>
          <Link
            href="/rentals"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            Browse All Villas
          </Link>
        </div>
      </main>
    );
  }

  const bookingEngineBase = String(listing.bookingEngineBase || "https://182003_1.holidayfuture.com").replace(/\/$/, "");
  const bookingUrl = buildBookingUrl(bookingEngineBase, id, startDate, endDate, guests);

  // Build back-link: only include date params if they are valid
  const hasValidDates = startDate && endDate && startDate !== endDate;
  const backHref = hasValidDates
    ? `/availability?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&guests=${encodeURIComponent(guests)}`
    : "/rentals";
  const backLabel = hasValidDates ? "← Back to availability results" : "← Back to rentals";

  const hero = listing.heroUrl || "/media/rentals/placeholder.jpg";
  const location = [listing.city, listing.state].filter(Boolean).join(", ") || "Turtle Bay, HI";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href={backHref} className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
            {backLabel}
          </Link>
          <span className="hidden md:block text-sm font-medium text-slate-400">
            Ocean Villas at Turtle Bay
          </span>
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-6 lg:px-8 py-12">
        {/* Hero image */}
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 shadow-[0_8px_40px_rgba(15,23,42,0.1)] mb-10">
          <Image
            src={hero}
            alt={`${listing.name} at Turtle Bay`}
            fill
            unoptimized={true}
            className="object-cover"
            priority
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
              Ocean Villas · Turtle Bay
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight text-slate-900 leading-tight">
              {listing.name}
            </h1>
            <p className="mt-2 text-sm text-slate-500">{location}</p>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { label: "Sleeps", value: listing.maxGuests ?? "–" },
                { label: "Bedrooms", value: listing.bedrooms ?? "–" },
                { label: "Bathrooms", value: listing.bathrooms ?? "–" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white border border-slate-100 px-4 py-4 text-center shadow-sm">
                  <div className="text-2xl font-serif font-semibold text-slate-900">{String(s.value)}</div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            {listing.description ? (
              <div className="mt-10">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">About this villa</h2>
                <p className="text-sm leading-8 text-slate-600 whitespace-pre-line">
                  {listing.description.slice(0, 800)}{listing.description.length > 800 ? "…" : ""}
                </p>
              </div>
            ) : null}

            {/* Context */}
            <div className="mt-10 rounded-2xl bg-white border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Turtle Bay, Oahu's North Shore</h2>
              <p className="text-sm leading-7 text-slate-600">
                Turtle Bay is one of Oahu's most iconic destinations, offering world-class surf breaks, secluded beaches, and the relaxed luxury of the North Shore lifestyle. Ocean Villas places you in the heart of it all — minutes from historic Haleiwa, the legendary Banzai Pipeline, and pristine snorkeling coves.
              </p>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_40px_rgba(15,23,42,0.07)]">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                Direct Booking
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{listing.name}</h3>
              {hasValidDates && (
                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-600">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Check-in</span>
                    <span className="font-semibold text-slate-900">{startDate}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Check-out</span>
                    <span className="font-semibold text-slate-900">{endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Guests</span>
                    <span className="font-semibold text-slate-900">{guests}</span>
                  </div>
                </div>
              )}
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex w-full items-center justify-center rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white hover:bg-slate-800 transition"
              >
                {hasValidDates ? "Continue to Booking" : "Check Availability & Book"}
              </a>
              <p className="mt-3 text-center text-xs text-slate-400">
                Powered by Hostaway · Secure checkout
              </p>
              {!hasValidDates && (
                <Link
                  href="/#availability"
                  className="mt-4 flex w-full items-center justify-center rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Search dates first
                </Link>
              )}
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}

function buildBookingUrl(
  base: string,
  listingId: string,
  startDate: string,
  endDate: string,
  guests: string
) {
  try {
    const u = new URL(base.startsWith("http") ? base : `https://${base}`);
    u.pathname = `/property/${listingId}`;
    if (startDate) u.searchParams.set("startDate", startDate);
    if (endDate) u.searchParams.set("endDate", endDate);
    if (guests) u.searchParams.set("adults", guests);
    return u.toString();
  } catch {
    return `${base}/property/${listingId}`;
  }
}
