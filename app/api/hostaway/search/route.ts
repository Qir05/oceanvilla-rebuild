import { NextResponse } from "next/server";

type AnyObj = Record<string, any>;

function pickResult(payload: any) {
  // Hostaway responses can vary: {result: ...} or {data: ...} or raw
  return payload?.result ?? payload?.data ?? payload;
}

function isDayUnavailable(day: AnyObj) {
  // Flexible parsing across possible Hostaway shapes
  const status = String(day?.status ?? day?.state ?? "").toLowerCase();

  // explicit boolean flags
  if (typeof day?.isAvailable === "boolean") return day.isAvailable === false;
  if (typeof day?.available === "boolean") return day.available === false;

  // common "status" strings (conservative)
  const badStatuses = ["booked", "reserved", "blocked", "unavailable", "notavailable", "occupied"];
  if (status && badStatuses.includes(status)) return true;

  // if it has "isBooked" etc
  if (day?.isBooked === true) return true;
  if (day?.booked === true) return true;
  if (day?.blocked === true) return true;

  return false;
}

function extractDays(calendarPayload: any): AnyObj[] {
  const d = pickResult(calendarPayload);

  // possible shapes:
  // - array of days
  // - { days: [...] }
  // - { calendar: [...] }
  // - { result: { days: [...] } }
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.days)) return d.days;
  if (Array.isArray(d?.calendar)) return d.calendar;
  if (Array.isArray(d?.data)) return d.data;

  return [];
}

export async function GET(req: Request) {
  try {
    const apiKey = process.env.HOSTAWAY_API_KEY;
    const ids = process.env.OCEANVILLAS_LISTING_IDS;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing HOSTAWAY_API_KEY" }, { status: 500 });
    }
    if (!ids) {
      return NextResponse.json({ error: "Missing OCEANVILLAS_LISTING_IDS" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const guests = searchParams.get("guests"); // optional for now

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Required: startDate, endDate" }, { status: 400 });
    }

    const listingIds = ids
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // 1) Get listing details (name/photos/etc.)
    // Add a large limit to reduce pagination issues (Hostaway may still paginate depending on account)
    const listingsRes = await fetch("https://api.hostaway.com/v1/listings?limit=1000", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const listingsJson = await listingsRes.json();
    const allListings = pickResult(listingsJson);

    const listings = Array.isArray(allListings)
      ? allListings.filter((l: any) => listingIds.includes(String(l?.id)))
      : [];

    // 2) For each listing, check calendar for date range
    const checks = await Promise.all(
      listingIds.map(async (listingId) => {
        const url = `https://api.hostaway.com/v1/listings/${encodeURIComponent(
          listingId
        )}/calendar?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        let json: any = null;
        try {
          json = await res.json();
        } catch {
          json = { error: "Non-JSON response from Hostaway" };
        }

        const days = extractDays(json);

        // Conservative rule:
        // - If any day in range is unavailable -> NOT available
        // - If calendar returns no days but status is 200 -> treat as available (but flagged)
        const anyUnavailable = days.some(isDayUnavailable);
        const available = res.ok ? !anyUnavailable : false;

        return {
          listingId: String(listingId),
          status: res.status,
          available,
          debug: {
            url,
            daysCount: days.length,
            anyUnavailable,
          },
        };
      })
    );

    const availableListingIds = checks
      .filter((c) => c.available === true)
      .map((c) => String(c.listingId));

    const availableListings = listings.filter((l: any) =>
      availableListingIds.includes(String(l?.id))
    );

    return NextResponse.json(
      {
        success: true,
        query: { startDate, endDate, guests },
        availableCount: availableListings.length,
        availableListings,
        debug: {
          checked: checks, // keep for now during dev; we can remove later
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
