// app/page.tsx
//
// Server component: fetches the 7 featured villas from Hostaway server-side
// (Tier 1, via lib/hostaway-listing.ts, revalidated every 5 minutes), reduces
// each to the narrow FeaturedVillaCardData shape HomeClient actually renders,
// and owns the homepage's server-safe JSON-LD (WebSite/FAQPage/
// LodgingBusiness). All interactivity lives in the client component
// HomeClient.tsx, matching the same server/client split already used by
// app/rentals/page.tsx + RentalsClient.tsx and app/listing/[id]/page.tsx +
// ListingClient.tsx.
import { fetchHostawayListings, type HostawayListingDetail } from "@/lib/hostaway-listing";
import { OCEAN_VILLA_LISTING_IDS } from "@/lib/ocean-villas";
import { VILLA_COMPLIANCE } from "@/lib/villaCompliance";
import { getDisplayName, getPreferredHero } from "@/lib/villa-display";
import HomeClient from "./HomeClient";

const SITE_URL = "https://oceanvillasturtlebay.com";
const BRAND_NAME = "Ocean Villas at Turtle Bay";

/**
 * The only Featured Villa fields HomeClient's card actually renders or needs
 * for its click handlers. Deliberately excludes the raw Hostaway `name` (and
 * every other field HomeClient doesn't use) — Next.js serializes whatever
 * this component passes to HomeClient into the page's RSC payload, so a
 * field simply never reaching this type can't leak into the homepage's raw
 * HTML byte stream the way the full HostawayListingDetail object could.
 */
export type FeaturedVillaCardData = {
  id: string;
  displayName: string;
  subtitle: string;
  maxGuests: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  heroImageUrl: string;
};

/**
 * Raw Hostaway listing name -> canonical display name, one pair per villa
 * actually fetched this request. Not a second hardcoded map: each pair is
 * just that same villa's own getDisplayName() output, keyed by the exact
 * raw name it replaces — so this can never drift from
 * lib/villa-display.ts's LISTING_DISPLAY_NAMES. Sorted longest-raw-name
 * first so a raw name that happens to be a substring of another villa's raw
 * name is never partially matched ahead of its fuller form.
 */
function buildNameNormalizationMap(
  listings: HostawayListingDetail[]
): Array<{ raw: string; canonical: string }> {
  const seen = new Set<string>();
  const pairs: Array<{ raw: string; canonical: string }> = [];
  for (const listing of listings) {
    const raw = (listing.name || "").replace(/\s+/g, " ").trim();
    if (!raw || seen.has(raw)) continue;
    const canonical = getDisplayName(listing.id, listing.name || "");
    if (canonical === raw) continue;
    seen.add(raw);
    pairs.push({ raw, canonical });
  }
  return pairs.sort((a, b) => b.raw.length - a.raw.length);
}

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Replaces exact occurrences of known raw Hostaway villa names anywhere they
 * appear in homepage description text — including cross-references inside a
 * different villa's own copy (e.g. "...paired with The Model Villa – 119
 * next door...") — with the same canonical name already shown everywhere
 * else on the site. Entity substitution only: every other word and all
 * punctuation is left exactly as Hostaway wrote it, and unlike deleting a
 * leading name, a same-role swap can never break the sentence's grammar.
 */
function normalizeVillaNameReferences(text: string, nameMap: Array<{ raw: string; canonical: string }>): string {
  let result = text;
  for (const { raw, canonical } of nameMap) {
    result = result.replace(new RegExp(escapeForRegExp(raw), "g"), canonical);
  }
  return result;
}

function buildSubtitle(description: string | null, nameMap: Array<{ raw: string; canonical: string }>): string {
  const cleaned = (description || "").replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return "Browse this North Shore villa at Turtle Bay and explore live availability, stay details, and direct booking options.";
  }
  return normalizeVillaNameReferences(cleaned, nameMap);
}

function toFeaturedCard(
  listing: HostawayListingDetail,
  nameMap: Array<{ raw: string; canonical: string }>
): FeaturedVillaCardData {
  return {
    id: listing.id,
    displayName: getDisplayName(listing.id, listing.name || ""),
    subtitle: buildSubtitle(listing.description, nameMap),
    maxGuests: listing.maxGuests,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    heroImageUrl: getPreferredHero(listing.id, listing.heroUrl, listing.images),
  };
}

