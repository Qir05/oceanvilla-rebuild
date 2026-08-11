/**
 * lib/villaCompliance.ts
 *
 * Static Tax Map Key (TMK), Transient Accommodations (TA) registration, and
 * occupancy compliance details for Ocean Villas at Turtle Bay, sourced from
 * the licensing coordinator's official table (supplied 2026-08-10) plus
 * later written corrections — see the per-listing 🔧 VERIFY notes below for
 * where those two sources disagree.
 *
 * Keyed by Hostaway listing ID — the same permanent identifier already used
 * as the canonical key throughout lib/ocean-villas.ts (OCEAN_VILLA_LISTING_IDS,
 * VILLA_STAT_OVERRIDES) and as `listing.id` in the listing detail page. This
 * data is independent of the live Hostaway API response and must never be
 * merged into, or derived from, it.
 *
 * ── Tier 2 of the data precedence model (see lib/ocean-villas.ts) ──────────
 * `licensedMaxOccupancy` here is the single authoritative occupancy figure
 * for every listing that has an entry in this file — lib/ocean-villas.ts
 * derives VILLA_STAT_OVERRIDES.maxGuests from it instead of duplicating the
 * number, so occupancy is never independently maintained in two places for
 * the same villa. Every occupancy correction below must state: the villa,
 * the field, the enforced value, the reason, and the date supplied.
 *
 * ── Licensed maximum vs. physical sleeping capacity ─────────────────────
 * These are deliberately two different concepts, not two numbers that
 * should agree:
 *   - `licensedMaxOccupancy` — the regulator-mandated published figure. The
 *     ONLY number that may ever appear as a guest capacity anywhere: on the
 *     page, in metadata, in a guest picker, or as JSON-LD `occupancy`.
 *   - Physical sleeping capacity — the sum of `sleepingSpaces[].guests`,
 *     computed by getPhysicalSleepingCapacity() below, never stored
 *     separately. Descriptive only, never presented as a bookable number.
 *     For Villa 218 these differ by regulatory design (see its entry) —
 *     that is correct, not a data bug, and must not be "fixed" by changing
 *     either number to match the other.
 */

export type SleepingSpaceType = "bedroom" | "living_area";

/**
 * A single physical sleeping space. `type` exists specifically so a living
 * room with a sofa bed is never counted, labeled, or emitted in JSON-LD as a
 * bedroom — only `type: "bedroom"` entries count toward a bedroom count.
 * `beds` backs the "no space sleeps more than 2 guests unless it physically
 * has more than one bed" rule.
 *
 * `adults`/`children` split: per an explicit rule from the licensing
 * coordinator ("Di kasi pwede mag-exceed sa 2 adults per bedroom"), every
 * sleeping space with `guests: 4` across every villa is represented as 2
 * adults + 2 children, never 4 undifferentiated adults — a room may not
 * house more than 2 adults. Every 2-guest space is left unset (adults not
 * inferred as 2 for those, since there's nothing to disambiguate).
 */
export interface SleepingSpace {
  label: string;
  type: SleepingSpaceType;
  guests: number;
  beds: number;
  adults?: number;
  children?: number;
}

/** One TMK + TA registration pairing. A listing can carry more than one —
 * see 489097 below, which combines two separately-licensed units. */
export interface LicenseRecord {
  unit: string;
  taxMapKey: string;
  tat: string;
}

export interface VillaComplianceDetails {
  unit: string;
  /** One or more license records. Single-unit villas hold a list of one —
   * render code must treat every listing uniformly and never special-case
   * a "combined" listing by list length. */
  licenses: LicenseRecord[];
  licensedMaxOccupancy: number;
  /** Structured breakdown. Optional only in the sense that TypeScript can't
   * force every entry to have one — every listing below has one, sourced
   * from the licensing coordinator's table. */
  sleepingSpaces?: SleepingSpace[];
  /** Plain-language sentence for guest-facing copy. Never use "bed
   * capacity" here — that phrase describes the internal/regulatory
   * distinction, not something a guest booking a room needs to parse. */
  occupancySummary: string;
}

