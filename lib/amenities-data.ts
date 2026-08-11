/**
 * lib/amenities-data.ts
 *
 * Single source of truth for amenity claims shown across the homepage,
 * /amenities, /rentals, individual villa pages, and FAQs — so wording stays
 * consistent and so resort-provided amenities are never presented as
 * confirmed Ocean Villas inclusions without a caveat.
 *
 * The four EXPERIENCE_* groups below are a guest-experience-oriented split of
 * what used to be two feature-oriented groups (comfort items vs. outdoor/
 * property items) — every item value carried over 1:1, none invented, none
 * dropped. Items without a `note` are asserted the same way they always were:
 * included with every villa. Only "Ocean or garden views" and "Pet policy"
 * carry a per-villa caveat, matching how they were already flagged before
 * this reorganization — that distinction (confirmed-universal vs.
 * confirmed-varies) is preserved exactly, not re-decided here.
 *
 * Categories:
 *  - EXPERIENCE_RELAX_COMFORT    Indoor comfort/convenience — "Relax in Luxury".
 *  - EXPERIENCE_COOK_GATHER      Kitchen/dining — "Cook, Gather & Celebrate".
 *  - EXPERIENCE_BEACH_DAYS       Beach-day essentials — "Beach Days Made Easy".
 *  - EXPERIENCE_ISLAND_LIVING    Lanai/views/outdoor — "Indoor Comfort Meets Island Living".
 *  - SELECTED_VILLAS_ONLY        Only some villas have this — populate per-villa
 *                                 once verified (see VILLA_DETAILS in ocean-villas.ts).
 *  - BOOKING_AND_SERVICE         About the booking process itself, not the unit.
 *  - RITZ_CARLTON_RESORT         Provided by Turtle Bay / Ritz-Carlton, NOT Ocean
 *                                 Villas — access terms are not yet verified, so
 *                                 every entry here is rendered with a caveat rather
 *                                 than as a confirmed inclusion.
 *  - NOT_INCLUDED                 Confirmed exclusions. Empty until verified.
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

// 🔧 VERIFY: every item below without a `note` is asserted as included with
// every villa. That universality claim is inherited unchanged from the data
// as it existed before this reorganization (made by someone with access to
// the properties) — it has not been independently re-confirmed against all
// seven villas in this session. Only "Ocean or garden views" and "Pet
// policy" carry a per-villa caveat, matching how they were already flagged.
// Treat non-hedged items as an open confirmation request to the client, not
// as independently verified fact.

export const AMENITIES_RELAX_COMFORT: AmenityItem[] = [
  { name: "High-speed WiFi throughout" },
  { name: "Central air conditioning" },
  { name: "Premium bed linens and towels" },
  { name: "Smart TV with streaming services" },
  { name: "Washer and dryer in unit" },
  { name: "Secure keyless entry" },
  { name: "Dedicated parking space" },
  { name: "Pet policy varies by villa", note: "Check the individual listing page for details." },
];

export const AMENITIES_COOK_GATHER: AmenityItem[] = [
  { name: "Fully equipped gourmet kitchen" },
];

export const AMENITIES_BEACH_DAYS: AmenityItem[] = [
  { name: "Beach gear (chairs, umbrellas, snorkel sets)" },
  { name: "Surf storage and rinse station" },
];

export const AMENITIES_ISLAND_LIVING: AmenityItem[] = [
  { name: "Private lanai or terrace" },
  { name: "Ocean or garden views", note: "View varies by villa — check the individual listing page." },
  { name: "BBQ grill" },
  { name: "Walkable to Turtle Bay beach" },
  { name: "Close to North Shore dining and surf breaks" },
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
