export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: { startDate?: string; endDate?: string; guests?: string };
}) {
  const startDate = searchParams.startDate || "";
  const endDate = searchParams.endDate || "";
  const guests = searchParams.guests || "2";

  // ✅ IMPORTANT: Server Components need ABSOLUTE URL (not /api/...)
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const apiUrl = `${baseUrl}/api/hostaway/search?startDate=${encodeURIComponent(
    startDate
  )}&endDate=${encodeURIComponent(endDate)}&guests=${encodeURIComponent(guests)}`;

  let data: any = null;
  let error: any = null;
  let status = 200;

  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    status = res.status;
    data = await res.json();
    if (!res.ok) error = data;
  } catch (e: any) {
    error = { error: e?.message || "Fetch failed" };
  }

  const listings = data?.availableListings || [];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Available Ocean Villas</h1>

      <p style={{ marginTop: 8 }}>
        {startDate} → {endDate} • Guests: {guests}
      </p>

      {error ? (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700 }}>API error ({status}):</div>
          <pre
            style={{
              marginTop: 8,
              padding: 12,
              background: "#111",
              color: "#fff",
              borderRadius: 8,
              overflow: "auto",
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
            listings.map((l: any) => (
              <div
                key={l.id}
                style={{
                  border: "1px solid #333",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                  {l.name || `Listing ${l.id}`}
                </div>
                <div style={{ opacity: 0.8, marginTop: 6 }}>
                  Listing ID: {l.id}
                </div>
                <div style={{ marginTop: 12 }}>
                  <a
                    href={`/listing/${l.id}?startDate=${encodeURIComponent(
                      startDate
                    )}&endDate=${encodeURIComponent(
                      endDate
                    )}&guests=${encodeURIComponent(guests)}`}
                  >
                    View details
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
