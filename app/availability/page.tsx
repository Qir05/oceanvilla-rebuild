import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";

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

  const baseUrl = await getBaseUrlFromHeaders();
  const apiUrl = `${baseUrl}/api/hostaway/search?startDate=${encodeURIComponent(
    startDate
  )}&endDate=${encodeURIComponent(endDate)}&guests=${encodeURIComponent(guests)}`;

  let data: any = null;
  let error: any = null;
  let status = 200;

  if (!startDate || !endDate) {
    error = { error: "Dates are required to check availability." };
    status = 400;
  } else {
    try {
      const res = await fetch(apiUrl, { cache: "no-store" });
      status = res.status;
      data = await res.json().catch(() => null);
      if (!res.ok) error = data || { error: "Search failed." };
    } catch (e: any) {
      error = { error: e?.message || "Search failed." };
      status = 500;
    }
  }

  const listings = data?.availableListings || [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            ← Back to Home
          </Link>

          <div className="text-sm text-slate-600">
            {startDate && endDate ? (
              <>
                <span className="font-semibold text-slate-900">{startDate}</span>{" "}
                <span className="text-slate-400">→</span>{" "}
                <span className="font-semibold text-slate-900">{endDate}</span>{" "}
                <span className="text-slate-300">•</span>{" "}
                <span>
                  Guests: <span className="font-semibold text-slate-900">{guests}</span>
                </span>
              </>
            ) : null}
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
          <div className="rounded-2xl bg-red-50 border border-red-100 p-6">
            <h3 className="font-bold text-red-800">Couldn’t fetch availability (Error {status})</h3>
            <pre className="mt-4 p-4 bg-white/50 rounded-xl overflow-auto text-xs text-red-900">
              {JSON.stringify(error, null, 2)}
            </pre>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
              >
                Try again
              </Link>
            </div>
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-lg text-slate-500">No available villas found for these dates.</p>
            <Link
              href="/"
              className="mt-4 inline-block px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition"
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
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
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
