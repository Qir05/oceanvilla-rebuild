// app/listing/[id]/page.tsx
import Link from "next/link";
import { headers } from "next/headers";

function getBaseUrlFromHeaders() {
  const h = headers();
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

export default async function ListingPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { startDate?: string; endDate?: string; guests?: string };
}) {
  const id = params.id;
  const startDate = searchParams.startDate || "";
  const endDate = searchParams.endDate || "";
  const guests = searchParams.guests || "2";

  const baseUrl = getBaseUrlFromHeaders();
  const apiUrl = `${baseUrl}/api/hostaway/search?startDate=${encodeURIComponent(
    startDate
  )}&endDate=${encodeURIComponent(endDate)}&guests=${encodeURIComponent(guests)}`;

  let data: any = null;
  let error: any = null;

  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    const text = await res.text();
    data = JSON.parse(text);
    if (!res.ok) error = data;
  } catch (e: any) {
    error = { error: e?.message || "Fetch failed" };
  }

  const listings = data?.availableListings || [];
  const listing = listings.find((x: any) => String(x?.id) === String(id));

  if (error) {
    return (
      <div style={{ padding: 28, maxWidth: 1000, margin: "0 auto" }}>
        <Link href={`/availability?startDate=${startDate}&endDate=${endDate}&guests=${guests}`}>
          ← Back
        </Link>
        <h1 style={{ marginTop: 14 }}>Listing</h1>
        <pre style={{ marginTop: 12, padding: 14, background: "#111", color: "#fff", borderRadius: 12 }}>
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  if (!listing) {
    return (
      <div style={{ padding: 28, maxWidth: 1000, margin: "0 auto" }}>
        <Link href={`/availability?startDate=${startDate}&endDate=${endDate}&guests=${guests}`}>
          ← Back
        </Link>
        <h1 style={{ marginTop: 14 }}>Not found</h1>
        <div style={{ marginTop: 10, opacity: 0.8 }}>
          This listing is not in the “available” result for your date range.
        </div>
      </div>
    );
  }

  const hero =
    listing.thumbnailUrl ||
    listing.thumbnailUrlLarge ||
    listing?.listingImages?.[0]?.largeUrl ||
    listing?.listingImages?.[0]?.url ||
    "";

  const bookingUrl = listing.bookingEngineUrl
    ? buildBookingUrl(listing.bookingEngineUrl, startDate, endDate, guests)
    : "";

  return (
    <div style={{ padding: 28, maxWidth: 1000, margin: "0 auto" }}>
      <Link href={`/availability?startDate=${startDate}&endDate=${endDate}&guests=${guests}`}>
        ← Back to availability
      </Link>

      <h1 style={{ marginTop: 14, fontSize: 30, fontWeight: 900 }}>
        {listing.name || `Listing ${listing.id}`}
      </h1>

      <div style={{ marginTop: 8, opacity: 0.8 }}>
        {startDate} → {endDate} • Guests: {guests}
      </div>

      {hero ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hero}
          alt={listing.name || `Listing ${listing.id}`}
          style={{
            width: "100%",
            height: 420,
            objectFit: "cover",
            borderRadius: 18,
            marginTop: 16,
          }}
        />
      ) : null}

      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
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
              borderRadius: 14,
              fontWeight: 900,
              textDecoration: "none",
              color: "#fff",
              background: "#111",
            }}
          >
            Book now
          </a>
        ) : (
          <div style={{ padding: "12px 14px", borderRadius: 14, background: "#f2f2f2" }}>
            Booking link not available on this listing payload.
          </div>
        )}
      </div>

      <div style={{ marginTop: 18, lineHeight: 1.6 }}>
        <h3 style={{ marginBottom: 8 }}>About</h3>
        <div style={{ whiteSpace: "pre-wrap", opacity: 0.9 }}>
          {listing.description || listing.internalListingName || "—"}
        </div>
      </div>
    </div>
  );
}
