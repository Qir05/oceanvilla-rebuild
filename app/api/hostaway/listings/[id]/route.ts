// app/api/hostaway/listings/[id]/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BOOKING_ENGINE_BASE_URL =
  process.env.BOOKING_ENGINE_BASE_URL || "https://182003_1.holidayfuture.com";

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

function pickBookingUrl(found: any): string | null {
  // Try common fields that might exist in Hostaway listing payload
  const candidates = [
    found?.bookingEnginePublicUrl,
    found?.bookingEngineUrl,
    found?.publicUrl,
    found?.listingUrl,
    found?.url,
  ].filter(Boolean);

  if (candidates.length > 0) return String(candidates[0]);

  // If nothing exists, at least return the base domain (page.tsx will build final URL)
  return BOOKING_ENGINE_BASE_URL || null;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const token = await getHostawayAccessToken();

    const res = await fetch("https://api.hostaway.com/v1/listings", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));
    const all = json?.result || json?.data || json;

    const found = Array.isArray(all)
      ? all.find((l: any) => String(l?.id) === String(id))
      : null;

    if (!found) {
      return NextResponse.json(
        { error: "Listing not found", id },
        { status: 404 }
      );
    }

    const images = Array.isArray(found?.listingImages) ? found.listingImages : [];
    const hero = images.find((img: any) => img?.url) || images[0];

    const bookingEngineUrl = pickBookingUrl(found);

    return NextResponse.json(
      {
        success: true,
        listing: {
          id: String(found?.id),
          name: found?.name || found?.externalListingName || `Listing ${id}`,
          description: found?.description || null,
          city: found?.city || null,
          state: found?.state || null,
          country: found?.country || null,
          maxGuests: found?.personCapacity ?? found?.maxGuests ?? null,
          bedrooms: found?.bedroomsNumber ?? null,
          bathrooms: found?.bathroomsNumber ?? null,
          heroUrl: hero?.url || hero?.airbnbUrl || null,

          // ✅ Use REAL booking/public URL if available
          bookingEngineUrl,
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
