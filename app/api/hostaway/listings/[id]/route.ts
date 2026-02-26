import { NextRequest, NextResponse } from "next/server";

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
    (json as any)?.access_token ||
    (json as any)?.accessToken ||
    (json as any)?.token ||
    (json as any)?.result?.access_token ||
    (json as any)?.result?.accessToken ||
    (json as any)?.result?.token ||
    (json as any)?.data?.access_token ||
    (json as any)?.data?.accessToken ||
    (json as any)?.data?.token;

  if (!res.ok || !token) {
    throw new Error(
      `Failed to get access token (${res.status}): ${JSON.stringify(json)}`
    );
  }

  return String(token);
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const token = await getHostawayAccessToken();

    const res = await fetch("https://api.hostaway.com/v1/listings", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));
    const all = (json as any)?.result || (json as any)?.data || json;

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
          bookingEngineUrl: found?.bookingEngineUrl || null,
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
