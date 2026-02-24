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

  // ✅ Build a safe absolute base URL (Vercel-first)
  const h = await headers();

  const vercelUrl = process.env.VERCEL_URL; // e.g. oceanvilla-rebuild-tau.vercel.app
  const host = h.get("x-forwarded-host") || h.get("host") || vercelUrl || "";
  const proto = h.get("x-forwarded-proto") || "https";

  const baseUrl =
    (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      (host ? `${proto}://${host}` : ""));

  if (!baseUrl) {
    return (
      <div style={{ padding: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Available Ocean Villas</h1>
        <p style={{ marginTop: 12 }}>
          Server error: baseUrl is empty (missing host/VERCEL_URL/NEXT_PUBLIC_SITE_URL).
        </p>
      </div>
    );
  }

  const apiUrl = `${baseUrl}/api/hostaway/search?startDate=${encodeURIComponent(
    startDate
  )}&endDate=${encodeURIComponent(endDate)}&guests=${encodeURIComponent(guests)}`;

  try {
    const res = await fetch(apiUrl, { cache: "no-store" });

    const text = await res.text(); // ✅ read raw first
    let data: any = null;

    try {
      data = JSON.parse(text);
    } catch {
      // if Hostaway route returns non-JSON, show it
      return (
        <div style={{ padding: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Available Ocean Villas</h1>
          <p style={{ marginTop: 12 }}>API returned non-JSON response.</p>
          <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{text}</pre>
        </div>
      );
    }

    if (!res.ok) {
      return (
        <div style={{ padding: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Available Ocean Villas</h1>
          <p style={{ marginTop: 12 }}>
            API error ({res.status}): {data?.error || "Unknown error"}
          </p>
          <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    }

    const listings = data?.availableListings || [];

    return (
      <div style={{ padding: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Available Ocean Villas</h1>

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
  } catch (err: any) {
    return (
      <div style={{ padding: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Available Ocean Villas</h1>
        <p style={{ marginTop: 12 }}>Server exception while loading availability.</p>
        <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
          {err?.message || String(err)}
        </pre>
        <p style={{ marginTop: 12, opacity: 0.8 }}>Tried URL:</p>
        <pre style={{ whiteSpace: "pre-wrap" }}>{apiUrl}</pre>
      </div>
    );
  }
}
