import Link from "next/link";
import { headers } from "next/headers";

type SearchParams = { startDate?: string; endDate?: string; guests?: string };

async function getBaseUrl() {
  const h = await headers();
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

  // If missing dates, do NOT call API (para dili sige 400)
  const hasDates = Boolean(startDate && endDate);

  let data: any = null;
  let error: any = null;
  let status = 200;

  if (hasDates) {
    const baseUrl = await getBaseUrl();
    const apiUrl = `${baseUrl}/api/hostaway/search?startDate=${encodeURIComponent(
      startDate
    )}&endDate=${encodeURIComponent(endDate)}&guests=${encodeURIComponent(
      guests
    )}`;

    try {
      const res = await fetch(apiUrl, { cache: "no-store" });
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
  }

  const listings = data?.availableListings || [];

  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: -0.5 }}>
        Available Ocean Villas
      </h1>

      <div style={{ marginTop: 8, opacity: 0.85 }}>
        {hasDates ? (
          <>
            <b>{startDate}</b> → <b>{endDate}</b> • Guests: <b>{guests}</b>
          </>
        ) : (
          <span style={{ color: "#b00", fontWeight: 700 }}>
            Add query params:{" "}
            <code>?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&guests=2</code>
          </span>
        )}
      </div>

      {hasDates && error ? (
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
      ) : null}

      {hasDates ? (
        <div style={{ marginTop: 22, display: "grid", gap: 16 }}>
          {listings.length === 0 ? (
            <div style={{ opacity: 0.85 }}>
              No available listings found for this date range.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              {listings.map((l: any) => (
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
                  <div style={{ height: 220, background: "#f4f4f4" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {l.thumbnailUrl ? (
                      <img
                        src={l.thumbnailUrl}
                        alt={l.name || `Listing ${l.id}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : null}
                  </div>

                  <div style={{ padding: 14 }}>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>
                      {l.name || `Listing ${l.id}`}
                    </div>

                    <div style={{ marginTop: 6, opacity: 0.8, fontSize: 13 }}>
                      ID: <b>{l.id}</b>
                      {l.city ? (
                        <>
                          {" "}• {l.city}
                          {l.state ? `, ${l.state}` : ""}
                        </>
                      ) : null}
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <Link
                        href={`/listing/${l.id}?startDate=${encodeURIComponent(
                          startDate
                        )}&endDate=${encodeURIComponent(
                          endDate
                        )}&guests=${encodeURIComponent(guests)}`}
                        style={{ fontWeight: 900, textDecoration: "none" }}
                      >
                        View details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
