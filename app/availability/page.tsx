export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: { startDate?: string; endDate?: string; guests?: string };
}) {
  const startDate = searchParams.startDate || "";
  const endDate = searchParams.endDate || "";
  const guests = searchParams.guests || "2";

  const url = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/hostaway/search?startDate=${encodeURIComponent(
    startDate
  )}&endDate=${encodeURIComponent(endDate)}&guests=${encodeURIComponent(guests)}`;

  // If NEXT_PUBLIC_SITE_URL isn’t set, fallback to relative fetch in runtime:
  const res = await fetch(
    `/api/hostaway/search?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&guests=${encodeURIComponent(
      guests
    )}`,
    { cache: "no-store" as any }
  );

  const data = await res.json();
  const listings = data?.availableListings || [];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Available Stays</h1>
      <p style={{ marginTop: 8 }}>
        {startDate} → {endDate} • Guests: {guests}
      </p>

      <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
        {listings.length === 0 ? (
          <div>No available listings found for this date range.</div>
        ) : (
          listings.map((l: any) => (
            <div key={l.id} style={{ border: "1px solid #333", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{l.name || `Listing ${l.id}`}</div>
              <div style={{ opacity: 0.8, marginTop: 6 }}>Listing ID: {l.id}</div>

              {/* Next step: “View details” + “Book now” */}
              <div style={{ marginTop: 12 }}>
                <a href={`/listing/${l.id}?startDate=${startDate}&endDate=${endDate}&guests=${guests}`}>
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
