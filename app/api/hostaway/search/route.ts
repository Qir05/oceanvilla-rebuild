// app/api/hostaway/search/route.ts
import { NextResponse } from "next/server";
import { OCEAN_VILLA_LISTING_IDS, VILLA_STAT_OVERRIDES, MAX_SITE_GUEST_CAPACITY, checkOccupancyDrift } from "@/lib/ocean-villas";

const LISTING_IDS = OCEAN_VILLA_LISTING_IDS;

interface HostawayCalendarDay {
  isAvailable?: number | boolean;
  closedOnArrival?: number | boolean;
  closedOnDeparture?: number | boolean;
  minimumStay?: number | string;
}

/** The subset of Hostaway's raw listing shape this route reads. */
interface HostawaySearchListing {
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

const BOOKING_ENGINE_BASE_URL =
  process.env.HOSTAWAY_BOOKING_ENGINE_BASE_URL ||
  process.env.NEXT_PUBLIC_BOOKING_URL ||
  "https://182003_1.holidayfuture.com";

let cachedToken: string | null = null;
let cachedAt = 0;
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

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

function isValidISODate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function parseGuests(s: string | null) {
  const n = Number(s || "2");
  if (!Number.isFinite(n) || n < 1) return 2;
  // Capped to the largest resolved villa capacity, not a hardcoded number —
  // a stale "10" here silently truncated any 11-12 guest search before it
  // ever reached the per-listing capacity filter below.
  return Math.min(Math.floor(n), MAX_SITE_GUEST_CAPACITY);
}

function daysBetween(startISO: string, endISO: string) {
  const a = new Date(startISO).getTime();
  const b = new Date(endISO).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function isAfterOrEqual(aISO: string, bISO: string) {
  return new Date(aISO).getTime() >= new Date(bISO).getTime();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const guests = parseGuests(searchParams.get("guests"));

    if (!isValidISODate(startDate) || !isValidISODate(endDate)) {
      return NextResponse.json({ success: false, error: "Invalid or missing dates" }, { status: 400 });
    }
    if (isAfterOrEqual(startDate, endDate)) {
      return NextResponse.json({ success: false, error: "endDate must be after startDate" }, { status: 400 });
    }

    const nights = daysBetween(startDate, endDate);
    const token = await getHostawayAccessToken();

    const availableListings = await Promise.all(
      LISTING_IDS.map(async (id) => {
        const calRes = await fetch(
          `https://api.hostaway.com/v1/listings/${encodeURIComponent(id)}/calendar?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&includeResources=0`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "Cache-control": "no-cache",
            },
            cache: "no-store",
          }
        );
        const calJson = (await calRes.json().catch(() => ({}))) as { result?: HostawayCalendarDay[] };
        const days = Array.isArray(calJson?.result) ? calJson.result : [];
        if (!calRes.ok || days.length === 0) return null;

        // Every night in the stay must be available (not blocked by an existing booking).
        const allNightsAvailable = days.every((d) => Number(d?.isAvailable) === 1);
        if (!allNightsAvailable) return null;

        // closedOnArrival only blocks the check-in date, not the entire stay.
        // Applying it to every day incorrectly rejects villas with day-of-week
        // check-in restrictions (e.g. no arrivals on Sundays).
        if (Number(days[0]?.closedOnArrival) === 1) return null;

        // closedOnDeparture only applies to the last calendar day returned.
        if (Number(days[days.length - 1]?.closedOnDeparture) === 1) return null;

        const listingRes = await fetch(
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
        const listingJson = (await listingRes.json().catch(() => ({}))) as { result?: HostawaySearchListing };
        const l = listingJson?.result;
        if (!listingRes.ok || !l) return null;

        const rawCapacity = l.personCapacity ?? l.maxGuests ?? null;
        checkOccupancyDrift(String(l.id), rawCapacity);
        const capacity = VILLA_STAT_OVERRIDES[String(l.id)]?.maxGuests ?? rawCapacity;
        if (capacity != null && Number(capacity) < guests) return null;

        // minimumStay is a booking-start rule — only the check-in day's value matters.
        const checkInMinStay = days[0]?.minimumStay;
        if (checkInMinStay != null && Number(checkInMinStay) > nights) return null;

        const images = Array.isArray(l?.listingImages) ? l.listingImages : [];
        const hero = images.find((img) => img?.url) || images[0];

        const statOverride = VILLA_STAT_OVERRIDES[String(l.id)] ?? {};

        return {
          id: String(l.id),
          name: l.name || l.externalListingName || `Listing ${id}`,
          city: l.city || null,
          state: l.state || null,
          maxGuests: statOverride.maxGuests ?? capacity,
          bedrooms: statOverride.bedrooms ?? l.bedroomsNumber ?? null,
          bathrooms: statOverride.bathrooms ?? l.bathroomsNumber ?? null,
          thumbnailUrl: hero?.url || hero?.airbnbUrl || null,
          bookingEngineBase: BOOKING_ENGINE_BASE_URL,
        };
      })
    );

    // Deduplicate by villa ID in case the Hostaway API returns the same listing
    // for multiple queried IDs (e.g. unit/property ID aliasing).
    const seen = new Set<string>();
    const cleaned = availableListings.filter((l): l is NonNullable<typeof l> => {
      if (!l) return false;
      if (seen.has(l.id)) return false;
      seen.add(l.id);
      return true;
    });

    return NextResponse.json(
      { success: true, startDate, endDate, guests, availableListings: cleaned },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