export default async function Home() {
  const { listings, failedIds } = await fetchHostawayListings(OCEAN_VILLA_LISTING_IDS);

  if (failedIds.length > 0) {
    console.error(
      `[home] ${failedIds.length}/${OCEAN_VILLA_LISTING_IDS.length} featured villa listings failed to load: ${failedIds.join(", ")}`
    );
  }

  const nameMap = buildNameNormalizationMap(listings);
  const featuredVillas = listings.map((listing) => toFeaturedCard(listing, nameMap));

  // Computed from lib/villaCompliance.ts (the licensing-mandated occupancy
  // source) rather than hardcoded, so this FAQ answer can never drift from
  // the enforced per-villa figures. Passed down to HomeClient's own visible
  // FAQ accordion as a prop rather than recomputed client-side, so there is
  // exactly one place this string is built.
  const occupancyAnswer =
    `Guest capacity varies by villa: ${Object.values(VILLA_COMPLIANCE)
      .map((v) => `${v.unit} is licensed for ${v.licensedMaxOccupancy}`)
      .join(", ")}. ` +
    "Each figure is the Hawaii-licensed maximum, not a raw bed count — see each villa's listing page for its full sleeping arrangement.";

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How many guests can each villa sleep?",
        acceptedAnswer: {
          "@type": "Answer",
          text: occupancyAnswer,
        },
      },
      {
        "@type": "Question",
        name: "How do I book a villa at Ocean Villas at Turtle Bay?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use the availability search above to select your dates and number of guests, then continue directly into the booking path. No third-party platform required.",
        },
      },
      {
        "@type": "Question",
        name: "How far are Ocean Villas from Honolulu International Airport?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The villas are approximately 35 miles north of HNL, about a 45 to 60 minute drive via H-2 and Kamehameha Highway, with scenic views once you reach the North Shore.",
        },
      },
      {
        "@type": "Question",
        name: "What beaches and surf spots are near Turtle Bay?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Banzai Pipeline is 12 minutes away, Waimea Bay 10 minutes, Shark’s Cove 11 minutes, and Haleiwa Town 15 minutes. Turtle Bay Resort beach is a 2-minute walk from the villas.",
        },
      },
      {
        "@type": "Question",
        name: "What is included in the nightly rate?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Each villa includes a fully equipped gourmet kitchen, high-speed WiFi, a private lanai, beach gear (chairs, umbrellas, snorkel sets), and dedicated parking. Rates are sourced directly from Hostaway with no platform markups. Turtle Bay Resort amenities such as pool access are separate — see the amenities page for confirmed details.",
        },
      },
      {
        "@type": "Question",
        name: "Is Turtle Bay better than staying in Waikiki?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Turtle Bay offers a private-villa experience far from the crowds of Waikiki. Guests enjoy direct beach access, world-class surf nearby, and a more authentic island pace, with all the comfort of a luxury villa.",
        },
      },
      {
        "@type": "Question",
        name: "Why stay at Ocean Villas instead of a hotel at Turtle Bay?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ocean Villas combines the luxury and convenience of a resort setting with the comfort and privacy of a spacious vacation home. Guests can enjoy multiple bedrooms, full kitchens, expansive living areas, private lanais where applicable, and room for families and groups to relax together—all while staying close to the beaches and experiences that make Turtle Bay and Oahu’s North Shore a sought-after destination.",
        },
      },
      {
        "@type": "Question",
        name: "Is Ocean Villas at Turtle Bay part of Turtle Bay Resort?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Ocean Villas at Turtle Bay is an independently operated collection of private vacation rental villas located near Turtle Bay Resort, not owned or operated by the resort. Some resort dining, golf, spa, and recreational experiences may be available to villa guests separately, but they are not included, complimentary, or guaranteed with a villa stay — see the amenities page for confirmed details.",
        },
      },
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: BRAND_NAME,
    url: SITE_URL,
    description:
      "Luxury private villa rentals at Turtle Bay on Oahu’s North Shore with direct booking and live availability.",
    // Links the site (WebSite) to the business it publishes (LodgingBusiness,
    // declared below with @id `#organization`) — a real, valid Schema.org
    // relationship (WebSite.publisher, range Organization; LodgingBusiness
    // qualifies via LocalBusiness's dual Organization+Place typing), not
    // schema added for its own sake.
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  const lodgingJsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/TTB-Logo.png`,
    image: `${SITE_URL}/brand/TTB-Logo.png`,
    description:
      "Luxury private villa rentals at Turtle Bay on Oahu’s North Shore. Book direct for live availability and transparent pricing — no platform fees.",
    // Ocean Villas at Turtle Bay is an independently operated villa rental
    // collection near Turtle Bay Resort — not a Turtle Bay Resort property,
    // brand, or operating division. Repeated verbatim in llms.txt.
    disambiguatingDescription:
      "Ocean Villas at Turtle Bay is an independently operated collection of private vacation rental villas located near Turtle Bay Resort on Oahu's North Shore. It is not owned or operated by Turtle Bay Resort, and resort amenities are not included with a villa stay unless explicitly confirmed.",
    telephone: "+18587272427",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Turtle Bay",
      addressLocality: "Kahuku",
      addressRegion: "HI",
      postalCode: "96731",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 21.6977,
      longitude: -157.9952,
    },
    areaServed: {
      "@type": "Place",
      name: "Turtle Bay, Oahu, Hawaii",
    },
    // Count of villas in the collection, not "rooms" in the hotel sense —
    // schema.org LodgingBusiness has no dedicated "number of units" property,
    // numberOfRooms is the closest fit and is how Google's lodging guidance
    // treats vacation-rental unit counts.
    numberOfRooms: 7,
    // Only amenities confirmed universal across every villa in
    // lib/amenities-data.ts (AMENITIES_RELAX_COMFORT / COOK_GATHER /
    // BEACH_DAYS / ISLAND_LIVING, excluding the ones flagged as per-villa).
    // Pool and ocean view were previously listed here as guaranteed, which
    // contradicted the site's own per-villa disclaimers — removed.
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Free WiFi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Air conditioning", value: true },
      { "@type": "LocationFeatureSpecification", name: "Full kitchen", value: true },
      { "@type": "LocationFeatureSpecification", name: "Private lanai", value: true },
      { "@type": "LocationFeatureSpecification", name: "Beach gear included", value: true },
    ],
    priceRange: "$$$$",
  };

  return (
    <>
      {/* Plain <script>, not next/script's <Script> — see app/listing/[id]/page.tsx
          for why: Script's default strategy never reaches the initial
          server-rendered HTML. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(lodgingJsonLd) }}
      />
      <HomeClient initialListings={featuredVillas} occupancyAnswer={occupancyAnswer} />
    </>
  );
}
