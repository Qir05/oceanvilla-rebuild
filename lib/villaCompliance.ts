/**
 * lib/villaCompliance.ts
 *
 * Static Tax Map Key (TMK), Transient Accommodations (TA) registration, and
 * occupancy compliance details for Ocean Villas at Turtle Bay.
 *
 * Keyed by Hostaway listing ID — the same permanent identifier already used
 * as the canonical key throughout lib/ocean-villas.ts (OCEAN_VILLA_LISTING_IDS,
 * VILLA_STAT_OVERRIDES) and as `listing.id` in the listing detail page. This
 * data is independent of the live Hostaway API response and must never be
 * merged into, or derived from, it.
 */

export interface VillaComplianceDetails {
  unit: string;
  taxMapKey: string;
  tat: string;
  maximumOccupancy: number;
  occupancyPerBedroom: string;
}

export const VILLA_COMPLIANCE: Record<string, VillaComplianceDetails> = {
  "489093": {
    // Villa 111
    unit: "Villa 111",
    taxMapKey: "570010130011",
    tat: "TA-069-519-9744-01",
    maximumOccupancy: 8,
    occupancyPerBedroom: "2 for each bedroom, 2 in living room (sofa bed)",
  },
  "489094": {
    // Villa 119
    unit: "Villa 119",
    taxMapKey: "570010130019",
    tat: "TA-157-647-8720-01",
    maximumOccupancy: 8,
    occupancyPerBedroom: "2 each for master and queen bedroom, 4 in bunk bed bedroom",
  },
  "489092": {
    // Villa 120
    unit: "Villa 120",
    taxMapKey: "570010130020",
    tat: "TA-157-647-8720-01",
    maximumOccupancy: 4,
    occupancyPerBedroom: "2 in bedroom, 2 in living room (sofa bed)",
  },
  "489089": {
    // Villa 218
    unit: "Villa 218",
    taxMapKey: "570010130039",
    tat: "TA-157-647-8720-01",
    maximumOccupancy: 10,
    occupancyPerBedroom: "2 for each bedroom, 4 in double queen bedroom",
  },
  "505671": {
    // Villa 304
    unit: "Villa 304",
    taxMapKey: "570010130043",
    tat: "TA-157-842-1760-01",
    maximumOccupancy: 10,
    occupancyPerBedroom: "2 for each bedroom",
  },
  "489095": {
    // Villa 318
    unit: "Villa 318",
    taxMapKey: "570010130057",
    tat: "TA-048-529-9712-01",
    maximumOccupancy: 10,
    occupancyPerBedroom: "2 for each bedroom, 4 in double queen bedroom",
  },
};

export function getVillaCompliance(listingId: string): VillaComplianceDetails | undefined {
  return VILLA_COMPLIANCE[listingId];
}