export const VILLA_COMPLIANCE: Record<string, VillaComplianceDetails> = {
  "489093": {
    // Villa 111 — confirmed: Hostaway reports 3 bedrooms for this listing,
    // matching the 3 bedroom-type spaces below exactly (the living room is
    // correctly excluded from Hostaway's own bedroom count too).
    unit: "Villa 111",
    licenses: [{ unit: "Villa 111", taxMapKey: "570010130011", tat: "TA-069-519-9744-01" }],
    licensedMaxOccupancy: 8,
    sleepingSpaces: [
      { label: "Bedroom 1", type: "bedroom", guests: 2, beds: 1 },
      { label: "Bedroom 2", type: "bedroom", guests: 2, beds: 1 },
      { label: "Bedroom 3", type: "bedroom", guests: 2, beds: 1 },
      { label: "Living room (sofa bed)", type: "living_area", guests: 2, beds: 1 },
    ],
    occupancySummary: "2 guests in each of 3 bedrooms, plus 2 guests in the living room sofa bed.",
  },
  "489094": {
    // Villa 119 — confirmed: Hostaway reports 3 bedrooms, matching exactly.
    // 🔒 MYRA RULE — a bedroom sleeping 4 is represented as 2 adults + 2
    // children, never 4 undifferentiated adults: "Di kasi pwede mag-exceed
    // sa 2 adults per bedroom." Applied here to the bunk bed room. Supplied
    // 2026-08-11.
    unit: "Villa 119",
    licenses: [{ unit: "Villa 119", taxMapKey: "570010130019", tat: "TA-157-647-8720-01" }],
    licensedMaxOccupancy: 8,
    sleepingSpaces: [
      { label: "Master bedroom", type: "bedroom", guests: 2, beds: 1 },
      { label: "Queen bedroom", type: "bedroom", guests: 2, beds: 1 },
      { label: "Bunk bed room", type: "bedroom", guests: 4, beds: 2, adults: 2, children: 2 },
    ],
    occupancySummary:
      "2 guests each in the master and queen bedrooms, and 4 guests (2 adults + 2 children) in the bunk bed room.",
  },
  "489092": {
    // Villa 120 — confirmed: Hostaway reports 1 bedroom, matching exactly
    // (the living room sofa bed is correctly excluded).
    unit: "Villa 120",
    licenses: [{ unit: "Villa 120", taxMapKey: "570010130020", tat: "TA-157-647-8720-01" }],
    licensedMaxOccupancy: 4,
    sleepingSpaces: [
      { label: "Bedroom", type: "bedroom", guests: 2, beds: 1 },
      { label: "Living room (sofa bed)", type: "living_area", guests: 2, beds: 1 },
    ],
    occupancySummary: "2 guests in the bedroom, plus 2 guests in the living room sofa bed.",
  },
  "489089": {
    // Villa 218 — confirmed: Hostaway reports 4 bedrooms, matching the 4
    // bedroom-type spaces below exactly. This resolves the previously open
    // question of an "unaccounted 4th bedroom": the coordinator's fuller
    // table (supplied after the initial 10-guest correction) shows Villa
    // 218 has TWO master bedrooms, not one — an earlier answer in this
    // codebase stating "one master bedroom" was wrong.
    //
    // 🔒 REGULATORY DESIGN, NOT A DATA BUG — Villa 218's physical sleeping
    // capacity (12: getPhysicalSleepingCapacity() below) and its licensed
    // maximum occupancy (10) are DELIBERATELY different numbers. The Hawaii
    // Department of Planning and Permitting requires the advertised/bookable
    // figure to be 10 despite the villa physically sleeping 12, and permits
    // the 2-guest surplus to be disclosed in the room breakdown as children
    // (see the double-queen and bunk room composition below). Do not make
    // these numbers match — 10 is what may ever appear as a guest capacity
    // anywhere on the site; 12 must never appear as one. Supplied by the
    // licensing coordinator 2026-08-10.
    unit: "Villa 218",
    licenses: [{ unit: "Villa 218", taxMapKey: "570010130039", tat: "TA-157-647-8720-01" }],
    licensedMaxOccupancy: 10,
    sleepingSpaces: [
      { label: "Master bedroom 1", type: "bedroom", guests: 2, beds: 1, adults: 2, children: 0 },
      { label: "Master bedroom 2", type: "bedroom", guests: 2, beds: 1, adults: 2, children: 0 },
      { label: "Double queen bedroom", type: "bedroom", guests: 4, beds: 2, adults: 2, children: 2 },
      { label: "Bunk bed room", type: "bedroom", guests: 4, beds: 2, adults: 2, children: 2 },
    ],
    occupancySummary:
      "Licensed for 10 guests. The villa has two master bedrooms (2 guests each), a double queen bedroom, and a bunk bed room — see the room breakdown for the full, licensing-approved configuration.",
  },
  "505671": {
    // Villa 304 — confirmed: Hostaway reports 4 bedrooms, matching 4 × 2 = 8
    // exactly.
    //
    // 🔧 VERIFY — UNRESOLVED CONFLICT: the licensing coordinator's official
    // table states a licensed maximum of 10 for this unit. The coordinator
    // later stated in writing that the correct figure is 8 (2 guests in
    // each of the 4 bedrooms). 8 is published here because it is the more
    // recent, explicit correction and matches what Hostaway itself returns
    // for this listing — but the two coordinator sources disagree, and the
    // official table has not been updated to reflect the correction. This
    // must be confirmed at the source (the table corrected or the 8-guest
    // correction reconfirmed) before being treated as fully settled.
    unit: "Villa 304",
    licenses: [{ unit: "Villa 304", taxMapKey: "570010130043", tat: "TA-157-842-1760-01" }],
    licensedMaxOccupancy: 8,
    sleepingSpaces: [
      { label: "Bedroom 1", type: "bedroom", guests: 2, beds: 1 },
      { label: "Bedroom 2", type: "bedroom", guests: 2, beds: 1 },
      { label: "Bedroom 3", type: "bedroom", guests: 2, beds: 1 },
      { label: "Bedroom 4", type: "bedroom", guests: 2, beds: 1 },
    ],
    occupancySummary: "2 guests in each of 4 bedrooms.",
  },
  "489095": {
    // Villa 318 — confirmed: Hostaway reports 4 bedrooms, matching 3
    // standard + 1 double queen exactly. This bedroom count was previously
    // only backed out arithmetically from the total (2+2+2+4=10) with no
    // independent confirmation; it's now corroborated by Hostaway's own
    // bedroomsNumber for this listing, though which specific bedroom is the
    // "double queen" is still not confirmed room-by-room.
    // 🔒 MYRA RULE — double queen bedroom explicitly confirmed as 2 adults +
    // 2 children ("2 for each bedroom, 4 in double queen bedroom (2 adults +
    // 2 kids)"), not 4 undifferentiated adults. Supplied 2026-08-11.
    unit: "Villa 318",
    licenses: [{ unit: "Villa 318", taxMapKey: "570010130057", tat: "TA-048-529-9712-01" }],
    licensedMaxOccupancy: 10,
    sleepingSpaces: [
      { label: "Standard bedroom", type: "bedroom", guests: 2, beds: 1 },
      { label: "Standard bedroom", type: "bedroom", guests: 2, beds: 1 },
      { label: "Standard bedroom", type: "bedroom", guests: 2, beds: 1 },
      { label: "Double queen bedroom", type: "bedroom", guests: 4, beds: 2, adults: 2, children: 2 },
    ],
    occupancySummary:
      "2 guests in each of 3 standard bedrooms, plus 4 guests (2 adults + 2 children) in the double queen bedroom.",
  },
  "489097": {
    // Combined 2-in-1 unit — licensed maximum 12, reconciling exactly as
    // 8 (Unit 119) + 4 (Unit 120) per the licensing coordinator. Carries
    // both units' TMK/TA records; sleeping spaces are the union of both
    // units' rooms. Hostaway's own bedroomsNumber for this listing is 4,
    // matching the 4 bedroom-type spaces below exactly (3 from Unit 119 +
    // 1 from Unit 120).
    //
    // IDENTITY RESOLVED: this combines Unit 119 ("The Model Villa," licensed
    // 8) and Unit 120 ("Honeymoon Suite," licensed 4), confirmed in writing
    // by the licensing coordinator — 4 guests from the honeymoon unit, 8
    // from the model villa. A prior comment in lib/ocean-villas.ts described
    // this listing as "Honeymoon + Ohana" (Unit 111 instead of 119), which
    // was wrong. The arithmetic alone couldn't distinguish the two pairings
    // because Unit 111 is also licensed at 8, same as Unit 119 — the
    // coordinator's explicit naming of 119 is what resolves it, not the sum.
    //
    // 🔧 VERIFY — HOSTAWAY DRIFT, OPERATIONS ACTION ITEM: Hostaway
    // currently returns 8 guests for this listing (stale/wrong); the
    // enforced value here is 12. Hostaway typically syncs to Airbnb, VRBO,
    // and Booking.com, so those channels may still be advertising 8 for a
    // listing that should show 12 — the reverse of a licensing overage risk,
    // but still a live inventory/revenue accuracy problem. checkOccupancyDrift
    // will keep logging this until Hostaway's own record is corrected.
    unit: "Villa 119 + Villa 120 (Combined)",
    licenses: [
      { unit: "Villa 119", taxMapKey: "570010130019", tat: "TA-157-647-8720-01" },
      { unit: "Villa 120", taxMapKey: "570010130020", tat: "TA-157-647-8720-01" },
    ],
    licensedMaxOccupancy: 12,
    sleepingSpaces: [
      { label: "Master bedroom (Unit 119)", type: "bedroom", guests: 2, beds: 1 },
      { label: "Queen bedroom (Unit 119)", type: "bedroom", guests: 2, beds: 1 },
      { label: "Bunk bed room (Unit 119)", type: "bedroom", guests: 4, beds: 2, adults: 2, children: 2 },
      { label: "Bedroom (Unit 120)", type: "bedroom", guests: 2, beds: 1 },
      { label: "Living room (Unit 120, sofa bed)", type: "living_area", guests: 2, beds: 1 },
    ],
    occupancySummary:
      "Combines Unit 119 (2 guests each in the master and queen bedrooms, 4 guests — 2 adults + 2 children — in the bunk bed room) and Unit 120 (2 guests in the bedroom, plus 2 in the living room sofa bed) for a licensed maximum of 12 guests.",
  },
};

