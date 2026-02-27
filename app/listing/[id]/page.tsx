// app/listing/[id]/page.tsx
import Link from "next/link";
import { headers } from "next/headers";

type SearchParams = {
  startDate?: string;
  endDate?: string;
  guests?: string;
};

async function getBaseUrlFromHeaders() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("x-forwarded-host") || h.get("host");
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

export default async function ListingDetailsPage({
  params,
  searchParams,
}: {
  params: { id: string } | Promise<{ id: string }>;
  searchParams: SearchParams | Promise<SearchParams>;
}) {
  const p = await Promise.resolve(params);
  const sp = await Promise.resolve(searchParams);

  const id = p?.id;
  const startDate = sp?.startDate || "";
  const endDate = sp?.endDate || "";
  const guests = sp?.guests || "2";

  if (!id) {
    return <div>Missing listing id</div>;
  }

  const baseUrl = await getBaseUrlFromHeaders();
  const apiUrl = `${baseUrl}/api/hostaway/listings/${id}`;

  const res = await fetch(apiUrl, { cache: "no-store" });
  const data = await res.json();
  const listing = data?.listing;

  if (!listing) {
    return <div>Listing not found</div>;
  }

  const bookingUrl = buildBookingUrl(
    listing.bookingEngineBase,
    id,
    startDate,
    endDate,
    guests
  );

  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: "0 auto" }}>
      <Link
        href={`/availability?startDate=${startDate}&endDate=${endDate}&guests=${guests}`}
      >
        ← Back to availability
      </Link>

      <h1>{listing.name}</h1>

      <div>
        {startDate} → {endDate} • Guests: {guests}
      </div>

      <img
        src={listing.heroUrl}
        alt={listing.name}
        style={{ width: "100%", maxWidth: 600 }}
      />

      <div style={{ marginTop: 20 }}>
        <a
          href={bookingUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "12px 18px",
            background: "black",
            color: "white",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Book now
        </a>
      </div>
    </div>
  );
}

function buildBookingUrl(
  base: string,
  listingId: string,
  startDate: string,
  endDate: string,
  guests: string
) {
  const u = new URL(base);

  // ✅ CORRECT PATH FOR HOSTAWAY BOOKING ENGINE
  u.pathname = `/property/${listingId}`;

  if (startDate) u.searchParams.set("startDate", startDate);
  if (endDate) u.searchParams.set("endDate", endDate);
  if (guests) u.searchParams.set("adults", guests);

  return u.toString();
}
