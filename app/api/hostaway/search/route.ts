import { NextResponse } from "next/server";

async function getHostawayAccessToken() {
  const accountId = process.env.HOSTAWAY_ACCOUNT_ID;
  const apiKey = process.env.HOSTAWAY_API_KEY;

  if (!accountId) throw new Error("Missing HOSTAWAY_ACCOUNT_ID");
  if (!apiKey) throw new Error("Missing HOSTAWAY_API_KEY");

  const body = new URLSearchParams();
  body.set("grant_type", "client_credentials");
  body.set("client_id", accountId);
  body.set("client_secret", apiKey);

  const res = await fetch("https://api.hostaway.com/v1/accessTokens", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const json = await res.json();

  const token =
    json?.access_token ||
    json?.accessToken ||
    json?.token ||
    json?.result?.access_token ||
    json?.result?.accessToken ||
    json?.result?.token ||
    json?.data?.access_token ||
    json?.data?.accessToken ||
    json?.data?.token;

  if (!res.ok || !token) {
    throw new Error(
      `Failed to get access token (${res.status}): ${JSON.stringify(json)}`
    );
  }

  return String(token);
}

export async function GET(req: Request) {
  try {
    const ids = process.env.OCEANVILLAS_LISTING_IDS;
    if (!ids)
      return NextResponse.json(
        { error: "Missing OCEANVILLAS_LISTING_IDS" },
        { status: 500 }
      );

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const guests = searchParams.get("guests"); // optional

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Required: startDate, endDate" },
        { status: 400 }
      );
    }

    const accessToken = await getHostawayAccessToken();
    const listingIds = ids.split(",").map((s) => s.trim()).filter(Boolean);

    // 1) Listings
    const listingsRes = await fetch("https://api.hostaway.com/v1/listings", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const listingsJson = await listingsRes.json();
    const allListings = listingsJson?.result || listingsJson?.data || listingsJson;
    const listings = Array.isArray(allListings)
      ? allListings.filter((l: any) => listingIds.includes(String(l?.id)))
      : [];

    // 2) Availability checks
    const checks = await Promise.all(
      listingIds.map(async (listingId) => {
        const url = `https://api.hostaway.com/v1/listings/${encodeURIComponent(
  listingId
)}/calendar?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        const json = await res.json();
        return { listingId, status: res.status, data: json, url };
      })
    );

    const availableListingIds = checks
      .filter((c) => c.status === 200)
      .map((c) => String(c.listingId));

    const availableListings = listings.filter((l: any) =>
      availableListingIds.includes(String(l?.id))
    );

    return NextResponse.json(
      {
        success: true,
        query: { startDate, endDate, guests },
        availableCount: availableListings.length,
        availableListings,
        debug: { checked: checks.map((c) => ({ listingId: c.listingId, status: c.status, url: c.url })) },
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
