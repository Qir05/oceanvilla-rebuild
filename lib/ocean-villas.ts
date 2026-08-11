/**
 * lib/ocean-villas.ts
 *
 * Single source of truth for Ocean Villas at Turtle Bay.
 * Safe to import from both client components and server-side API routes.
 *
 * To add a new villa:     add its Hostaway listing ID to OCEAN_VILLA_LISTING_IDS below.
 * To switch booking domain: set HOSTAWAY_BOOKING_ENGINE_BASE_URL in your .env —
 *                            the API already returns it as `bookingEngineBase` on listings.
 *
 * ── Data precedence model ───────────────────────────────────────────────
 * Tier 1 — Hostaway API: source of truth for inventory, availability, rates,
 *          photos, listing identifiers, and base listing content.
 * Tier 2 — lib/villaCompliance.ts: narrowly scoped, licensing-mandated
 *          occupancy corrections that supersede Tier 1 for display purposes
 *          only. VILLA_STAT_OVERRIDES.maxGuests below is derived from it.
 * Tier 3 — VILLA_DETAILS (this file) and other local marketing copy: never
 *          overrides a factual field from Tier 1 or Tier 2.
 */

import { getVillaCompliance } from "./villaCompliance";

/**
 * Canonical Ocean Villa listing IDs.
 * This array is the single place to update when a villa is added or removed.
 * Consumed by:
 *   app/api/hostaway/search/route.ts   — availability search
 *   app/api/hostaway/featured/route.ts — env-var fallback
 *   app/page.tsx                       — homepage featured cards
 *   app/rentals/page.tsx               — rentals collection
 *   app/availability/page.tsx          — availability fallback listing
 */
export const OCEAN_VILLA_LISTING_IDS = [
  "489089",
  "489092",
  "489093",
  "489094",
  "489095",
  "489097",
  "505671",
] as const;

export type OceanVillaListingId = (typeof OCEAN_VILLA_LISTING_IDS)[number];

/**
 * Correct guest capacity, bedroom, and bathroom counts for listings where
 * Hostaway's stored values differ from the actual property configuration.
 *
 * `maxGuests` for any listing ID that also appears in lib/villaCompliance.ts
 * is DERIVED from that file's `licensedMaxOccupancy` (Tier 2) rather than
 * hand-typed here, so occupancy is never independently maintained in two
 * places for the same villa. Only bathroom/bedroom corrections, and
 * maxGuests for listings with no compliance entry, are set manually below.
 *
 * "489097" — Combined 2-in-1 unit: now has a full lib/villaCompliance.ts
 *             entry (licensedMaxOccupancy 12, two license records), so its
 *             maxGuests below is derived like every other listing — this
 *             manual override now only covers the bathroom count, since
 *             Hostaway's own bathroomsNumber for this listing (2) differs
 *             from the actual physical configuration (3).
 */
const MANUAL_STAT_OVERRIDES: Record<
  string,
  { maxGuests?: number; bedrooms?: number; bathrooms?: number }
> = {
  "489097": { bathrooms: 3 },
};

export const VILLA_STAT_OVERRIDES: Record<
  string,
  { maxGuests?: number; bedrooms?: number; bathrooms?: number }
> = Object.fromEntries(
  OCEAN_VILLA_LISTING_IDS.map((id) => {
    const manual = MANUAL_STAT_OVERRIDES[id] ?? {};
    const enforcedGuests = getVillaCompliance(id)?.licensedMaxOccupancy;
    return [
      id,
      {
        ...manual,
        ...(enforcedGuests != null ? { maxGuests: enforcedGuests } : {}),
      },
    ];
  })
);

/**
 * Largest resolved maxGuests across every villa (currently 12, from the
 * combined 489097 unit) — for guest pickers that aren't scoped to one
 * specific villa yet (global availability search, the homepage widget, the
 * generic contact form). A villa-specific picker (the listing page booking
 * card) must use that listing's own resolved capacity instead of this.
 */
export const MAX_SITE_GUEST_CAPACITY = Math.max(
  ...OCEAN_VILLA_LISTING_IDS.map((id) => VILLA_STAT_OVERRIDES[id]?.maxGuests ?? 0)
);

