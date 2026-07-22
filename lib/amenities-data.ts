/**
 * lib/amenities-data.ts
 *
 * Single source of truth for amenity claims shown across the homepage,
 * /amenities, /rentals, individual villa pages, and FAQs — so wording stays
 * consistent and so resort-provided amenities are never presented as
 * confirmed Ocean Villas inclusions without a caveat.
 *
 * Categories:
 *  - INCLUDED_ALL_VILLAS   Provided by the villa itself, every unit.
 *  - SELECTED_VILLAS_ONLY  Only some villas have this — populate per-villa
 *                          once verified (see VILLA_DETAILS in ocean-villas.ts).
 *  - BOOKING_AND_SERVICE   About the booking process itself, not the unit.
 *  - RITZ_CARLTON_RESORT   Provided by Turtle Bay / Ritz-Carlton, NOT Ocean
 *                          Villas — access terms are not yet verified, so
 *                          every entry here is rendered with a caveat rather
 *                          than as a confirmed inclusion.
 *  - NOT_INCLUDED          Confirmed exclusions. Empty until verified.
 */

export type AmenityItem = {
  name: string;
  note?: string;
};

export type ResortAmenityItem = AmenityItem & {
  requiresReservation?: boolean;
  requiresDayPass?: boolean;
  requiresFee?: boolean;
  /** Set true only once access terms have been confirmed in writing with Turtle Bay / Ritz-Carlton. */
  verified: boolean;
};

export const AMENITIES_LIVING_COMFORT: AmenityItem[] = [
  { name: "Fully equipped gourmet kitchen" },
  { name: "High-speed WiFi throughout" },
  { name: "Central air conditioning" },
  { name: "Premium bed linens and towels" },
  { name: "Smart TV with streaming services" },
  { name: "Washer and dryer in unit" },
];

export const AMENITIES_OUTDOOR_PROPERTY: AmenityItem[] = [
  { name: "Private lanai or terrace" },
  { name: "Ocean or garden views", note: "View varies by villa — check the individual listing page." },
  { name: "BBQ grill" },
  { name: "Beach gear (chairs, umbrellas, snorkel sets)" },
  { name: "Surf storage and rinse station" },
  { name: "Secure keyless entry" },
  { name: "Dedicated parking space" },
  { name: "Walkable to Turtle Bay beach" },
  { name: "Close to North Shore dining and surf breaks" },
  { name: "Pet policy varies by villa", note: "Check the individual listing page for details." },
];

/**
 * Amenities confirmed for specific villas only. Empty until a villa's
 * VILLA_DETAILS entry (lib/ocean-villas.ts) documents which units have it.
 */
export const AMENITIES_SELECTED_VILLAS_ONLY: AmenityItem[] = [];

export const AMENITIES_BOOKING_AND_SERVICE: AmenityItem[] = [
  { name: "Direct booking via Hostaway", note: "No third-party platform markups." },
  { name: "Live availability and pricing", note: "Sourced directly from Hostaway." },
  { name: "Flexible check-in / check-out", note: "Exact times vary by villa — confirmed at booking." },
  { name: "Professional housekeeping" },
  { name: "Local guest support" },
  { name: "Secure Hostaway checkout" },
];

export const AMENITIES_RITZ_CARLTON_RESORT: ResortAmenityItem[] = [
  {
    name: "Resort pool access",
    verified: false,
    note: "Provided by Turtle Bay Resort, not Ocean Villas. Access terms have not yet been confirmed — check with our local team before your stay.",
  },
  {
    name: "Resort concierge access",
    verified: false,
    note: "Provided by Turtle Bay Resort, not Ocean Villas. Access terms have not yet been confirmed — check with our local team before your stay.",
  },
];

/** Confirmed exclusions. Populate once verified — do not guess. */
export const AMENITIES_NOT_INCLUDED: AmenityItem[] = [];

export const AMENITIES_DISCLAIMER =
  "Amenities marked as Turtle Bay Resort / Ritz-Carlton are provided by the resort, not Ocean Villas at Turtle Bay directly, and may require a reservation, day pass, or additional fee. Confirm current access terms with our local team before your stay if resort access matters to your plans.";
