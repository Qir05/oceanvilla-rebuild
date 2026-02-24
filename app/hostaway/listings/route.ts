import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.HOSTAWAY_API_KEY;
    const ids = process.env.OCEANVILLAS_LISTING_IDS;

    if (!apiKey) return NextResponse.json({ error: "64ada9b1d5c754230144041464fd677762368537142a8926071f7ce428ac2234" }, { status: 500 });
    if (!ids) return NextResponse.json({ error: "489089,489093,489095,489097,489092,
489094" }, { status: 500 });

    const listingIds = ids.split(",").map((s) => s.trim()).filter(Boolean);

    // NOTE: endpoint may vary by Hostaway setup; this is the common pattern
    const res = await fetch(`https://api.hostaway.com/v1/listings`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();

    // Filter down to only the IDs we want
    const all = data?.result || data?.data || data;
    const filtered = Array.isArray(all)
      ? all.filter((l: any) => listingIds.includes(String(l.id)))
      : all;

    return NextResponse.json({ success: true, listingIds, data: filtered }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
