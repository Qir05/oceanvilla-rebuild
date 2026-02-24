import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.HOSTAWAY_API_KEY;
    const ids = process.env.OCEANVILLAS_LISTING_IDS;

    // NEVER put real keys/ids in code. Keep them in Vercel env vars only.
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing HOSTAWAY_API_KEY" },
        { status: 500 }
      );
    }

    if (!ids) {
      return NextResponse.json(
        { error: "Missing OCEANVILLAS_LISTING_IDS" },
        { status: 500 }
      );
    }

    // Supports "489089,489093,..." (comma-separated)
    const listingIds = ids
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch("https://api.hostaway.com/v1/listings", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();

    // Normalize possible response shapes
    const all = data?.result || data?.data || data;

    const filtered = Array.isArray(all)
      ? all.filter((l: any) => listingIds.includes(String(l?.id)))
      : all;

    return NextResponse.json(
      { success: true, listingIds, data: filtered },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
