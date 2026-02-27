import { NextResponse } from "next/server";

const LISTING_IDS = ["489089", "489093", "489095", "489097", "489092", "489094"] as const;

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

function isValidISODate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function parseGuests(s: string | null) {
  const n = Number(s || "2");
  if (!Number.isFinite(n) || n < 1) return 2;
  return Math.floor(n);
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

    // number of nights
    const nights = daysBetween(startDate, endDate);

    const token = await getHostawayAccessToken();

    const availableListings = await Promise.all(
      LISTING_IDS.map(async (id) => {
        // Calendar endpoint: /v1/listings/{listingId}/calendar?startDate=&endDate= :contentReference[oaicite:5]{index=5}
        const calRes = await fetch(
          `https://api.hostaway.com/v1/listings/${encodeURIComponent(id)}/calendar?startDate=${encodeURIComponent(
            startDate
          )}&endDate=${encodeURIComponent(endDate)}&includeResources=0`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "Cache-control": "no-cache",
            },
            cache: "no-store",
          }
        );

        const calJson = await calRes.json().catch(() => ({} as any));
        const days = Array.isArray(calJson?.result) ? calJson.result : [];

        // If API fails, treat as not available (don’t break whole search)
        if (!calRes.ok || days.length === 0) return null;

        // Basic availability check: every day in range must be available
        // (Hostaway calendar days include availability flags; we’re using a conservative filter.)
        const allAvailable = days.every((d: any) => {
          // some accounts return 1/0; treat truthy 1 as available
          const isAvailable = d?.isAvailable;
          const closedOnArrival = d?.closedOnArrival;
          const closedOnDeparture = d?.closedOnDeparture;

          // Keep it simple:
          if (Number(isAvailable) !== 1) return false;
          if (closedOnArrival === 1) return false;
          if (closedOnDeparture === 1) return false;
          return true;
        });

        if (!allAvailable) return null;

        // Also pull the listing details (for name + hero)
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

        const listingJson = await listingRes.json().catch(() => ({} as any));
        const l = listingJson?.result;
        if (!listingRes.ok || !l) return null;

        // guests filter (basic capacity check)
        const capacity = l.personCapacity ?? l.maxGuests ?? null;
        if (capacity != null && Number(capacity) < guests) return null;

        // minimumStay check (conservative: if any day has minimumStay > nights, reject)
        const minStayTooHigh = days.some((d: any) => {
          const ms = d?.minimumStay;
          if (ms == null) return false;
          return Number(ms) > nights;
        });
        if (minStayTooHigh) return null;

        const images = Array.isArray(l?.listingImages) ? l.listingImages : [];
        const hero = images.find((img: any) => img?.url) || images[0];

        return {
          id: String(l.id),
          name: l.name || l.externalListingName || `Listing ${id}`,
          city: l.city || null,
          state: l.state || null,
          maxGuests: capacity,
          bedrooms: l.bedroomsNumber ?? null,
          bathrooms: l.bathroomsNumber ?? null,
          thumbnailUrl: hero?.url || hero?.airbnbUrl || null,
          bookingEngineBase: BOOKING_ENGINE_BASE_URL,
        };
      })
    );

    const cleaned = availableListings.filter(Boolean);

    return NextResponse.json(
      {
        success: true,
        startDate,
        endDate,
        guests,
        availableListings: cleaned,
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
