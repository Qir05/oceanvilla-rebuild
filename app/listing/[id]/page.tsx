"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

type HostawayListing = {
  id: string;
  name: string;
  description?: string;
  city?: string;
  state?: string;
  country?: string;
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  heroUrl?: string;
  bookingEngineBase?: string;
};

function clampText(s?: string, max = 500) {
  const clean = (s || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trimEnd() + "…";
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-4 text-center">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
        {label}
      </div>
      <div className="mt-1 text-base font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default function ListingDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = useMemo(() => {
    const raw = params?.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const guests = searchParams.get("guests") || "2";

  const [listing, setListing] = useState<HostawayListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!id) {
        setError("Missing listing ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/hostaway/listings?id=${encodeURIComponent(id)}`, {
          cache: "no-store",
        });

        const json = await res.json().catch(() => null);

        if (!res.ok || !json?.success || !json?.listing) {
          throw new Error("Listing not found.");
        }

        if (!alive) return;
        setListing(json.listing as HostawayListing);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load listing.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [id]);

  const backHref =
    startDate && endDate
      ? `/availability?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(
          endDate
        )}&guests=${encodeURIComponent(guests)}`
      : "/rentals";

  const bookUrl = listing
    ? `${(listing.bookingEngineBase || "https://182003_1.holidayfuture.com").replace(/\/$/, "")}/listings/${encodeURIComponent(
        listing.id
      )}`
    : "#";

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="text-center text-slate-500">Loading villa details...</div>
        </div>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h1 className="text-2xl font-serif text-red-800">Unable to load villa</h1>
            <p className="mt-4 text-red-700">{error || "Listing not found."}</p>
            <div className="mt-6">
              <Link
                href={backHref}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Go Back
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const title = listing.name || `Villa ${listing.id}`;
  const subtitle = listing.city
    ? `${listing.city}${listing.state ? `, ${listing.state}` : ""}`
    : "Turtle Bay · North Shore, Oahu";

  const description =
    clampText(listing.description, 1200) ||
    "Explore this Ocean Villas property at Turtle Bay and continue directly into booking.";

  const hero = listing.heroUrl || "/media/rentals/placeholder.jpg";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link
            href={backHref}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            ← Back
          </Link>
          <span className="text-sm font-medium text-slate-500">Ocean Villas at Turtle Bay</span>
        </div>
      </header>

      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
              <div className="relative aspect-[4/3] bg-slate-100">
                <Image
                  src={hero}
                  alt={`${title} at Turtle Bay`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Villa #{listing.id}
              </div>

              <h1 className="mt-5 text-4xl md:text-5xl font-serif font-medium tracking-tight text-slate-900">
                {title}
              </h1>

              <p className="mt-3 text-base text-slate-500">{subtitle}</p>

              {(startDate && endDate) ? (
                <div className="mt-4 text-sm text-slate-600">
                  Selected stay:{" "}
                  <span className="font-semibold text-slate-900">{startDate}</span> →{" "}
                  <span className="font-semibold text-slate-900">{endDate}</span>{" "}
                  <span className="text-slate-300">•</span>{" "}
                  <span className="font-semibold text-slate-900">{guests} guests</span>
                </div>
              ) : null}

              <div className="mt-8 grid grid-cols-3 gap-3">
                <Stat label="Sleeps" value={`${listing.maxGuests ?? "-"}`} />
                <Stat label="Beds" value={`${listing.bedrooms ?? "-"}`} />
                <Stat label="Baths" value={`${listing.bathrooms ?? "-"}`} />
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-slate-900">About this villa</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href={backHref}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
                >
                  Back to Browse
                </Link>

                <a
                  href={bookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
                >
                  Book Direct
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
