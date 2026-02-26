// app/availability/page.tsx
import Link from "next/link";
import { headers } from "next/headers";

type SearchParams = { startDate?: string; endDate?: string; guests?: string };

async function getBaseUrlFromHeaders() {
  const h = await headers(); // <-- FIX: headers() is a Promise in your Next version
  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("x-forwarded-host") || h.get("host");
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const startDate = searchParams.startDate || "";
  const endDate = searchParams.endDate || "";
  const guests = searchParams.guests || "2";

  const baseUrl = await getBaseUrlFromHeaders();

  const apiUrl = `${baseUrl}/api/hostaway/search?startDate=${encodeURIComponent(
    startDate
  )}&endDate=${encodeURIComponent(endDate)}&guests=${encodeURIComponent(guests)}`;

  let data: any = null;
  let error: any = null;
  let status = 200;

  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
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

  const listings = data?.availableListings || [];

  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.5 }}>
        Available Ocean Villas
      </h1>

      <div style={{ marginTop: 10, opacity: 0.85 }}>
        {startDate && endDate ? (
          <>
            <b>{startDate}</b> → <b>{endDate}</b> • Guests: <b>{guests}</b>
          </>
        ) : (
          <span style={{ color: "#b00" }}>
            Add query params:{" "}
            <code>
              ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&guests=2
            </code>
          </span>
        )}
      </div>

      {error ? (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 800 }}>API error ({status}):</div>
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
      ) : (
        <div
          style={{
            marginTop: 22,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {listings.length === 0 ? (
            <div style={{ marginTop: 14 }}>
              No available listings found for this date range.
            </div>
          ) : (
            listings.map((l: any) => {
              const thumb =
                l.thumbnailUrl ||
                l.thumbnailUrlLarge ||
                l.thumb ||
                l.image ||
                l?.listingImages?.[0]?.url ||
                l?.listingImages?.[0]?.largeUrl ||
                "";

              return (
                <div
                  key={l.id}
                  style={{
                    border: "1px solid rgba(0,0,0,0.10)",
                    borderRadius: 16,
                    overflow: "hidden",
                    background: "#fff",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ height: 180, background: "#f4f4f4" }}>
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt={l.name || `Listing ${l.id}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : null}
                  </div>

                  <div style={{ padding: 14 }}>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>
                      {l.name || `Listing ${l.id}`}
                    </div>

                    <div style={{ marginTop: 6, opacity: 0.75, fontSize: 13 }}>
                      {l.city
                        ? `${l.city}${l.state ? `, ${l.state}` : ""}`
                        : `Listing ID: ${l.id}`}
                    </div>

                    <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                      <Link
                        href={`/listing/${l.id}?startDate=${encodeURIComponent(
                          startDate
                        )}&endDate=${encodeURIComponent(
                          endDate
                        )}&guests=${encodeURIComponent(guests)}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "10px 12px",
                          borderRadius: 12,
                          border: "1px solid rgba(0,0,0,0.12)",
                          fontWeight: 700,
                          textDecoration: "none",
                          color: "#111",
                          background: "#fff",
                        }}
                      >
                        View details
                      </Link>

                      {l.bookingEngineUrl ? (
                        <a
                          href={buildBookingUrl(
                            l.bookingEngineUrl,
                            startDate,
                            endDate,
                            guests
                          )}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "10px 12px",
                            borderRadius: 12,
                            fontWeight: 800,
                            textDecoration: "none",
                            color: "#fff",
                            background: "#111",
                          }}
                        >
                          Book now
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
