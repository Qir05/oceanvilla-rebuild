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

  const json = await res.json();

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

// STRICT MODE:
// If ANY day looks blocked/booked/unavailable -> NOT available
function isUnavailableDay(day: any) {
  if (!day) return false;

  // explicit booleans
  if (typeof day.available === "boolean") return day.available === false;
  if (typeof day.isAvailable === "boolean") return day.isAvailable === false;
  if (typeof day.isBooked === "boolean") return day.isBooked === true;
  if (typeof day.booked === "boolean") return day.booked === true;
  if (typeof day.blocked === "boolean") return day.blocked === true;
  if (typeof day.isBlocked === "boolean") return day.isBlocked === true;

  // status strings
  const status = String(day.status ?? day.state ?? "").toLowerCase();
  const bad = [
    "booked",
    "reserved",
    "blocked",
    "unavailable",
    "occupied",
    "notavailable",
  ];
  if (status && bad.includes(status)) return true;

  return false;
}

export async function GET(req: Request) {
  try {
    const ids = process.env.OCEANVILLAS_LISTING_IDS;
    if (!ids) {
      return NextResponse.json(
        { error: "Missing OCEANVILLAS_LISTING_IDS" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const guests = searchParams.get("guests"); // optional

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Required: startDate, endDate" },
        { status: 400 }
      );
    }

    const listingIds = ids.split(",").map((s) => s.trim()).filter(Boolean);
    const accessToken = await getHostawayAccessToken();

    const authHeaders = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // 1) Pull listing details so UI can show names
    const listingsRes = await fetch("https://api.hostaway.com/v1/listings", {
      headers: authHeaders,
      cache: "no-store",
    });

    const listingsJson = await listingsRes.json();
    const allListings =
      listingsJson?.result || listingsJson?.data || listingsJson;

    const listings = Array.isArray(allListings)
      ? allListings.filter((l: any) => listingIds.includes(String(l?.id)))
      : [];

    // 2) Calendar checks per listing
    const checks = await Promise.all(
      listingIds.map(async (listingId) => {
        const url = `https://api.hostaway.com/v1/listings/${encodeURIComponent(
          listingId
        )}/calendar?startDate=${encodeURIComponent(
          startDate
        )}&endDate=${encodeURIComponent(endDate)}`;

        const res = await fetch(url, {
          headers: authHeaders,
          cache: "no-store",
        });

        const json = await res.json().catch(() => null);
        const days = pickCalendarDays(json);

        // STRICT: if ANY day is unavailable => listing not available
        const anyUnavailable = Array.isArray(days)
          ? days.some(isUnavailableDay)
          : true;

        // If we can’t read days properly, be conservative => not available
        const available =
          res.status === 200 &&
          Array.isArray(days) &&
          days.length > 0 &&
          !anyUnavailable;

        return {
          listingId: String(listingId),
          status: res.status,
          available,
          url,
          daysCount: Array.isArray(days) ? days.length : 0,
          anyUnavailable,
        };
      })
    );

    const availableIds = checks
      .filter((c) => c.available)
      .map((c) => String(c.listingId));

    const availableListings = listings.filter((l: any) =>
      availableIds.includes(String(l?.id))
    );

    // ✅ COMPACT RESPONSE (para dili daghan kaayo output)
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
        totalChecked: listingIds.length,
        availableCount: compactListings.length,
        availableListings: compactListings,
        debug: {
          checked: checks.map((c) => ({
            listingId: c.listingId,
            status: c.status,
            url: c.url,
            daysCount: c.daysCount,
            anyUnavailable: c.anyUnavailable,
            available: c.available,
          })),
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
