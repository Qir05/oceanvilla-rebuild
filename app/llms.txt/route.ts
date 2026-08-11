// app/llms.txt/route.ts
//
// Serves /llms.txt — generated from the same resolved data sources as the
// rest of the site (lib/villaCompliance.ts, lib/ocean-villas.ts) rather than
// hand-written, so it can't drift into contradicting the pages it summarizes.
// This is an emerging, not a guaranteed-supported, convention — treat it as
// low-cost upside, not a relied-upon channel.
import { OCEAN_VILLA_LISTING_IDS, getVillaDetail } from "@/lib/ocean-villas";
import { fetchHostawayListings } from "@/lib/hostaway-listing";
import { getVillaCompliance } from "@/lib/villaCompliance";
import { getDisplayName } from "@/lib/villa-display";

const SITE_URL = "https://oceanvillasturtlebay.com";

export async function GET() {
  const { listings, failedIds } = await fetchHostawayListings(OCEAN_VILLA_LISTING_IDS);

  if (failedIds.length > 0) {
    console.error(
      `[llms.txt] ${failedIds.length}/${OCEAN_VILLA_LISTING_IDS.length} villa listings failed to load: ${failedIds.join(", ")}`
    );
  }

  const villaLines = listings.length === 0
    ? "Villa listing data is temporarily unavailable. See https://oceanvillasturtlebay.com/rentals for current listings, or contact the team directly."
    : listings
        .map((l) => {
          const compliance = getVillaCompliance(l.id);
          const detail = getVillaDetail(l.id);
          const name = getDisplayName(l.id, l.name || "");
          const sleeps = compliance?.licensedMaxOccupancy ?? l.maxGuests ?? "unspecified";
          const bedrooms = l.bedrooms ?? "unspecified";
          const bathrooms = l.bathrooms ?? "unspecified";
          const arrangement = compliance?.occupancySummary;
          const feature = detail.shortFeature;
          return [
            `- ${name} (${SITE_URL}/listing/${l.id}): licensed for ${sleeps} guests, ${bedrooms} bedrooms, ${bathrooms} bathrooms.`,
            arrangement ? `  Sleeping arrangement: ${arrangement}` : null,
            feature ? `  ${feature}.` : null,
          ]
            .filter(Boolean)
            .join("\n");
        })
        .join("\n");

  const body = `# Ocean Villas at Turtle Bay

> Ocean Villas at Turtle Bay is an independently operated collection of ${OCEAN_VILLA_LISTING_IDS.length} luxury private vacation rental villas located near Turtle Bay Resort on Oahu's North Shore, Hawaii. Guests book direct with live availability and pricing sourced from Hostaway — no third-party platform markups.

## Location

Turtle Bay, Kahuku, Oahu, Hawaii — on the North Shore, near Banzai Pipeline, Waimea Bay, Shark's Cove, and Haleiwa Town.

## Relationship to Turtle Bay Resort

Ocean Villas at Turtle Bay is not owned or operated by Turtle Bay Resort, and is not a Turtle Bay Resort brand or property. Villas are located near the resort. Some Turtle Bay Resort dining, golf, spa, and recreational experiences may be available to villa guests separately, but are not included, complimentary, or guaranteed with a villa stay — confirm current access terms with the Ocean Villas team before a stay if resort access matters.

## Villas

Guest capacity below is the Hawaii-licensed maximum occupancy for each villa, not a marketing estimate and not always the same as physical bed count. Villa 218's licensed maximum (10) is intentionally lower than its physical sleeping capacity (12 across two master bedrooms, a double queen bedroom, and a bunk bed room) — Hawaii's Department of Planning and Permitting permits the extra capacity to be disclosed as children's sleeping space rather than counted toward the bookable maximum. Listing 489097 combines two separately licensed units for a combined maximum of 12.

${villaLines}

## Villa Amenities

Depending on the villa, amenities may include high-speed WiFi, air conditioning, equipped kitchens, private outdoor spaces, and selected beach equipment. Exact amenities vary by villa; verify each listing page. Direct-booking support from a local team is included with every stay.

## What is not included

Turtle Bay Resort pool, spa, golf, and concierge access are not confirmed inclusions — treat any resort-amenity claim as unverified unless stated otherwise on ${SITE_URL}/amenities.

## Pages

- Villa collection: ${SITE_URL}/rentals
- Amenities: ${SITE_URL}/amenities
- Location guide: ${SITE_URL}/location
- Availability search: ${SITE_URL}/availability
- About: ${SITE_URL}/about
- Contact: ${SITE_URL}/contact
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
