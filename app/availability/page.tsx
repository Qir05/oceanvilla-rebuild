export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: { startDate?: string; endDate?: string; guests?: string };
}) {
  const startDate = searchParams?.startDate || "";
  const endDate = searchParams?.endDate || "";
  const guests = searchParams?.guests || "2";

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  // If missing params, show simple instructions
  if (!startDate || !endDate) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Available Ocean Villas</h1>
        <p style={{ marginTop: 8 }}>
          Add params like:
          <br />
          <code>/availability?startDate=2026-03-01&endDate=2026-03-05&guests=2</code>
        </p>
      </div>
    );
  }

  const apiUrl = `${baseUrl}/api/hostaway/search?startDate=${encodeURIComponent(
    startDate
  )}&endDate=${encodeURIComponent(endDate)}&guests=${encodeURIComponent(guests)}`;

  const res = await fetch(apiUrl, { cache: "no-store" as any });
  const data = await res.json();

  // optional: show API error nicely
  if (!res.ok) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Available Ocean Villas</h1>
        <div style={{ marginTop: 12 }}>
          API error ({res.status}):
          <pre style={{ marginTop: 8 }}>{JSON.stringify(data, null, 2)}</pre>
        </div>
      </div>
    );
  }

  const listings = data?.availableListings || [];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Available Ocean Villas</h1>
      <p style={{ marginTop: 8 }}>
        {startDate} → {endDate} • Guests: {guests}
      </p>

      <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
        {listings.length === 0 ? (
          <div>No available listings found for this date range.</div>
        ) : (
          listings.map((l: any) => (
            <div
              key={l.id}
              style={{ border: "1px solid #333", borderRadius: 12, padding: 16 }}
            >
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                {l.name || `Listing ${l.id}`}
              </div>
              <div style={{ opacity: 0.8, marginTop: 6 }}>Listing ID: {l.id}</div>

              <div style={{ marginTop: 12 }}>
                <a
                  href={`/listing/${l.id}?startDate=${startDate}&endDate=${endDate}&guests=${guests}`}
                >
                  View details
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
