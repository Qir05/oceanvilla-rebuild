// app/api/hostaway/search/route.ts
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

function pickCalendarDays(payload: any): any[] {
  const d = payload?.result ?? payload?.data ?? payload;

  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.days)) return d.days;
  if (Array.isArray(d?.calendar)) return d.calendar;
  if (Array.isArray(d?.data)) return d.data;

  return [];
}

function isoToTime(iso: string) {
  // iso expected: YYYY-MM-DD
  const t = Date.parse(`${iso}T00:00:00Z`);
  return Number.isFinite(t) ? t : NaN;
}

// STRICT MODE:
// If ANY relevant day looks blocked/booked/unavailable -> NOT available
function isUnavailableDay(day: any) {
  if (!day) return false;

  // booleans
  if (typeof day.available === "boolean") return day.available === false;
  if (typeof day.isAvailable === "boolean") return day.isAvailable === false;
  if (typeof day.isBooked === "boolean") return day.isBooked === true;
  if (typeof day.booked === "boolean") return day.booked === true;
  if (typeof day.blocked === "boolean") return day.blocked === true;
  if (typeof day.isBlocked === "boolean") return day.isBlocked === true;

  // numbers (common in some calendars): 1/0
  if (typeof day.available === "number") return day.available === 0;
  if (typeof day.isAvailable === "number") return day.isAvailable === 0;
  if (typeof day.booked === "number") return day.booked === 1;
  if (typeof day.blocked === "number") return day.blocked === 1;

  // strings
  const status = String(day.status ?? day.state ?? day.availability ?? "").toLowerCase();
  const bad = new Set([
    "booked",
    "reserved",
    "blocked",
    "unavailable",
    "occupied",
    "notavailable",
    "closed",
    "hold",
  ]);
  if (status && bad.has(status)) return true;

  return false;
}

function dayIso(day: any): string | null {
  // different keys across payloads
  const v =
    day?.date ||
    day?.day ||
    day?.calendarDate ||
    day?.startDate ||
    day?.localDate ||
    null;

  if (!v) return null;
  const s = String(v).slice(0, 10); // keep YYYY-MM-DD
  // quick guard
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  return s;
}

export async function GET(req: Request) {
  try {
    const ids = process.env.OCEANVILLAS_LISTING_IDS;
    if (!ids) {
      return NextResponse.json(
        { success: false, error: "Missing OCEANVILLAS_LISTING_IDS" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const guests = searchParams.get("guests"); // optional (UI only for now)

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "Required: startDate, endDate" },
        { status: 400 }
      );
    }

    const startT = isoToTime(startDate);
    const endT = isoToTime(endDate);

    if (!Number.isFinite(startT) || !Number.isFinite(endT) || endT <= startT) {
      return NextResponse.json(
        { success: false, error: "Invalid date range" },
        { status: 400 }
      );
    }

    const listingIds = ids
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const accessToken = await getHostawayAccessToken();

    const authHeaders = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // 1) Pull listing details (increase limit/perPage to avoid missing listings)
    const listingsRes = await fetch(
      "https://api.hostaway.com/v1/listings?limit=1000&perPage=1000",
      { headers: authHeaders, cache: "no-store" }
    );

    const listingsJson = await listingsRes.json().catch(() => ({}));
    const allListings = listingsJson?.result || listingsJson?.data || listingsJson;

    const listings = Array.isArray(allListings)
      ? allListings.filter((l: any) => listingIds.includes(String(l?.id)))
      : [];

    // 2) Calendar checks per listing
    const checks = await Promise.all(
      listingIds.map(async (listingId) => {
        const url =
          `https://api.hostaway.com/v1/listings/${encodeURIComponent(listingId)}/calendar` +
          `?startDate=${encodeURIComponent(startDate)}` +
          `&endDate=${encodeURIComponent(endDate)}`;

        const res = await fetch(url, { headers: authHeaders, cache: "no-store" });
        const json = await res.json().catch(() => null);
        const daysRaw = pickCalendarDays(json);

        // ✅ Only evaluate "stay nights": startDate <= day < endDate
        const relevantDays = Array.isArray(daysRaw)
          ? daysRaw.filter((d: any) => {
              const iso = dayIso(d);
              if (!iso) return false;
              const t = isoToTime(iso);
              return Number.isFinite(t) && t >= startT && t < endT; // ignore checkout day
            })
          : [];

        // STRICT: if ANY relevant day is unavailable => listing not available
        const anyUnavailable = relevantDays.some(isUnavailableDay);

        // conservative: if we couldn't read relevant days, mark unavailable
        const available =
          res.ok && relevantDays.length > 0 && !anyUnavailable;

        return {
          listingId: String(listingId),
          status: res.status,
          available,
          url,
          daysCount: Array.isArray(daysRaw) ? daysRaw.length : 0,
          relevantCount: relevantDays.length,
          anyUnavailable,
        };
      })
    );

    const availableIds = checks.filter((c) => c.available).map((c) => c.listingId);

    const availableListings = listings.filter((l: any) =>
      availableIds.includes(String(l?.id))
    );

    // Compact response for UI
    const compactListings = availableListings.map((l: any) => {
      const images = Array.isArray(l?.listingImages) ? l.listingImages : [];
      const hero =
        images.find((img: any) => img?.url) ||
        images.find((img: any) => img?.airbnbUrl) ||
        images[0];

      return {
        id: String(l?.id),
        name: l?.name || l?.externalListingName || "Listing",
        city: l?.city || null,
        state: l?.state || null,
        country: l?.country || null,
        maxGuests: l?.personCapacity ?? l?.maxGuests ?? null,
        bedrooms: l?.bedroomsNumber ?? null,
        bathrooms: l?.bathroomsNumber ?? null,
        thumbnailUrl: hero?.url || hero?.airbnbUrl || null,
        priceNightly: l?.priceNightly ?? l?.baseRate ?? null,
      };
    });

    return NextResponse.json(
      {
        success: true,
        query: { startDate, endDate, guests },
        totalConfigured: listingIds.length,
        totalFoundListings: listings.length,
        availableCount: compactListings.length,
        availableListings: compactListings,
        debug: {
          checked: checks,
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
