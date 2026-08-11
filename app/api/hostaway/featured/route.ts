// app/api/hostaway/featured/route.ts
import { NextResponse } from "next/server";
import { OCEAN_VILLA_LISTING_IDS, VILLA_STAT_OVERRIDES, checkOccupancyDrift } from "@/lib/ocean-villas";

/** The subset of Hostaway's raw listing shape this (currently unused —
 * no page calls this route) endpoint reads. */
interface HostawayFeaturedListing {
  id?: number | string;
  name?: string;
  externalListingName?: string;
  city?: string;
  state?: string;
  personCapacity?: number;
  maxGuests?: number;
  bedroomsNumber?: number;
  bathroomsNumber?: number;
  listingImages?: { url?: string; airbnbUrl?: string }[];
}

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
    throw new Error(`Failed to get access token (${res.status}): ${JSON.stringify(json)}`);
  }
  return String(token);
}

export async function GET() {
  try {
    // Prefer env var so IDs can be updated without a redeploy.
    // Falls back to the canonical lib array so the site works even if the env var is stale.
    const envIds = process.env.OCEANVILLAS_LISTING_IDS;
    const listingIds = envIds
      ? envIds.split(",").map((s) => s.trim()).filter(Boolean)
      : [...OCEAN_VILLA_LISTING_IDS];
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
    const json = (await res.json().catch(() => ({}))) as { result?: unknown; data?: unknown };
    const all: unknown = json?.result ?? json?.data ?? json;
    const picked: HostawayFeaturedListing[] = Array.isArray(all)
      ? (all as HostawayFeaturedListing[]).filter((l) => listingIds.includes(String(l?.id)))
      : [];
    const featured = picked.map((l) => {
      const images = Array.isArray(l?.listingImages) ? l.listingImages : [];
      const hero =
        images.find((img) => img?.url) ||
        images.find((img) => img?.airbnbUrl) ||
        images[0];
      const rawSleeps = l?.personCapacity ?? l?.maxGuests ?? null;
      checkOccupancyDrift(String(l?.id), rawSleeps);
      const statOverride = VILLA_STAT_OVERRIDES[String(l?.id)] ?? {};
      const sleeps = statOverride.maxGuests ?? rawSleeps;
      const beds = statOverride.bedrooms ?? l?.bedroomsNumber ?? null;
      const baths = statOverride.bathrooms ?? l?.bathroomsNumber ?? null;
      return {
        id: String(l?.id),
        name: l?.name || l?.externalListingName || `Listing ${l?.id}`,
        tagline: l?.city
          ? `${l.city}${l.state ? `, ${l.state}` : ""}`
          : "Premium stay",
        sleeps: typeof sleeps === "number" ? sleeps : 0,
        beds: typeof beds === "number" ? beds : 0,
        baths: typeof baths === "number" ? baths : 0,
        highlight: "Direct booking",
        image: hero?.url || hero?.airbnbUrl || null,
      };
    });
    return NextResponse.json({ success: true, featured }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
