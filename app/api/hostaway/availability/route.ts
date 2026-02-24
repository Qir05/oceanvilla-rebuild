import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const apiKey = process.env.HOSTAWAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing HOSTAWAY_API_KEY" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listingId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!listingId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Required: listingId, startDate, endDate" },
        { status: 400 }
      );
    }

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

    const data = await res.json();
    return NextResponse.json(
      { success: res.ok, status: res.status, data },
      { status: res.ok ? 200 : res.status }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
