// app/api/hostaway/pricing/route.ts
//
// Returns availability + nightly pricing for a listing + date range.
// Uses the Hostaway calendar endpoint (proven to work with the existing auth setup).
// Called by the villa detail page BookingCard to show on-site pricing before
// the guest leaves for the Hostaway booking widget.
//
// Pricing gracefully degrades: if the Hostaway plan tier doesn't expose per-day
// prices, isAvailable is still returned and hasPricing will be false.

import { NextResponse } from "next/server";

let cachedToken: string | null = null;
let cachedAt = 0;
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

async function getHostawayAccessToken() {
  const accountId = process.env.HOSTAWAY_ACCOUNT_ID;
  const apiKey = process.env.HOSTAWAY_API_KEY;
  if (!accountId || !apiKey) {
    throw new Error("Missing HOSTAWAY_ACCOUNT_ID or HOSTAWAY_API_KEY");
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
    throw new Error(`Failed to get Hostaway token (${res.status})`);
  }
  cachedToken = String(json.access_token);
  cachedAt = Date.now();
  return cachedToken;
}

function isValidDate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listingId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!listingId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "Required: listingId, startDate, endDate" },
        { status: 400 }
      );
    }
    if (!isValidDate(startDate) || !isValidDate(endDate) || startDate >= endDate) {
      return NextResponse.json(
        { success: false, error: "Invalid date range" },
        { status: 400 }
      );
    }

    const token = await getHostawayAccessToken();
    const calRes = await fetch(
      `https://api.hostaway.com/v1/listings/${encodeURIComponent(listingId)}/calendar` +
        `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&includeResources=0`,
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
    const days: any[] = Array.isArray(calJson?.result) ? calJson.result : [];

    if (!calRes.ok || days.length === 0) {
      return NextResponse.json(
        { success: false, error: "Could not retrieve calendar data" },
        { status: 502 }
      );
    }

    const isAvailable = days.every(
      (d) =>
        Number(d?.isAvailable) === 1 &&
        d?.closedOnArrival !== 1 &&
        d?.closedOnDeparture !== 1
    );

    // Hostaway's calendar returns one row per date INCLUDING the checkout
    // date itself (e.g. startDate=Aug1/endDate=Aug4 returns Aug1-Aug4, 4
    // rows, for what is actually a 3-night stay). The checkout day is not a
    // stayed/charged night, so it must be excluded before summing price —
    // otherwise every total is inflated by one extra night.
    const stayDays = days.length > 1 ? days.slice(0, -1) : days;

    // Hostaway returns nightly price in several possible field names depending on plan/config
    const prices: number[] = stayDays
      .map((d) =>
        Number(
          d?.price ?? d?.nightlyPrice ?? d?.basePrice ?? d?.costPerNight ?? 0
        )
      )
      .filter((p) => p > 0);

    const hasPricing = prices.length > 0;
    const totalNightlyPrice = prices.reduce((sum, p) => sum + p, 0);
    const avgNightlyPrice = hasPricing ? totalNightlyPrice / prices.length : 0;
    const minNightlyPrice = hasPricing ? Math.min(...prices) : 0;

    return NextResponse.json(
      {
        success: true,
        listingId,
        startDate,
        endDate,
        nights: stayDays.length,
        isAvailable,
        hasPricing,
        avgNightlyPrice: Math.round(avgNightlyPrice * 100) / 100,
        minNightlyPrice: Math.round(minNightlyPrice * 100) / 100,
        totalNightlyPrice: Math.round(totalNightlyPrice * 100) / 100,
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
