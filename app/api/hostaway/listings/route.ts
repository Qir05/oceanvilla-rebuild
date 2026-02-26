// app/api/hostaway/listing/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Required: id" }, { status: 400 });
  }

  // Call the canonical endpoint:
  const base = new URL(req.url);
  const url = `${base.origin}/api/hostaway/listings/${encodeURIComponent(id)}`;

  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();

  // pass-through
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
  });
}
