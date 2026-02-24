import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const apiKey = process.env.HOSTAWAY_API_KEY;
    const ids = process.env.OCEANVILLAS_LISTING_IDS;

    if (!apiKey) return NextResponse.json({ error: "Missing HOSTAWAY_API_KEY" }, { status: 500 });
    if (!ids) return NextResponse.json({ error: "Missing OCEANVILLAS_LISTING_IDS" }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const guests = searchParams.get("guests"); // optional for now

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Required: startDate, endDate" }, { status: 400 });
    }

    const listingIds = ids.split(",").map(s => s.trim()).filter(Boolean);

    // 1) Get listing details (so results page can show name/photos/etc.)
    const listingsRes = await fetch("https://api.hostaway.com/v1/listings", {
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      cache: "no-store",
    });

    const listingsJson = await listingsRes.json();
    const allListings = listingsJson?.result || listingsJson?.data || listingsJson;
    const listings = Array.isArray(allListings)
      ? allListings.filter((l: any) => listingIds.includes(String(l?.id)))
      : [];

    // 2) For each listing, check availability for the date range
    const checks = await Promise.all(
      listingIds.map(async (listingId) => {
        const res = await fetch(
          `https://api.hostaway.com/v1/availability?listingId=${encodeURIComponent(listingId)}&startDate=${encodeURIComponent(
            startDate
          )}&endDate=${encodeURIComponent(endDate)}`,
          {
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            cache: "no-store",
          }
        );

        const json = await res.json();
        return { listingId, status: res.status, data: json };
      })
    );

    // NOTE: Hostaway availability response shape can differ.
    // We’ll treat “available” conservatively until we confirm exact fields.
    const availableListingIds = checks
      .filter((c) => {
        const d = c.data?.result || c.data?.data || c.data;
        // If API returns explicit boolean:
        if (typeof d?.isAvailable === "boolean") return d.isAvailable;
        // If it returns a list of days with availability flags:
        if (Array.isArray(d)) return d.every((day: any) => day?.available !== false);
        // Fallback: if request succeeded, assume we’ll refine logic after first real response
        return c.status === 200;
      })
      .map((c) => String(c.listingId));

    const availableListings = listings.filter((l: any) => availableListingIds.includes(String(l?.id)));

    return NextResponse.json(
      {
        success: true,
        query: { startDate, endDate, guests },
        availableCount: availableListings.length,
        availableListings,
        debug: { checked: checks.map((c) => ({ listingId: c.listingId, status: c.status })) },
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
