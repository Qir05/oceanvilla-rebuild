// app/listing/[id]/page.tsx
//
// Server component: fetches the listing from Hostaway server-side (Tier 1,
// via lib/hostaway-listing.ts, revalidated every 5 minutes) so guest
// capacity, bedrooms, bathrooms, amenities, and description are present in
// the initial server-rendered HTML rather than only appearing after a
// client-side fetch — required for both traditional crawlers and AI answer
// engines that don't execute JavaScript. Interactivity (gallery, booking
// card, inquiry modal) lives in the client component ListingClient.tsx.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchHostawayListing } from "@/lib/hostaway-listing";
import { getVillaCompliance } from "@/lib/villaCompliance";
import { getDisplayName } from "@/lib/villa-display";
import ListingClient from "./ListingClient";

const SITE_URL = "https://oceanvillasturtlebay.com";
const BRAND_PHONE = "(858) 727-2427";

type PageProps = {
  params: Promise<{ id: string }>;
};

// A Hostaway fetch failure (unreachable, erroring) is not the same fact as
// "no such listing" and must not render as a 404 — a 404 on a page that
// really exists tells search engines to deindex it. This renders as a
// normal 200 response with its own recovery UI instead.
function ListingUnavailable() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-2xl font-serif text-red-800">Villa information is temporarily unavailable</h1>
          <p className="mt-4 text-sm text-red-700">
            We&apos;re having trouble loading this villa&apos;s details right now. This is a temporary issue on our
            end, not a sign the villa no longer exists — please try again in a moment.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <a
              href={`tel:+1${BRAND_PHONE.replace(/[^\d+]/g, "")}`}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Call Us · {BRAND_PHONE}
            </a>
            <Link
              href="/rentals"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Browse All Villas
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await fetchHostawayListing(id);
  if (result.status === "not_found") return { title: "Villa Not Found | Ocean Villas at Turtle Bay" };
  if (result.status === "error") {
    // No index/canonical asserted for a page we can't currently confirm the
    // content of — avoid publishing metadata for content we didn't actually
    // load this request.
    return { title: "Ocean Villas at Turtle Bay", robots: { index: false, follow: true } };
  }

  const listing = result.listing;
  const title = getDisplayName(listing.id, listing.name || "");
  const sleeps = listing.maxGuests ? `Sleeps ${listing.maxGuests}` : "Turtle Bay Oahu";
  const metaTitle = `${title} — ${sleeps} | Ocean Villas`;

  const bedroomsPart = listing.bedrooms ? `${listing.bedrooms}-bedroom ` : "";
  const description = listing.maxGuests
    ? `${title}: ${bedroomsPart}villa sleeps ${listing.maxGuests} at Turtle Bay, Oahu's North Shore. Book direct with live availability — no platform fees.`
    : `${title} at Ocean Villas, Turtle Bay, Oahu's North Shore. Book direct with live availability — no platform fees.`;

  const ogImage = listing.heroUrl || "/brand/TTB-Logo.png";

  return {
    title: { absolute: metaTitle },
    description,
    alternates: { canonical: `/listing/${listing.id}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: metaTitle,
      description,
      url: `/listing/${listing.id}`,
      siteName: "Ocean Villas at Turtle Bay",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description,
      images: [ogImage],
    },
  };
}

export default async function ListingDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const result = await fetchHostawayListing(id);

  if (result.status === "not_found") notFound();
  if (result.status === "error") return <ListingUnavailable />;

  const listing = result.listing;
  const title = getDisplayName(listing.id, listing.name || "");
  const compliance = getVillaCompliance(listing.id);

  const accommodationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Accommodation",
    name: title,
    url: `${SITE_URL}/listing/${listing.id}`,
    // Links this villa into the Ocean Villas collection entity defined on
    // the homepage. `containedInPlace` (not `brand`, which Accommodation/
    // Place does not define) is valid here because LodgingBusiness extends
    // both Organization AND Place in schema.org's type hierarchy (via
    // LocalBusiness) — so a Place-typed entity (this Accommodation) can
    // validly declare itself containedInPlace another Place-typed entity
    // (the LodgingBusiness). This is the inverse of the LodgingBusiness's
    // own `containsPlace` relationship used below for room-level detail.
    containedInPlace: {
      "@id": `${SITE_URL}/#organization`,
      "@type": "LodgingBusiness",
      name: "Ocean Villas at Turtle Bay",
    },
    ...(listing.images.length ? { image: listing.images } : {}),
    ...(listing.bedrooms ? { numberOfBedrooms: listing.bedrooms } : {}),
    ...(listing.bathrooms ? { numberOfBathroomsTotal: listing.bathrooms } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.city || "Kahuku",
      addressRegion: listing.state || "HI",
      addressCountry: "US",
    },
    // `occupancy` is always the licensed/bookable maximum, never the sum of
    // room capacities — for Villa 218 these deliberately differ (see
    // lib/villaCompliance.ts), and `containsPlace` below keeps each room's
    // real physical capacity even where that sums above the top-level
    // occupancy. That's accurate, not a contradiction to fix: rooms
    // describe physical space, `occupancy` describes what's permitted.
    ...(compliance
      ? {
          occupancy: {
            "@type": "QuantitativeValue",
            value: compliance.licensedMaxOccupancy,
            unitCode: "C62",
          },
          ...(compliance.sleepingSpaces
            ? {
                // @type stays "Room" for every space — schema.org has no
                // distinct "bedroom" type, so this is accurate for both a
                // bedroom and a living area. The `name` is what keeps a
                // living-area sofa bed from being described as a bedroom.
                containsPlace: compliance.sleepingSpaces.map((space) => ({
                  "@type": "Room",
                  name: space.label,
                  occupancy: {
                    "@type": "QuantitativeValue",
                    value: space.guests,
                    unitCode: "C62",
                  },
                })),
              }
            : {}),
        }
      : listing.maxGuests
      ? {
          occupancy: {
            "@type": "QuantitativeValue",
            value: listing.maxGuests,
            unitCode: "C62",
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Villas", item: `${SITE_URL}/rentals` },
      { "@type": "ListItem", position: 3, name: title, item: `${SITE_URL}/listing/${listing.id}` },
    ],
  };

  return (
    <>
      {/* Plain <script>, not next/script's <Script> — Script's default
          "afterInteractive" strategy injects client-side only, after
          hydration, and is absent from the initial server-rendered HTML
          entirely. A crawler that doesn't execute JavaScript would see no
          structured data at all. A literal <script> tag is part of the
          actual server-rendered output. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(accommodationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ListingClient listing={listing} title={title} compliance={compliance} />
    </>
  );
}