/**
 * Server-side drift check (Section 3.6): compares the raw guest capacity
 * Hostaway returns for a listing against the enforced Tier 2 compliance
 * value. Hostaway typically syncs to Airbnb/VRBO/Booking.com, so a silent
 * mismatch here means those channels could still be advertising a stale,
 * non-compliant number even after this site is corrected. Never throws —
 * logs a warning for the operations team to fix inside Hostaway itself.
 */
export function checkOccupancyDrift(listingId: string, hostawayValue: number | null | undefined) {
  const enforced = VILLA_STAT_OVERRIDES[listingId]?.maxGuests;
  if (enforced == null || hostawayValue == null) return;
  if (Number(hostawayValue) !== enforced) {
    console.warn(
      `[occupancy-drift] Listing ${listingId}: Hostaway returns ${hostawayValue} guests, but the enforced ` +
        `compliance value is ${enforced}. Update this listing's capacity in Hostaway (it typically syncs to ` +
        `Airbnb/VRBO/Booking.com) to prevent those channels from advertising a stale, non-compliant figure.`
    );
  }
}

/**
 * Editorial / descriptive villa details that are NOT available from the
 * Hostaway API and have not yet been verified for every villa.
 *
 * Every field is optional and starts unset. Populate a field only once you
 * have verified, factual data for that specific villa — the UI (rentals
 * filters, comparison table, card badges) is built to gracefully hide any
 * filter or field with zero populated values across all villas, rather than
 * guessing. Do not infer view, floor, or ground-floor status from a villa's
 * name or unit number.
 *
 * `editorialLabels` should only ever contain labels you can factually stand
 * behind for that specific villa (e.g. "Ground-Floor Convenience" once
 * `groundFloor: true` is confirmed). Labels driven purely by verified
 * Hostaway numbers (guest capacity) are computed separately in the rentals
 * UI and do not need to be listed here.
 */
export type VillaDetail = {
  /** e.g. "Ocean View", "Partial Ocean View", "Garden View" — leave unset until confirmed. */
  view?: string;
  /** e.g. "Ground Floor", "2nd Floor" — leave unset until confirmed. */
  floorLevel?: string;
  /** True only once confirmed the unit has no stairs to the main living level. */
  groundFloor?: boolean;
  /** One short, factual differentiator shown on the villa card (e.g. "Steps from the beach path"). */
  shortFeature?: string;
  /** Manually curated labels this villa has verified support for. */
  editorialLabels?: string[];
};

export const VILLA_DETAILS: Record<string, VillaDetail> = {
  // "489089": { view: "Ocean View", floorLevel: "Ground Floor", groundFloor: true, ... },
  // Populate as verified villa-specific data becomes available.
};

export function getVillaDetail(listingId: string): VillaDetail {
  return VILLA_DETAILS[listingId] ?? {};
}

/**
 * Build a Hostaway booking engine URL for a specific listing.
 *
 * `base` is the value returned by /api/hostaway/listings as `bookingEngineBase`,
 * which the server reads from HOSTAWAY_BOOKING_ENGINE_BASE_URL. Passing dates
 * and guests pre-fills the Hostaway booking widget for a smoother handoff.
 *
 * Usage:
 *   buildBookingUrl("489089", listing.bookingEngineBase)
 *   buildBookingUrl("489089", listing.bookingEngineBase, { startDate, endDate, guests: 4 })
 */
export function buildBookingUrl(
  listingId: string,
  base?: string | null,
  opts?: { startDate?: string; endDate?: string; guests?: string | number }
): string {
  const resolved = (base || "https://182003_1.holidayfuture.com").replace(/\/$/, "");
  let url = `${resolved}/listings/${encodeURIComponent(listingId)}`;
  const params = new URLSearchParams();
  if (opts?.startDate) params.set("startDate", opts.startDate);
  if (opts?.endDate) params.set("endDate", opts.endDate);
  if (opts?.guests) params.set("adults", String(opts.guests));
  const qs = params.toString();
  if (qs) url += `?${qs}`;
  return url;
}
