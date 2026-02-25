export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: { startDate?: string; endDate?: string; guests?: string };
}) {
  const startDate = searchParams.startDate || "";
  const endDate = searchParams.endDate || "";
  const guests = searchParams.guests || "2";

  const apiUrl = `/api/hostaway/search?startDate=${encodeURIComponent(
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
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
        Available Ocean Villas
      </h1>

      <p style={{ opacity: 0.8, marginBottom: 18 }}>
        {startDate} → {endDate} • Guests: {guests}
      </p>

      {error ? (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 800 }}>API error ({status}):</div>
          <pre
            style={{
              marginTop: 8,
              padding: 12,
              background: "#111",
              color: "#fff",
              borderRadius: 10,
              overflow: "auto",
              fontSize: 12,
              lineHeight: 1.4,
            }}
          >
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      ) : (
        <div style={{ marginTop: 18 }}>
          {listings.length === 0 ? (
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 16,
                background: "#fafafa",
              }}
            >
              No available listings found for this date range.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              {listings.map((l: any) => {
                const detailsHref = `/listing/${l.id}?startDate=${encodeURIComponent(
                  startDate
                )}&endDate=${encodeURIComponent(endDate)}&guests=${encodeURIComponent(
                  guests
                )}`;

                return (
                  <div
                    key={l.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 16,
                      overflow: "hidden",
                      background: "#fff",
                      boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: 180,
                        background: "#f3f4f6",
                        position: "relative",
                      }}
                    >
                      {l.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={l.thumbnailUrl}
                          alt={l.name || `Listing ${l.id}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: 0.65,
                            fontSize: 14,
                          }}
                        >
                          No image
                        </div>
                      )}
                    </div>

                    <div style={{ padding: 14 }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          lineHeight: 1.25,
                        }}
                      >
                        {l.name || `Listing ${l.id}`}
                      </div>

                      <div style={{ opacity: 0.75, marginTop: 6, fontSize: 13 }}>
                        {l.city ? `${l.city}${l.state ? `, ${l.state}` : ""}` : "—"}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                          marginTop: 10,
                          fontSize: 13,
                          opacity: 0.9,
                        }}
                      >
                        <span>👥 {l.maxGuests ?? "—"} guests</span>
                        <span>🛏 {l.bedrooms ?? "—"} beds</span>
                        <span>🛁 {l.bathrooms ?? "—"} baths</span>
                      </div>

                      <div style={{ marginTop: 14 }}>
                        <a
                          href={detailsHref}
                          style={{
                            display: "inline-block",
                            padding: "10px 12px",
                            borderRadius: 12,
                            background: "#111827",
                            color: "#fff",
                            textDecoration: "none",
                            fontWeight: 800,
                            fontSize: 13,
                          }}
                        >
                          View details →
                        </a>

                        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.65 }}>
                          Listing ID: {l.id}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
