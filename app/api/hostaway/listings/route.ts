// app/api/hostaway/listings/route.ts
import { NextResponse } from "next/server";
import { fetchHostawayListing } from "@/lib/hostaway-listing";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing listing ID" }, { status: 400 });
    }

    const result = await fetchHostawayListing(id);

    if (result.status === "not_found") {
      return NextResponse.json(
        { success: false, error: "Listing not found in Hostaway", debug: { id } },
        { status: 404 }
      );
    }

    if (result.status === "error") {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, listing: result.listing }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
