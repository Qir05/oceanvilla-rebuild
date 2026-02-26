import Link from "next/link";
import { headers } from "next/headers";

type SP = { startDate?: string; endDate?: string; guests?: string };

async function getBaseUrlFromHeaders() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("x-forwarded-host") || h.get("host");
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

export default async function AvailabilityPage({
  searchParams,
}: {
  // Next can pass this as a Promise in newer versions
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
    error = { error: "Required: startDate, endDate" };
    status = 400;
  } else {
    try {
      const res = await fetch(apiUrl, { cache: "no-store" });
      status = res.status;

      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        error = {
          error: "API returned non-JSON",
          status,
          body: text.slice(0, 300),
        };
      }

      if (!res.ok && !error) error = data;
    } catch (e: any) {
      error = { error: e?.message || "Fetch failed" };
    }
  }

  const listings = data?.availableListings || [];

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, fontWeight: 900 }}>Available Ocean Villas</h1>

      <p style={{ marginTop: 8, opacity: 0.85 }}>
        {startDate && endDate ? (
          <>
            <b>{startDate}</b> → <b>{endDate}</b> • Guests: <b>{guests}</b>
          </>
        ) : (
          <span style={{ color: "#b00", fontWeight: 700 }}>
            Add query params: <code>?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&guests=2</code>
          </span>
        )}
      </p>

      {error ? (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 900 }}>API error ({status}):</div>
          <pre
            style={{
              marginTop: 8,
              padding: 12,
              background: "#111",
              color: "#fff",
              borderRadius: 12,
              overflow: "auto",
              fontSize: 12,
            }}
          >
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      ) : (
        <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
          {listings.length === 0 ? (
            <div>No available listings found for this date range.</div>
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
                    border: "1px solid rgba(0,0,0,0.12)",
                    borderRadius: 16,
                    overflow: "hidden",
                    background: "#fff",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ height: 200, background: "#f3f3f3" }}>
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
                    <div style={{ fontSize: 16, fontWeight: 900 }}>
                      {l.name || `Listing ${l.id}`}
                    </div>

                    <div style={{ marginTop: 6, opacity: 0.75, fontSize: 13 }}>
                      {l.city ? `${l.city}${l.state ? `, ${l.state}` : ""}` : "Location"} • ID:{" "}
                      <b>{l.id}</b>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <Link
                        href={`/listing/${l.id}?startDate=${encodeURIComponent(
                          startDate
                        )}&endDate=${encodeURIComponent(endDate)}&guests=${encodeURIComponent(
                          guests
                        )}`}
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
      )}
    </div>
  );
}
