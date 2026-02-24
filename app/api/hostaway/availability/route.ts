import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const apiKey = process.env.HOSTAWAY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing HOSTAWAY_API_KEY" },
        { status: 500 }
      );
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

    const res = await fetch(
      `https://api.hostaway.com/v1/availability?listingId=${encodeURIComponent(
        listingId
      )}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(
        endDate
      )}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await res.json();

    return NextResponse.json(
      { success: true, status: res.status, data },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
