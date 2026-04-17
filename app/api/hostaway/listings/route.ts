// app/api/hostaway/listings/route.ts
import { NextResponse } from "next/server";

const BOOKING_ENGINE_BASE_URL =
  process.env.HOSTAWAY_BOOKING_ENGINE_BASE_URL ||
  process.env.NEXT_PUBLIC_BOOKING_URL ||
  "https://182003_1.holidayfuture.com";

let cachedToken: string | null = null;
let cachedAt = 0;
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

async function getHostawayAccessToken() {
  const accountId = process.env.HOSTAWAY_ACCOUNT_ID;
  const apiKey = process.env.HOSTAWAY_API_KEY;
  if (!accountId || !apiKey) {
    throw new Error("Missing HOSTAWAY_ACCOUNT_ID or HOSTAWAY_API_KEY in environment variables.");
  }
  if (cachedToken && Date.now() - cachedAt < TOKEN_TTL_MS) return cachedToken;
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

function extractAmenities(found: any): string[] {
  const set = new Set<string>();

  // Direct amenities array (strings or objects)
  const directArr = found?.amenities ?? found?.listingAmenities ?? [];
  if (Array.isArray(directArr)) {
    for (const a of directArr) {
      if (typeof a === "string" && a.trim()) set.add(a.trim());
      else if (a?.name && typeof a.name === "string") set.add(a.name.trim());
      else if (a?.amenityName && typeof a.amenityName === "string") set.add(a.amenityName.trim());
    }
  }

  // Grouped amenities
  const groups = found?.amenityGroups ?? [];
  if (Array.isArray(groups)) {
    for (const group of groups) {
      const items = group?.amenities ?? group?.items ?? [];
      if (Array.isArray(items)) {
        for (const a of items) {
          if (typeof a === "string" && a.trim()) set.add(a.trim());
          else if (a?.name && typeof a.name === "string") set.add(a.name.trim());
          else if (a?.amenityName && typeof a.amenityName === "string") set.add(a.amenityName.trim());
        }
      }
    }
  }

  return Array.from(set);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing listing ID" }, { status: 400 });
    }

    const token = await getHostawayAccessToken();
    const res = await fetch(
      `https://api.hostaway.com/v1/listings/${encodeURIComponent(id)}?includeResources=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Cache-control": "no-cache",
        },
        cache: "no-store",
      }
    );

    const json = await res.json().catch(() => ({} as any));
    const found = json?.result;

    if (!res.ok || !found) {
      return NextResponse.json(
        { success: false, error: "Listing not found in Hostaway", debug: { http: res.status, id } },
        { status: 404 }
      );
    }

    // Extract all image URLs in order
    const rawImages: any[] = Array.isArray(found?.listingImages) ? found.listingImages : [];
    const imageUrls: string[] = rawImages
      .map((img: any) => img?.url || img?.airbnbUrl || null)
      .filter(Boolean) as string[];

    const heroUrl = imageUrls[0] || null;

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
          heroUrl,
          images: imageUrls,
          amenities: extractAmenities(found),
          checkInTime: found.checkInTime || null,
          checkOutTime: found.checkOutTime || null,
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
