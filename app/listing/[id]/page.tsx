import Link from "next/link";
import { headers } from "next/headers";

type SearchParams = { startDate?: string; endDate?: string; guests?: string };

async function getBaseUrl() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("x-forwarded-host") || h.get("host");
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

function buildBookingUrl(base: string, startDate: string, endDate: string, guests: string) {
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

  const baseUrl = await getBaseUrl();

  // ✅ NEW endpoint that matches /api/hostaway/listing/:id
  const detailsUrl = `${baseUrl}/api/hostaway/listing/${encodeURIComponent(id)}`;

  let data: any = null;
  let error: any = null;
  let status = 200;

  try {
    const res = await fetch(detailsUrl, { cache: "no-store" });
    status = res.status;

    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      error = { error: "API returned non-JSON", status, body: text.slice(0, 300) };
    }

    if (!res.ok && !error) error = data;
  } catch (e: any) {
    error = { error: e?.message || "Fetch failed" };
  }

  const listing = data?.listing || null;

  const bookingUrl = listing?.bookingEngineUrl
    ? buildBookingUrl(listing.bookingEngineUrl, startDate, endDate, guests)
    : null;

  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 14 }}>
        <Link
          href={`/availability?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(
            endDate
          )}&guests=${encodeURIComponent(guests)}`}
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
          <span style={{ color: "#b00", fontWeight: 700 }}>
            Missing dates (booking still works but dates won’t prefill).
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
          <div style={{ fontWeight: 900 }}>Listing not found.</div>
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
              <div style={{ height: 300, background: "#f4f4f4" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {listing?.heroUrl ? (
                  <img
                    src={listing.heroUrl}
                    alt={listing.name || `Listing ${id}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
                  ID: <b>{listing.id}</b>
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
                      Booking link not available yet (bookingEngineUrl missing).
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
                    {String(listing.description).slice(0, 1400)}
                    {String(listing.description).length > 1400 ? "..." : ""}
                  </div>
                ) : (
                  <div style={{ opacity: 0.7 }}>No description returned yet.</div>
                )}
              </div>

              <div style={{ marginTop: 14, display: "grid", gap: 6, fontSize: 13, opacity: 0.85 }}>
                <div>Max guests: <b>{listing?.maxGuests ?? "—"}</b></div>
                <div>Bedrooms: <b>{listing?.bedrooms ?? "—"}</b></div>
                <div>Bathrooms: <b>{listing?.bathrooms ?? "—"}</b></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
