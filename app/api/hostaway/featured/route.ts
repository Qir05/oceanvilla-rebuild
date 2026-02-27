// app/api/hostaway/featured/route.ts
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

  const json = await res.json().catch(() => ({}));

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

export async function GET() {
  try {
    const ids = process.env.OCEANVILLAS_LISTING_IDS;
    if (!ids) {
      return NextResponse.json(
        { success: false, error: "Missing OCEANVILLAS_LISTING_IDS" },
        { status: 500 }
      );
    }

    const listingIds = ids
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const token = await getHostawayAccessToken();

    const res = await fetch(
      "https://api.hostaway.com/v1/listings?limit=1000&perPage=1000",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const json = await res.json().catch(() => ({}));
    const all = json?.result || json?.data || json;

    const picked = Array.isArray(all)
      ? all.filter((l: any) => listingIds.includes(String(l?.id)))
      : [];

    const featured = picked.map((l: any) => {
      const images = Array.isArray(l?.listingImages) ? l.listingImages : [];
      const hero =
        images.find((img: any) => img?.url) ||
        images.find((img: any) => img?.airbnbUrl) ||
        images[0];

      const sleeps = l?.personCapacity ?? l?.maxGuests ?? null;
      const beds = l?.bedroomsNumber ?? null;
      const baths = l?.bathroomsNumber ?? null;

      return {
        id: String(l?.id),
        name: l?.name || l?.externalListingName || `Listing ${l?.id}`,
        tagline:
          l?.city
            ? `${l.city}${l.state ? `, ${l.state}` : ""}`
            : "Premium stay",
        sleeps: typeof sleeps === "number" ? sleeps : 0,
        beds: typeof beds === "number" ? beds : 0,
        baths: typeof baths === "number" ? baths : 0,
        highlight: "Direct booking",
        image: hero?.url || hero?.airbnbUrl || null,
      };
    });

    return NextResponse.json(
      { success: true, featured },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
