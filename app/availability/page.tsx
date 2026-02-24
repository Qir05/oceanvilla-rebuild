import { headers } from "next/headers";

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: {
    startDate?: string;
    endDate?: string;
    guests?: string;
  };
}) {
  const startDate = searchParams.startDate || "";
  const endDate = searchParams.endDate || "";
  const guests = searchParams.guests || "2";

  // Build proper base URL (works in Vercel + local)
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "https";

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    `${proto}://${host}`;

  const res = await fetch(
    `${baseUrl}/api/hostaway/search?startDate=${encodeURIComponent(
      startDate
    )}&endDate=${encodeURIComponent(
      endDate
    )}&guests=${encodeURIComponent(guests)}`,
    { cache: "no-store" }
  );

  const data = await res.json();
  const listings = data?.availableListings || [];

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>
        Available Ocean Villas
      </h1>

      <p style={{ marginTop: 10 }}>
        {startDate} → {endDate} • Guests: {guests}
      </p>

      <div style={{ marginTop: 30, display: "grid", gap: 20 }}>
        {listings.length === 0 ? (
          <div>No villas available for selected dates.</div>
        ) : (
          listings.map((villa: any) => (
            <div
              key={villa.id}
              style={{
                border: "1px solid #333",
                padding: 20,
                borderRadius: 12,
              }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>
                {villa.name || `Villa ${villa.id}`}
              </h2>

              <p>ID: {villa.id}</p>

              <a
                href={`/listing/${villa.id}?startDate=${startDate}&endDate=${endDate}&guests=${guests}`}
              >
                View Details
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
