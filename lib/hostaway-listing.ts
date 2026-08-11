// lib/hostaway-listing.ts
//
// Server-only single-listing fetch, shared by the server-rendered
// /listing/[id] and /rentals pages and by /api/hostaway/listings (kept as a
// thin wrapper so existing client-side callers — the pricing-refresh card,
// CompareModal, etc. — still work unchanged). Centralizing this means the
// Hostaway → resolved-listing mapping (including Tier 2 stat overrides and
// the drift check) exists in exactly one place.

import { unstable_rethrow } from "next/navigation";
import { VILLA_STAT_OVERRIDES, checkOccupancyDrift } from "@/lib/ocean-villas";

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
  const json = (await res.json().catch(() => ({}))) as { access_token?: string };
  if (!res.ok || !json?.access_token) {
    throw new Error(`Failed to get Hostaway access token (status ${res.status}).`);
  }
  cachedToken = String(json.access_token);
  cachedAt = Date.now();
  return cachedToken;
}

/** Shape of the amenity entries Hostaway returns — either a bare string or
 * an object naming the amenity under one of a few different field names
 * depending on the endpoint/API version. */
type HostawayAmenityEntry = string | { name?: string; amenityName?: string };

/** The subset of Hostaway's raw `GET /v1/listings/{id}` response this file
 * actually reads. Not exhaustive of everything Hostaway returns — only what
 * flows into HostawayListingDetail below. */
interface HostawayRawListing {
  id?: number | string;
  name?: string;
  externalListingName?: string;
  description?: string;
  city?: string;
  state?: string;
  country?: string;
  personCapacity?: number;
  maxGuests?: number;
  bedroomsNumber?: number;
  bathroomsNumber?: number;
  checkInTime?: string;
  checkOutTime?: string;
  listingImages?: { url?: string; airbnbUrl?: string }[];
  amenities?: HostawayAmenityEntry[];
  listingAmenities?: HostawayAmenityEntry[];
  amenityGroups?: { amenities?: HostawayAmenityEntry[]; items?: HostawayAmenityEntry[] }[];
}

function extractAmenities(found: HostawayRawListing | undefined): string[] {
  const set = new Set<string>();

  const directArr = found?.amenities ?? found?.listingAmenities ?? [];
  if (Array.isArray(directArr)) {
    for (const a of directArr) {
      if (typeof a === "string" && a.trim()) set.add(a.trim());
      else if (typeof a !== "string" && a?.name && typeof a.name === "string") set.add(a.name.trim());
      else if (typeof a !== "string" && a?.amenityName && typeof a.amenityName === "string") set.add(a.amenityName.trim());
    }
  }

  const groups = found?.amenityGroups ?? [];
  if (Array.isArray(groups)) {
    for (const group of groups) {
      const items = group?.amenities ?? group?.items ?? [];
      if (Array.isArray(items)) {
        for (const a of items) {
          if (typeof a === "string" && a.trim()) set.add(a.trim());
          else if (typeof a !== "string" && a?.name && typeof a.name === "string") set.add(a.name.trim());
          else if (typeof a !== "string" && a?.amenityName && typeof a.amenityName === "string") set.add(a.amenityName.trim());
        }
      }
    }
  }

  return Array.from(set);
}

export type HostawayListingDetail = {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  maxGuests: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  heroUrl: string | null;
  images: string[];
  amenities: string[];
  checkInTime: string | null;
  checkOutTime: string | null;
  bookingEngineBase: string;
};

/**
 * Distinguishes "Hostaway confirmed this listing doesn't exist" (a genuine
 * 404 — wrong/removed listing ID) from "Hostaway is unreachable or erroring"
 * (a transient failure). These must not be handled the same way: a bad ID
 * really is a 404, but a fetch failure on a real listing must not tell
 * search engines to deindex a page that's still valid — see callers.
 */
export type HostawayListingResult =
  | { status: "ok"; listing: HostawayListingDetail }
  | { status: "not_found" }
  | { status: "error"; message: string };

