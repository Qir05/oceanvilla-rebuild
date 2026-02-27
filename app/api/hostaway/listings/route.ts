import { NextResponse } from "next/server";

const BOOKING_ENGINE_BASE_URL =
  process.env.HOSTAWAY_BOOKING_ENGINE_BASE_URL ||
  process.env.NEXT_PUBLIC_BOOKING_URL ||
  "https://182003_1.holidayfuture.com";

// In-memory token cache (works great in Vercel warm lambdas)
let cachedToken: string | null = null;
let cachedAt = 0;

// Hostaway token is long-lived, but we’ll still refresh periodically for safety.
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

async function getHostawayAccessToken() {
  const accountId = process.env.HOSTAWAY_ACCOUNT_ID;
  const apiKey = process.env.HOSTAWAY_API_KEY;

  if (!accountId || !apiKey) {
    throw new Error("Missing HOSTAWAY_ACCOUNT_ID or HOSTAWAY_API_KEY in environment variables.");
  }

  // Use cached token if still “fresh”
  if (cachedToken && Date.now() - cachedAt < TOKEN_TTL_MS) {
    return cachedToken;
  }

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

  const json = await res.json().catch(() => ({} as any));

  if (!res.ok || !json?.access_token) {
    throw new Error(`Failed to get Hostaway access token (status ${res.status}).`);
  }

  cachedToken = String(json.access_token);
  cachedAt = Date.now();
  return cachedToken;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing listing ID" }, { status: 400 });
    }

    const token = await getHostawayAccessToken();

    // ✅ Official: GET /v1/listings/{listingId}
    // Also: includeResources=1 recommended when you need listingImages, etc.
    const res = await fetch(`https://api.hostaway.com/v1/listings/${encodeURIComponent(id)}?includeResources=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Cache-control": "no-cache",
      },
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({} as any));

    // Hostaway standard response: { status, result, ... } :contentReference[oaicite:4]{index=4}
    const found = json?.result;

    if (!res.ok || !found) {
      return NextResponse.json(
        { success: false, error: "Listing not found in Hostaway", debug: { http: res.status, id } },
        { status: 404 }
      );
    }

    const images = Array.isArray(found?.listingImages) ? found.listingImages : [];
    const hero = images.find((img: any) => img?.url) || images[0];

    return NextResponse.json(
      {
        success: true,
        listing: {
          id: String(found.id),
          name: found.name || found.externalListingName || `Listing ${id}`,
          description: found.description || null,
          city: found.city || null,
          state: found.state || null,
          country: found.country || null,
          maxGuests: found.personCapacity ?? found.maxGuests ?? null,
          bedrooms: found.bedroomsNumber ?? null,
          bathrooms: found.bathroomsNumber ?? null,
          heroUrl: hero?.url || hero?.airbnbUrl || null,
          bookingEngineBase: BOOKING_ENGINE_BASE_URL,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
