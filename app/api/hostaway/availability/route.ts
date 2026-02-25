import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const apiKey = process.env.HOSTAWAY_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing HOSTAWAY_API_KEY" }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listingId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!listingId || !startDate || !endDate) {
      return NextResponse.json({ error: "Required: listingId, startDate, endDate" }, { status: 400 });
    }

    // try both endpoints (some accounts use calendar instead of availability)
    const calendarUrl =
      `https://api.hostaway.com/v1/listings/${encodeURIComponent(listingId)}/calendar` +
      `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;

    const availabilityUrl =
      `https://api.hostaway.com/v1/availability` +
      `?listingId=${encodeURIComponent(listingId)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;

    // try multiple auth header formats
    const authVariants = [
      { label: "Bearer", headers: { Authorization: `Bearer ${apiKey}` } },
      { label: "Raw", headers: { Authorization: `${apiKey}` } },
      { label: "Token", headers: { Authorization: `Token ${apiKey}` } },
    ];

    // try both urls with all auth variants until one succeeds
    const attempts: any[] = [];
    const urls = [
      { label: "calendar", url: calendarUrl },
      { label: "availability", url: availabilityUrl },
    ];

    for (const u of urls) {
      for (const a of authVariants) {
        const res = await fetch(u.url, {
          headers: {
            ...a.headers,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        const text = await res.text();
        let json: any = null;
        try {
          json = JSON.parse(text);
        } catch {
          json = { raw: text };
        }

        attempts.push({ endpoint: u.label, auth: a.label, status: res.status });

        if (res.ok) {
          return NextResponse.json(
            {
              success: true,
              endpoint: u.label,
              auth: a.label,
              status: res.status,
              data: json,
              debug: { attempts },
            },
            { status: 200 }
          );
        }
      }
    }

    // if none worked:
    return NextResponse.json(
      {
        success: false,
        error: "All Hostaway auth/endpoint attempts failed",
        debug: { attempts, calendarUrl, availabilityUrl },
      },
      { status: 403 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
