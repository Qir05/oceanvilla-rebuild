import { NextResponse } from "next/server";

let cachedToken: string | null = null;
let cachedTokenAt = 0; // ms

async function getHostawayAccessToken() {
  const apiKey = process.env.HOSTAWAY_API_KEY;
  const accountId = process.env.HOSTAWAY_ACCOUNT_ID;

  if (!apiKey) throw new Error("Missing HOSTAWAY_API_KEY");
  if (!accountId) throw new Error("Missing HOSTAWAY_ACCOUNT_ID");

  // simple cache (10 minutes)
  const now = Date.now();
  if (cachedToken && now - cachedTokenAt < 10 * 60 * 1000) return cachedToken;

  const res = await fetch("https://api.hostaway.com/v1/accessTokens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ apiKey, accountId }),
  });

  const json = await res.json();

  // Hostaway response shapes vary; support common ones
  const token =
    json?.access_token ||
    json?.accessToken ||
    json?.token ||
    json?.result?.accessToken ||
    json?.result?.access_token ||
    json?.result?.token ||
    json?.data?.accessToken ||
    json?.data?.access_token ||
    json?.data?.token;

  if (!res.ok || !token) {
    return { error: "Failed to get access token", status: res.status, json };
  }

  cachedToken = String(token);
  cachedTokenAt = now;
  return cachedToken;
}

function dayLooksUnavailable(day: any) {
  // conservative detection
  if (!day) return false;

  // explicit booleans
  if (typeof day.available === "boolean" && day.available === false) return true;
  if (typeof day.isAvailable === "boolean" && day.isAvailable === false) return true;

  // common status fields
  const status = String(day.status || day.state || day.availability || "").toLowerCase();
  if (status && status !== "available" && status !== "open") return true;

  // bookings / blocks
  if (day.booked === true) return true;
  if (day.isBooked === true) return true;
  if (day.blocked === true) return true;

  return false;
}

export async function GET(req: Request) {
  try {
    const ids = process.env.OCEANVILLAS_LISTING_IDS;
    if (!ids) return NextResponse.json({ error: "Missing OCEANVILLAS_LISTING_IDS" }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const guests = searchParams.get("guests") || "2";

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Required: startDate, endDate" }, { status: 400 });
    }

    const listingIds = ids
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // 1) Get access token
    const tokenOrErr = await getHostawayAccessToken();
    if (typeof tokenOrErr !== "string") {
      return NextResponse.json(
        { success: false, error: tokenOrErr.error, debug: tokenOrErr },
        { status: 500 }
      );
    }
    const accessToken = tokenOrErr;

    const authHeaders = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // 2) Fetch listings (to display names)
    const listingsRes = await fetch("https://api.hostaway.com/v1/listings", {
      headers: authHeaders,
      cache: "no-store",
    });
    const listingsJson = await listingsRes.json();

    const allListings =
      listingsJson?.result || listingsJson?.data || listingsJson?.listings || listingsJson;

    const listings = Array.isArray(allListings)
      ? allListings.filter((l: any) => listingIds.includes(String(l?.id)))
      : [];

    // 3) Check availability via calendar endpoint (availability endpoint often 404)
    const checks = await Promise.all(
      listingIds.map(async (listingId) => {
        const url = `https://api.hostaway.com/v1/listings/${encodeURIComponent(
          listingId
        )}/calendar?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;

        const res = await fetch(url, { headers: authHeaders, cache: "no-store" });
        const json = await res.json();

        // calendar days array may be in result/data
        const days = json?.result || json?.data || json?.calendar || json;
        const dayArr = Array.isArray(days) ? days : Array.isArray(days?.days) ? days.days : [];

        const anyUnavailable = dayArr.some((d: any) => dayLooksUnavailable(d));
        const daysCount = dayArr.length;

        // conservative: if no days returned, treat as not available
        const available = daysCount > 0 && !anyUnavailable && res.status === 200;

        return {
          listingId,
          status: res.status,
          available,
          debug: { url, daysCount, anyUnavailable },
        };
      })
    );

    const availableListingIds = checks.filter((c) => c.available).map((c) => String(c.listingId));
    const availableListings = listings.filter((l: any) => availableListingIds.includes(String(l?.id)));

    return NextResponse.json(
      {
        success: true,
        query: { startDate, endDate, guests },
        availableCount: availableListings.length,
        availableListings,
        debug: {
          checked: checks,
          listingsFetchStatus: listingsRes.status,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
