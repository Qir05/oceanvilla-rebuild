// app/listing/[id]/page.tsx
import Link from "next/link";
import { headers } from "next/headers";

type SearchParams = { startDate?: string; endDate?: string; guests?: string };

async function getBaseUrlFromHeaders() {
  const h = await headers(); // <-- FIX
  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("x-forwarded-host") || h.get("host");
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

export default async function ListingDetailsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: SearchParams;
}) {
  const id = params.id;

  const startDate = searchParams.startDate || "";
  const endDate = searchParams.endDate || "";
  const guests = searchParams.guests || "2";

  const baseUrl = await getBaseUrlFromHeaders();

  // If you already have an endpoint for listing details, use it here.
  // Otherwise we can call the same search endpoint and find the listing by id.
  const searchApiUrl = `${baseUrl}/api/hostaway/search?startDate=${encodeURIComponent(
    startDate
  )}&endDate=${encodeURIComponent(endDate)}&guests=${encodeURIComponent(guests)}`;

  let data: any = null;
  let error: any = null;
  let status = 200;

  try {
    const res = await fetch(searchApiUrl, { cache: "no-store" });
    status = res.status;

    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      error = {
        error: `API returned non-JSON (status ${status})`,
        body: text.slice(0, 300),
      };
    }

    if (!res.ok && !error) error = data;
  } catch (e: any) {
    error = { error: e?.message || "Fetch failed" };
  }

  // Find listing by id from availableListings (or you can expand later to fetch full listing data)
  const listing =
    data?.availableListings?.find((l: any) => String(l?.id) === String(id)) ||
    null;

  // Booking link passthrough (if hostaway listing includes bookingEngineUrl)
  const bookingUrl = listing?.bookingEngineUrl
    ? buildBookingUrl(listing.bookingEngineUrl, startDate, endDate, guests)
    : null;

  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 14 }}>
        <Link
          href={`/availability?startDate=${encodeURIComponent(
            startDate
          )}&endDate=${encodeURIComponent(endDate)}&guests=${encodeURIComponent(
            guests
          )}`}
          style={{ textDecoration: "none", fontWeight: 700 }}
        >
          ← Back to availability
        </Link>
      </div>

      <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: -0.5 }}>
        {listing?.name || `Listing ${id}`}
      </h1>

      <div style={{ marginTop: 10, opacity: 0.85 }}>
        {startDate && endDate ? (
          <>
            <b>{startDate}</b> → <b>{endDate}</b> • Guests: <b>{guests}</b>
          </>
        ) : (
          <span style={{ color: "#b00" }}>
            Missing dates. Add:
            <code>
              ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&guests=2
            </code>
          </span>
        )}
      </div>

      {error ? (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 900 }}>API error ({status}):</div>
          <pre
            style={{
              marginTop: 10,
              padding: 14,
              background: "#111",
              color: "#fff",
              borderRadius: 12,
              overflow: "auto",
              fontSize: 12,
              lineHeight: 1.4,
            }}
          >
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      ) : !listing ? (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 900 }}>Listing not found in results.</div>
          <div style={{ marginTop: 6, opacity: 0.8 }}>
            (For now, this page looks for the listing inside{" "}
            <code>availableListings</code>. If you want full details for any
            listing even when unavailable, we’ll add a dedicated endpoint next.)
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 18 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 18,
              alignItems: "start",
            }}
          >
            <div
              style={{
                border: "1px solid rgba(0,0,0,0.10)",
                borderRadius: 16,
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ height: 280, background: "#f4f4f4" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {listing?.thumbnailUrl ? (
                  <img
                    src={listing.thumbnailUrl}
                    alt={listing.name || `Listing ${id}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : null}
              </div>

              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 900 }}>
                  {listing?.city
                    ? `${listing.city}${listing.state ? `, ${listing.state}` : ""}`
                    : "Location"}
                </div>

                <div style={{ marginTop: 10, opacity: 0.8, fontSize: 13 }}>
                  Listing ID: <b>{listing.id}</b>
                </div>

                <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                  {bookingUrl ? (
                    <a
                      href={bookingUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "12px 14px",
                        borderRadius: 12,
                        fontWeight: 900,
                        textDecoration: "none",
                        color: "#fff",
                        background: "#111",
                      }}
                    >
                      Book now
                    </a>
                  ) : (
                    <div style={{ opacity: 0.7 }}>
                      Booking link not available yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                border: "1px solid rgba(0,0,0,0.10)",
                borderRadius: 16,
                padding: 16,
                background: "#fff",
                boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900 }}>Details</div>

              <div style={{ marginTop: 10, opacity: 0.9, lineHeight: 1.5 }}>
                {listing?.description ? (
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {String(listing.description).slice(0, 1200)}
                    {String(listing.description).length > 1200 ? "..." : ""}
                  </div>
                ) : (
                  <div style={{ opacity: 0.7 }}>
                    No description returned yet (we can expand the API response
                    later).
                  </div>
                )}
              </div>

              <div style={{ marginTop: 14, opacity: 0.8, fontSize: 13 }}>
                This page is temporary (MVP). Next step is to create a dedicated
                API route: <code>/api/hostaway/listing?id=...</code> so we can
                show full info even if unavailable.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildBookingUrl(
  base: string,
  startDate: string,
  endDate: string,
  guests: string
) {
  if (!base) return "#";
  try {
    const u = new URL(base);
    if (startDate) u.searchParams.set("startDate", startDate);
    if (endDate) u.searchParams.set("endDate", endDate);
    if (guests) {
      u.searchParams.set("guests", guests);
      u.searchParams.set("adults", guests);
    }
    return u.toString();
  } catch {
    return base;
  }
}