export function getVillaCompliance(listingId: string): VillaComplianceDetails | undefined {
  return VILLA_COMPLIANCE[listingId];
}

/** Sum of every sleeping space's guest count — bedrooms and living areas
 * alike, since this represents total physical capacity, not a bookable
 * figure. Returns 0 if the villa has no structured breakdown yet. */
export function getPhysicalSleepingCapacity(details: VillaComplianceDetails): number {
  if (!details.sleepingSpaces) return 0;
  return details.sleepingSpaces.reduce((total, space) => total + space.guests, 0);
}

/** Count of sleeping spaces that are actually bedrooms — living areas
 * (sofa beds, etc.) never count toward a bedroom count. */
export function countBedroomSpaces(details: VillaComplianceDetails): number {
  if (!details.sleepingSpaces) return 0;
  return details.sleepingSpaces.filter((space) => space.type === "bedroom").length;
}

/**
 * Consistency invariants:
 *  - Licensed maximum occupancy must never exceed physical sleeping capacity
 *    (it may be legitimately lower — see Villa 218)
 *  - No sleeping space may sleep more than 2 guests unless it physically has
 *    more than one bed
 *  - No sleeping space may house more than 2 adults — an explicit rule from
 *    the licensing coordinator, checked only where `adults` is actually
 *    known (never inferred)
 * Returns a list of human-readable violations — empty means compliant.
 * Villas without a `sleepingSpaces` breakdown are skipped, not failed, since
 * there's nothing structured to check.
 */
export function validateVillaCompliance(details: VillaComplianceDetails): string[] {
  const errors: string[] = [];
  if (!details.sleepingSpaces) return errors;

  const physicalCapacity = getPhysicalSleepingCapacity(details);
  if (details.licensedMaxOccupancy > physicalCapacity) {
    errors.push(
      `${details.unit}: licensedMaxOccupancy (${details.licensedMaxOccupancy}) exceeds physical sleeping capacity (${physicalCapacity})`
    );
  }

  for (const space of details.sleepingSpaces) {
    if (space.guests > space.beds * 2) {
      errors.push(
        `${details.unit}: "${space.label}" assigns ${space.guests} guests to ${space.beds} bed(s) — exceeds 2 guests per bed`
      );
    }
    if (space.adults != null && space.adults > 2) {
      errors.push(`${details.unit}: "${space.label}" assigns ${space.adults} adults — exceeds 2 adults per room`);
    }
  }

  return errors;
}