/**
 * Fetch a single listing from Hostaway (Tier 1) and resolve its display
 * fields, applying Tier 2 compliance overrides (VILLA_STAT_OVERRIDES) and
 * logging an occupancy-drift warning if Hostaway's own value disagrees.
 * Revalidates on a 5-minute window — see callers for the `next.revalidate`
 * config, since this is a plain `fetch` and Next's Data Cache only applies
 * revalidation options passed at the call site or picked up from context.
 */
export async function fetchHostawayListing(id: string): Promise<HostawayListingResult> {
  let token: string;
  try {
    token = await getHostawayAccessToken();
  } catch (err) {
    // Next throws its own control-flow errors (e.g. a build-time static-
    // generation bailout) through this same try/catch since they surface as
    // a rejected fetch — those must propagate, not be reported as a Hostaway
    // failure.
    unstable_rethrow(err);
    const message = err instanceof Error ? err.message : "Failed to authenticate with Hostaway";
    console.error(`[hostaway] Failed to authenticate while fetching listing ${id}:`, message);
    return { status: "error", message };
  }

  let res: Response;
  try {
    res = await fetch(`https://api.hostaway.com/v1/listings/${encodeURIComponent(id)}?includeResources=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Cache-control": "no-cache",
      },
      next: { revalidate: 300 },
    });
  } catch (err) {
    unstable_rethrow(err);
    const message = err instanceof Error ? err.message : "Network error contacting Hostaway";
    console.error(`[hostaway] Network error fetching listing ${id}:`, message);
    return { status: "error", message };
  }

  if (res.status === 404) {
    return { status: "not_found" };
  }

  const json = (await res.json().catch(() => ({}))) as { result?: HostawayRawListing };
  const found = json?.result;
  if (!res.ok || !found) {
    console.error(`[hostaway] Unexpected response fetching listing ${id}: HTTP ${res.status}`);
    return { status: "error", message: `Hostaway returned HTTP ${res.status} for listing ${id}` };
  }

  const rawImages = Array.isArray(found.listingImages) ? found.listingImages : [];
  const imageUrls: string[] = rawImages.map((img) => img?.url || img?.airbnbUrl || null).filter(Boolean) as string[];
  const heroUrl = imageUrls[0] || null;

  const statOverride = VILLA_STAT_OVERRIDES[String(found.id)] ?? {};
  checkOccupancyDrift(String(found.id), found.personCapacity ?? found.maxGuests ?? null);

  return {
    status: "ok",
    listing: {
      id: String(found.id),
      name: found.name || found.externalListingName || `Listing ${id}`,
      description: found.description || null,
      city: found.city || null,
      state: found.state || null,
      country: found.country || null,
      maxGuests: statOverride.maxGuests ?? found.personCapacity ?? found.maxGuests ?? null,
      bedrooms: statOverride.bedrooms ?? found.bedroomsNumber ?? null,
      bathrooms: statOverride.bathrooms ?? found.bathroomsNumber ?? null,
      heroUrl,
      images: imageUrls,
      amenities: extractAmenities(found),
      checkInTime: found.checkInTime || null,
      checkOutTime: found.checkOutTime || null,
      bookingEngineBase: BOOKING_ENGINE_BASE_URL,
    },
  };
}

/**
 * Fetches multiple listings in parallel. Listings that fail (either
 * genuinely not found or a Hostaway error) are logged and reported in
 * `failedIds` rather than silently dropped, so a caller rendering a
 * multi-villa page (e.g. /rentals) can distinguish "some villas didn't
 * load" from "these are simply all the villas there are."
 */
export async function fetchHostawayListings(
  ids: readonly string[]
): Promise<{ listings: HostawayListingDetail[]; failedIds: string[] }> {
  const results = await Promise.all(
    ids.map(async (id) => {
      const result = await fetchHostawayListing(id);
      if (result.status === "ok") return { id, listing: result.listing };
      console.error(
        `[hostaway] Listing ${id} did not load for a multi-listing page: ${result.status}` +
          (result.status === "error" ? ` — ${result.message}` : "")
      );
      return { id, listing: null };
    })
  );
  return {
    listings: results.filter((r): r is { id: string; listing: HostawayListingDetail } => r.listing !== null).map((r) => r.listing),
    failedIds: results.filter((r) => r.listing === null).map((r) => r.id),
  };
}
