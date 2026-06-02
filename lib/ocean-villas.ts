/**
 * lib/ocean-villas.ts
 *
 * Single source of truth for Ocean Villas at Turtle Bay.
 * Safe to import from both client components and server-side API routes.
 *
 * To add a new villa:     add its Hostaway listing ID to OCEAN_VILLA_LISTING_IDS below.
 * To switch booking domain: set HOSTAWAY_BOOKING_ENGINE_BASE_URL in your .env —
 *                            the API already returns it as `bookingEngineBase` on listings.
 */

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
 * "489097" — Combined 2-in-1 (Honeymoon + Ohana): Hostaway has 2 baths / 8 guests;
 *             actual configuration is 3 bathrooms, sleeps 12.
 * "505671" — The View Villa: Hostaway has 8 guests; actual capacity is 10.
 */
export const VILLA_STAT_OVERRIDES: Record<
  string,
  { maxGuests?: number; bedrooms?: number; bathrooms?: number }
> = {
  "489097": { maxGuests: 12, bathrooms: 3 },
  "505671": { maxGuests: 10 },
};

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
