// components/villas/types.ts
//
// Shared types for the /rentals browse, filter, sort, and compare experience.

export type RentalListing = {
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
  images?: string[];
  amenities?: string[];
  bookingEngineBase?: string;

  // Enriched client-side from lib/ocean-villas.ts VILLA_DETAILS — unset until verified.
  view?: string;
  floorLevel?: string;
  groundFloor?: boolean;
  shortFeature?: string;
  editorialLabels?: string[];

  // Enriched client-side from /api/hostaway/pricing — omitted when unavailable.
  minNightlyPrice?: number;
  hasPricing?: boolean;

  // Only set when the guest arrived with an actual date range (deep link or
  // /availability search) — omitted otherwise, since availability isn't a
  // knowable fact without dates.
  isAvailable?: boolean;
};

export type VillaFilters = {
  bedroomsMin: number | null;
  guestsMin: number | null;
  oceanViewOnly: boolean;
  groundFloorOnly: boolean;
  priceMin: number | null;
  priceMax: number | null;
};

export const DEFAULT_FILTERS: VillaFilters = {
  bedroomsMin: null,
  guestsMin: null,
  oceanViewOnly: false,
  groundFloorOnly: false,
  priceMin: null,
  priceMax: null,
};

export function hasActiveFilters(filters: VillaFilters): boolean {
  return (
    filters.bedroomsMin !== null ||
    filters.guestsMin !== null ||
    filters.oceanViewOnly ||
    filters.groundFloorOnly ||
    filters.priceMin !== null ||
    filters.priceMax !== null
  );
}

export type VillaSort = "recommended" | "price_low" | "price_high" | "bedrooms" | "guests";

export const SORT_OPTIONS: { value: VillaSort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "bedrooms", label: "Most Bedrooms" },
  { value: "guests", label: "Guest Capacity" },
];

export function filterListings(listings: RentalListing[], filters: VillaFilters): RentalListing[] {
  return listings.filter((l) => {
    if (filters.bedroomsMin !== null && (l.bedrooms ?? 0) < filters.bedroomsMin) return false;
    if (filters.guestsMin !== null && (l.maxGuests ?? 0) < filters.guestsMin) return false;
    if (filters.oceanViewOnly && !/ocean/i.test(l.view ?? "")) return false;
    if (filters.groundFloorOnly && l.groundFloor !== true) return false;
    if (filters.priceMin !== null && (l.minNightlyPrice ?? Infinity) < filters.priceMin) return false;
    if (filters.priceMax !== null && (l.minNightlyPrice ?? -Infinity) > filters.priceMax) return false;
    return true;
  });
}

export function sortListings(listings: RentalListing[], sort: VillaSort): RentalListing[] {
  const arr = [...listings];
  switch (sort) {
    case "price_low":
      return arr.sort((a, b) => (a.minNightlyPrice ?? Infinity) - (b.minNightlyPrice ?? Infinity));
    case "price_high":
      return arr.sort((a, b) => (b.minNightlyPrice ?? -Infinity) - (a.minNightlyPrice ?? -Infinity));
    case "bedrooms":
      return arr.sort((a, b) => (b.bedrooms ?? 0) - (a.bedrooms ?? 0));
    case "guests":
      return arr.sort((a, b) => (b.maxGuests ?? 0) - (a.maxGuests ?? 0));
    case "recommended":
    default:
      return arr;
  }
}

/** Conservative, data-backed labels computed straight from verified Hostaway fields. */
export function computeAutoLabels(listing: RentalListing): string[] {
  const labels: string[] = [];
  if (typeof listing.maxGuests === "number") {
    if (listing.maxGuests >= 8) labels.push("Great for Groups");
    else if (listing.maxGuests <= 4) labels.push("Best for Couples");
  }
  return labels;
}
