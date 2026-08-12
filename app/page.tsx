"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MobileStickyBookingBar from "@/components/MobileStickyBookingBar";
import TrustSignals from "@/components/TrustSignals";
import { trackEvent } from "@/lib/analytics";
import { VILLA_COMPLIANCE } from "@/lib/villaCompliance";
import { MAX_SITE_GUEST_CAPACITY } from "@/lib/ocean-villas";

type HostawayListing = {
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
  bookingEngineBase?: string;
};

const SITE_URL = "https://oceanvillasturtlebay.com";

const BRAND = {
  name: "Ocean Villas at Turtle Bay",
  sub: "Luxury Vacation Rentals on Oahu’s North Shore",
  phone: "(858) 727-2427",
};

const LISTING_IDS = ["489089", "489092", "489093", "489094", "489095", "489097", "505671"] as const;

const LISTING_DISPLAY_NAMES: Record<string, string> = {
  "489095": "The Penthouse Villa", // Villa 318
  "505671": "The View Villa",      // Villa 304
};

const HERO_IMAGE_OVERRIDES: Record<string, number> = {
  "505671": 1,
};

function getDisplayName(id: string, rawName: string): string {
  if (LISTING_DISPLAY_NAMES[id]) return LISTING_DISPLAY_NAMES[id];
  if (/\b(?:ov|villa|unit)?\s*318\b/i.test(rawName)) return "The Penthouse Villa";
  if (/\b(?:ov|villa|unit)?\s*304\b/i.test(rawName)) return "The View Villa";
  return rawName || `Villa ${id}`;
}

function getPreferredHero(id: string, heroUrl: string | undefined, images?: string[]): string {
  const overrideIdx = HERO_IMAGE_OVERRIDES[id];
  if (overrideIdx !== undefined && images && images.length > overrideIdx) {
    return images[overrideIdx];
  }
  return heroUrl || "/media/rentals/placeholder.jpg";
}

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function formatISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(dateISO: string, days: number) {
  if (!dateISO) return "";
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return formatISO(dt);
}

function isAfter(aISO: string, bISO: string) {
  if (!aISO || !bISO) return false;
  return new Date(aISO).getTime() > new Date(bISO).getTime();
}


function sanitizeTel(phone: string) {
  const cleaned = (phone || "").replace(/[^\d+]/g, "");
  return cleaned || phone;
}

function GlassCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl",
        "shadow-[0_10px_40px_rgba(15,23,42,0.08)]",
        className
      )}
    >
      {children}
    </div>
  );
}

function PrimaryButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold",
        "bg-slate-900 text-white shadow-md",
        "transition-all duration-200 hover:bg-slate-800 hover:shadow-lg active:scale-[0.98]",
        "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
        className
      )}
    >
      {children}
    </button>
  );
}

function Pill({
  children,
  tone = "default",
  darkText = false,
}: {
  children: React.ReactNode;
  tone?: "default" | "gold";
  darkText?: boolean;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] md:text-xs font-medium tracking-wide",
        tone === "gold"
          ? "bg-[#D9B87C]/15 text-[#8B6B2B] border border-[#D9B87C]/35"
          : darkText
          ? "bg-slate-100 text-slate-700 border border-slate-200"
          : "bg-white/70 text-slate-700 border border-white/70 backdrop-blur"
      )}
    >
      {children}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-center">
      <div className="text-[10px] md:text-xs font-medium uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, desc }: { eyebrow?: string; title: string; desc?: string }) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <div className="mb-3 flex items-center gap-2.5">
          <span className="h-px w-8 bg-[#3f5f4a]" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{eyebrow}</span>
        </div>
      ) : null}
      <h2 className="text-3xl font-serif tracking-tight text-slate-900 md:text-4xl">{title}</h2>
      {desc ? <p className="mt-4 text-base leading-relaxed text-slate-600">{desc}</p> : null}
    </div>
  );
}

// ─── Reveal — subtle on-scroll entrance, reuses the same CSS classes and
// IntersectionObserver pattern already proven on the listing page. Respects
// prefers-reduced-motion via the .ov-reveal rule in globals.css. ──────────
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.classList.add("ov-reveal");

    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("ov-visible");
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("ov-visible");
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}

function GuideCard({
  href,
  title,
  desc,
  onClick,
}: {
  href?: string;
  title: string;
  desc: string;
  onClick?: () => void;
}) {
  const sharedClassName =
    "group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_16px_50px_rgba(15,23,42,0.1)]";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${sharedClassName} text-left`}
      >
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{desc}</p>
        <span className="mt-5 inline-flex text-sm font-semibold text-slate-900">
          Explore
        </span>
      </button>
    );
  }

  return (
    <Link href={href || "/"} className={sharedClassName}>
      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{desc}</p>
      <span className="mt-5 inline-flex text-sm font-semibold text-slate-900">
        Explore
      </span>
    </Link>
  );
}

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white p-5 transition-colors open:border-[#3f5f4a]/30">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-slate-900">
        {question}
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform duration-200 group-open:rotate-45 group-open:bg-[#3f5f4a]/10 group-open:text-[#3f5f4a]"
          aria-hidden="true"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </summary>
      <p className="mt-3 text-sm leading-7 text-slate-600">{answer}</p>
    </details>
  );
}

function ListingCard({ l }: { l: HostawayListing }) {
  const title = getDisplayName(l.id, l.name || "");
  // Let CSS line-clamp handle visual truncation; supply full text
  const subtitle =
    (l.description || "").replace(/\s+/g, " ").trim() ||
    `Browse this North Shore villa at Turtle Bay and explore live availability, stay details, and direct booking options.`;

  const hero = getPreferredHero(l.id, l.heroUrl, l.images);
  const detailUrl = `/listing/${encodeURIComponent(l.id)}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_6px_26px_rgba(15,23,42,0.06)] border border-slate-100 transition-all duration-300 hover:shadow-[0_18px_60px_rgba(15,23,42,0.14)]">
      {/* Fixed aspect-ratio image — keeps all cards level */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 shrink-0">
        <Image
          src={hero}
          alt={`${title} at Turtle Bay`}
          fill
          unoptimized={true}
          className="object-cover transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute top-4 right-4 z-10">
          <Pill tone="default" darkText>
            Villa #{l.id}
          </Pill>
        </div>
      </div>

      {/* flex-1 content column — spacer pins stats+CTAs to the bottom */}
      <div className="flex flex-col flex-1 p-5 md:p-6">
        {/* Title: clamp-2 ensures max 2 lines across all cards */}
        <h3 className="text-base font-semibold text-slate-900 line-clamp-2 leading-snug">
          {title}
        </h3>

        {/* Description: clamp-3 keeps consistent height */}
        <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-3">
          {subtitle}
        </p>

        {/* Flexible spacer — pushes stats + CTAs to the bottom of every card */}
        <div className="flex-1" />

        {/* Stats — always at a consistent vertical position */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
          <Stat label="Sleeps" value={`${l.maxGuests ?? "—"}`} />
          <Stat label="Beds" value={`${l.bedrooms ?? "—"}`} />
          <Stat label="Baths" value={`${l.bathrooms ?? "—"}`} />
        </div>

        {/* CTAs — pinned to card bottom */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            href={detailUrl}
            className="inline-flex items-center justify-center rounded-xl bg-[#0f172a] px-4 py-3 text-sm font-semibold text-white shadow-[0_3px_12px_rgba(15,23,42,0.18)] hover:-translate-y-px hover:bg-[#1e293b] hover:shadow-[0_6px_20px_rgba(15,23,42,0.24)] active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2 transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            View Villa
          </Link>
          <Link
            href={detailUrl}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-px active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            Request This Villa
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const router = useRouter();
  const today = useMemo(() => formatISO(new Date()), []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Autoplay is set on the element for browsers/crawlers that never run this
  // effect, but guests who prefer reduced motion get a paused first frame
  // instead of a looping video.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      videoRef.current?.pause();
    }
  }, []);

  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<number>(2);
  const [promo, setPromo] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [listings, setListings] = useState<HostawayListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState<string>("");

  // Computed from lib/villaCompliance.ts (the licensing-mandated occupancy
  // source) rather than hardcoded, so this FAQ answer can never drift from
  // the enforced per-villa figures.
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
    name: BRAND.name,
    url: SITE_URL,
    description:
      "Luxury private villa rentals at Turtle Bay on Oahu’s North Shore with direct booking and live availability.",
  };

  const lodgingJsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND.name,
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

  useEffect(() => {
    let alive = true;

    async function load() {
      setListingsLoading(true);
      setListingsError("");

      try {
        const results = await Promise.all(
          LISTING_IDS.map(async (id) => {
            const res = await fetch(`/api/hostaway/listings?id=${encodeURIComponent(id)}`, { cache: "no-store" });
            const json = await res.json().catch(() => null);
            if (!res.ok || !json?.success) throw new Error(`Failed to load listing ${id}`);
            return json.listing as HostawayListing;
          })
        );

        if (!alive) return;
        setListings(results);
      } catch {
        if (!alive) return;
        setListingsError("Hostaway listings failed to load. Please check API/ENV and try again.");
      } finally {
        if (!alive) return;
        setListingsLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  function scrollToAvailability() {
    const section = document.getElementById("availability");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    router.push("/");
  }

  function onSearch() {
    setError("");

    if (!checkIn || !checkOut) return setError("Please choose your check-in and check-out dates.");
    if (isAfter(checkIn, checkOut) || checkIn === checkOut) return setError("Check-out must be after check-in.");
    if (isAfter(today, checkIn)) return setError("Check-in date must be today or later.");
    if (guests < 1) return setError("Guests must be at least 1.");

    setLoading(true);
    try {
      router.push(
        `/availability?startDate=${encodeURIComponent(checkIn)}&endDate=${encodeURIComponent(checkOut)}&guests=${encodeURIComponent(
          String(guests)
        )}${promo.trim() ? `&promo=${encodeURIComponent(promo.trim())}` : ""}`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-slate-200 pb-24 md:pb-0">
      {/* Plain <script>, not next/script's <Script> — Script's default
          "afterInteractive" strategy never reaches the initial
          server-rendered HTML, so a non-JS crawler would see no structured
          data at all. This file is a client component, but it is still
          server-rendered for its initial HTML like any other component; a
          literal <script> tag with static JSON content renders normally. */}
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

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="relative mx-auto flex h-16 lg:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3 z-10 shrink-0">
            <div className="relative h-8 w-8 md:h-10 md:w-10 overflow-hidden">
              <Image src="/brand/TTB-Logo.png" alt={BRAND.name} fill className="object-contain" priority />
            </div>
            <div className="text-lg md:text-xl font-serif font-bold text-slate-900 hidden sm:block">{BRAND.name}</div>
          </a>

          <div className="absolute inset-0 flex items-center justify-center sm:hidden pointer-events-none px-14">
            <span className="text-[13px] font-serif font-bold text-[#0A4C61] text-center leading-tight tracking-tight">
              Luxury Villas on Oahu’s North Shore
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 z-10">
            <Link className="hover:text-slate-900 transition-colors" href="/rentals">
              Villas
            </Link>
            <button
              type="button"
              onClick={() => scrollToAvailability()}
              className="hover:text-slate-900 transition-colors"
            >
              Availability
            </button>
            <Link className="hover:text-slate-900 transition-colors" href="/location">
              Location
            </Link>
            <Link className="hover:text-slate-900 transition-colors" href="/amenities">
              Amenities
            </Link>
          </nav>

          <div className="hidden lg:flex items-center gap-6 z-10">
            <a
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
              href={`tel:+1${sanitizeTel(BRAND.phone)}`}
              onClick={() => trackEvent("phone_click", { source: "home_header" })}
            >
              Call Us · {BRAND.phone}
            </a>
            <PrimaryButton type="button" onClick={() => scrollToAvailability()}>
              Check Availability
            </PrimaryButton>
          </div>

          <button className="lg:hidden p-2 text-sm font-semibold text-slate-600 z-10" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 shadow-lg absolute w-full z-20">
            <div className="flex flex-col gap-4 text-sm font-medium text-slate-600">
              <Link onClick={() => setMobileMenuOpen(false)} href="/rentals" className="py-2 hover:text-slate-900">
                Villas
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToAvailability();
                }}
                className="py-2 text-left hover:text-slate-900"
              >
                Check Availability
              </button>
              <Link onClick={() => setMobileMenuOpen(false)} href="/location" className="py-2 hover:text-slate-900">
                Location
              </Link>
              <Link onClick={() => setMobileMenuOpen(false)} href="/amenities" className="py-2 hover:text-slate-900">
                Amenities
              </Link>
              <a
                href={`tel:+1${sanitizeTel(BRAND.phone)}`}
                className="py-2 hover:text-slate-900"
                onClick={() => trackEvent("phone_click", { source: "home_mobile_menu" })}
              >
                Call Us · {BRAND.phone}
              </a>
            </div>
          </div>
        )}
      </header>

      <section
        id="top"
        className="relative isolate w-full overflow-hidden bg-[#0b2436] h-[62vh] min-h-[440px] sm:h-[70vh] md:h-[80vh]"
      >
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{ transform: "scale(1.06) translateZ(0)", backfaceVisibility: "hidden" }}
          poster="/media/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
        >
          <source src="/media/hero.mp4" type="video/mp4" />
        </video>

        {/* Single tonal gradient — darkest at the bottom where text/gradient
            meets the white section below, lightest through the middle so the
            video itself stays clearly visible. */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/55" />

        <div className="relative z-10 flex h-full flex-col justify-center px-5 pb-14 pt-16 sm:px-6 md:pb-24 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-4xl">
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-medium tracking-tight text-white leading-tight [text-shadow:0_2px_16px_rgba(0,0,0,0.4)]">
                Wake Up to Ocean Views. End Your Day with Hawaiian Sunsets.
              </h1>

              <p className="mt-4 max-w-2xl text-base sm:text-lg text-white/90 leading-relaxed md:mt-6 [text-shadow:0_1px_10px_rgba(0,0,0,0.4)]">
                Discover luxury beachfront villas where every stay is designed for relaxation, connection, and unforgettable island experiences. Located within the exclusive Ocean Villas at Turtle Bay, our spacious accommodations place you just steps from the beach and moments from the very best of Oahu&apos;s North Shore.
              </p>

              <div className="mt-7 md:mt-9">
                <Link
                  href="/rentals"
                  className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold bg-slate-900 text-white shadow-md transition-all duration-200 hover:bg-slate-800 hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 sm:text-base sm:px-7 sm:py-3.5"
                  onClick={() => trackEvent("cta_click", { source: "home_hero", label: "Find Your Perfect Villa" })}
                >
                  Find Your Perfect Villa
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="availability" className="bg-white pt-10 pb-14 md:pt-20 md:pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <GlassCard className="p-5 sm:p-6 md:p-8">
            <div className="grid grid-cols-2 gap-3 md:flex md:flex-row md:items-end md:gap-4">
              <div className="md:flex-1">
                <label htmlFor="ov-checkin" className="block text-[10px] md:text-xs font-bold uppercase tracking-wide text-slate-500 mb-1 md:mb-2">Check-in</label>
                <input
                  id="ov-checkin"
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCheckIn(v);
                    if (checkOut && (v === checkOut || isAfter(v, checkOut))) setCheckOut(addDays(v, 2));
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 md:px-4 md:py-3"
                />
              </div>

              <div className="md:flex-1">
                <label htmlFor="ov-checkout" className="block text-[10px] md:text-xs font-bold uppercase tracking-wide text-slate-500 mb-1 md:mb-2">Check-out</label>
                <input
                  id="ov-checkout"
                  type="date"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 md:px-4 md:py-3"
                />
              </div>

              <div className="md:w-32">
                <label htmlFor="ov-guests" className="block text-[10px] md:text-xs font-bold uppercase tracking-wide text-slate-500 mb-1 md:mb-2">Guests</label>
                <select
                  id="ov-guests"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 md:px-4 md:py-3"
                >
                  {/* Not villa-scoped yet at this point in the flow, so bounded
                      by the largest resolved capacity across all villas. */}
                  {Array.from({ length: MAX_SITE_GUEST_CAPACITY }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Guests
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:w-44">
                <label htmlFor="ov-promo" className="block text-[10px] md:text-xs font-bold uppercase tracking-wide text-slate-500 mb-1 md:mb-2">Promo</label>
                <input
                  id="ov-promo"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 md:px-4 md:py-3"
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <PrimaryButton type="button" onClick={onSearch} disabled={loading} className="w-full py-3 md:h-[48px]">
                  {loading ? "Searching…" : "Search Availability"}
                </PrimaryButton>
              </div>
            </div>

            {error && <div className="mt-4 text-sm text-red-600 font-medium">{error}</div>}
          </GlassCard>
        </div>
      </section>

      {/* OPENING NARRATIVE — editorial split: intro copy paired with a
          time-of-day rhythm panel, rather than a single centered paragraph.
          Same facts as before, restructured for visual composition. */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16 lg:items-start">
            <Reveal className="lg:col-span-7">
              <SectionTitle eyebrow="The Experience" title="Experience the North Shore Like Never Before" />
              <p className="mt-6 text-base leading-relaxed text-slate-600 max-w-xl">
                Whether you&apos;re planning a family getaway, celebrating a special occasion, or simply escaping to
                paradise, Ocean Villas at Turtle Bay offers the perfect setting to create unforgettable memories on
                Oahu&apos;s iconic North Shore.
              </p>
            </Reveal>

            <Reveal delay={120} className="lg:col-span-5">
              <div className="space-y-6 border-l-2 border-[#3f5f4a]/25 pl-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#3f5f4a]">Morning</div>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    Wake up to breathtaking ocean views from your private villa.
                  </p>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#3f5f4a]">Day</div>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    Explore pristine beaches and world-famous surf breaks nearby.
                  </p>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#3f5f4a]">Evening</div>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    Unwind each night with spectacular Hawaiian sunsets.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* TRUST SIGNALS */}
      <TrustSignals />

      {/* TRUST / POSITIONING — one editorial intro paired with three
          numbered benefit items (restrained index marks, not another
          identical bordered-card grid) inside a soft sand-toned panel. */}
      <section className="py-16 md:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="rounded-3xl bg-[#f8f4ec] border border-[#ece4d4] px-6 py-12 sm:px-10 md:px-14 md:py-16">
              <SectionTitle
                eyebrow="Book With Us"
                title="Why Book Direct?"
                desc="Booking directly with Ocean Villas means more than securing a competitive rate. It gives guests direct access to the local team, personalized recommendations, exclusive offers when available, and dedicated support before and throughout their stay—helping create a seamless Hawaiian vacation from the moment planning begins."
              />

              <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
                {[
                  {
                    n: "01",
                    title: "Direct access to our team",
                    desc: "Skip the third-party platform and connect straight with our local team for questions, recommendations, and support, before you even book.",
                  },
                  {
                    n: "02",
                    title: "Personalized planning",
                    desc: "Get tailored villa recommendations and North Shore guidance suited to your trip, from a team that knows every villa firsthand.",
                  },
                  {
                    n: "03",
                    title: "Savings, without the markup",
                    desc: "Rates are sourced directly from Hostaway with no added platform fees, a welcome benefit on top of the direct support you get along the way.",
                  },
                ].map((item) => (
                  <div key={item.n} className="relative pl-0 md:border-l md:border-[#3f5f4a]/20 md:pl-8 md:first:pl-0 md:first:border-l-0">
                    <div className="font-serif text-3xl text-[#3f5f4a]/35">{item.n}</div>
                    <h3 className="mt-2 text-base font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-2.5 text-sm leading-6 text-slate-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* BEACHES — asymmetric feature/support pair instead of two matching
          cards; no new imagery, so hierarchy comes from scale, an accent
          rule, and a tinted supporting panel rather than a photo. */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="North Shore Beaches"
            title="Discover the Magic of Oahu’s North Shore"
            desc="Spend your mornings strolling along quiet beaches, your afternoons snorkeling in clear waters or exploring scenic coastal trails, and your evenings enjoying unforgettable sunsets just steps from your villa. From iconic surf beaches to local eateries, every day on the North Shore offers a new experience waiting to be discovered."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-5 lg:gap-8">
            <Reveal className="lg:col-span-3">
              <div className="h-full rounded-3xl bg-white border border-slate-200 p-8 md:p-10 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
                <span className="text-xs font-bold uppercase tracking-widest text-[#3f5f4a]">Featured Beach</span>
                <h3 className="mt-3 font-serif text-2xl text-slate-900 md:text-3xl">Kokololio Beach Park, Hauula</h3>
                <div className="mt-4 h-px w-12 bg-[#3f5f4a]/30" aria-hidden="true" />
                <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                  A quieter stretch of North Shore coastline with soft sand, shaded grassy areas, and picnic tables. It
                  draws a local crowd and has an easy, family-friendly feel that&apos;s hard to find in busier parts of
                  Oahu. The kind of place you stay all day without the rush.
                </p>
              </div>
            </Reveal>
            <Reveal delay={120} className="lg:col-span-2">
              <div className="h-full rounded-3xl bg-[#3f5f4a] p-8 md:p-10 text-white flex flex-col justify-center">
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">The Local Rhythm</span>
                <p className="mt-4 font-serif text-xl leading-snug md:text-2xl">
                  Fewer crowds, more space, and that genuinely relaxed local rhythm.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-white/75">
                  Whether you&apos;re watching a winter swell roll in or just setting up for a quiet afternoon, this
                  coastline offers something more authentic than most visitors to Oahu ever find.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section id="featured" className="py-16 md:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionTitle
              eyebrow="The Collection"
              title="Find the Villa That Fits Your Perfect Vacation"
              desc="Whether guests are gathering the entire family, celebrating a milestone, planning a couples’ retreat, or simply looking for a relaxing escape, each Ocean Villa offers thoughtfully designed spaces, luxury amenities, and the comfort of feeling at home in paradise."
            />
            <Link
              href="/rentals"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#3f5f4a] hover:text-[#334e3c] md:mb-1"
            >
              Browse the full collection
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="mt-10 md:mt-12">
            {listingsLoading ? (
              <div className="text-center py-20 text-slate-500">Loading featured villas...</div>
            ) : listingsError ? (
              <div className="text-center py-20 text-red-500 bg-red-50 rounded-2xl mx-4 md:mx-0">{listingsError}</div>
            ) : (
              <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {listings.map((l) => (
                  <ListingCard key={l.id} l={l} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* INTERNAL SEO LINKS */}
      <section className="py-16 md:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Plan Your Stay"
            title="Explore more of Ocean Villas at Turtle Bay"
            desc="Everything you need to plan your North Shore stay, from villa details and local beaches to live availability and direct booking."
          />

          <Reveal className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <GuideCard
              href="/rentals"
              title="Browse Rentals"
              desc="See the full collection of North Shore villas and compare layouts, guest capacity, and options."
            />
            <GuideCard
              href="/location"
              title="Explore the Location"
              desc="Discover what's around Turtle Bay: surf breaks, local beaches, and the best of the North Shore."
            />
            <GuideCard
              href="/amenities"
              title="View Amenities"
              desc="Review what's included in each villa: comfort, access, and lifestyle details before you book."
            />
            <GuideCard
              href="/availability"
              title="Check Availability"
              desc="Search live dates, see which villas are open, and continue straight into booking."
            />
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="FAQ"
            title="Questions guests ask before booking"
            desc="Quick answers on booking direct, getting here, and what's included — the same things our team hears most before a stay."
          />

          <div className="mt-10 space-y-4">
            <FAQItem
              question="How many guests can each villa sleep?"
              answer={occupancyAnswer}
            />
            <FAQItem
              question="How do I book a villa at Ocean Villas at Turtle Bay?"
              answer="Use the availability search above to select your dates and number of guests, then continue directly into the booking path. No third-party platform required."
            />
            <FAQItem
              question="How far are Ocean Villas from Honolulu International Airport?"
              answer="The villas are approximately 35 miles north of HNL, about a 45 to 60 minute drive via H-2 and Kamehameha Highway, with scenic views once you reach the North Shore."
            />
            <FAQItem
              question="What beaches and surf spots are near Turtle Bay?"
              answer="Banzai Pipeline is 12 minutes away, Waimea Bay 10 minutes, Shark’s Cove 11 minutes, and Haleiwa Town 15 minutes. Turtle Bay Resort beach is a 2-minute walk from the villas."
            />
            <FAQItem
              question="What is included in the nightly rate?"
              answer="Each villa includes a fully equipped gourmet kitchen, high-speed WiFi, a private lanai, beach gear (chairs, umbrellas, snorkel sets), and dedicated parking. Rates are sourced directly from Hostaway with no platform markups. Turtle Bay Resort amenities such as pool access are separate — see the amenities page for confirmed details."
            />
            <FAQItem
              question="Is Turtle Bay better than staying in Waikiki?"
              answer="Turtle Bay offers a private-villa experience far from the crowds of Waikiki. Guests enjoy direct beach access, world-class surf nearby, and a more authentic island pace, with all the comfort of a luxury villa."
            />
            <FAQItem
              question="Why stay at Ocean Villas instead of a hotel at Turtle Bay?"
              answer="Ocean Villas combines the luxury and convenience of a resort setting with the comfort and privacy of a spacious vacation home. Guests can enjoy multiple bedrooms, full kitchens, expansive living areas, private lanais where applicable, and room for families and groups to relax together—all while staying close to the beaches and experiences that make Turtle Bay and Oahu’s North Shore a sought-after destination."
            />
            <FAQItem
              question="Is Ocean Villas at Turtle Bay part of Turtle Bay Resort?"
              answer="No. Ocean Villas at Turtle Bay is an independently operated collection of private vacation rental villas located near Turtle Bay Resort, not owned or operated by the resort. Some resort dining, golf, spa, and recreational experiences may be available to villa guests separately, but they are not included, complimentary, or guaranteed with a villa stay — see the amenities page for confirmed details."
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-50 py-10 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <div className="text-lg md:text-xl font-serif font-bold text-slate-900">{BRAND.name}</div>
            <div className="mt-1 text-sm text-slate-500">{BRAND.sub}</div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-500">
            <Link href="/rentals" className="hover:text-slate-700 transition">Villas</Link>
            <Link href="/amenities" className="hover:text-slate-700 transition">Amenities</Link>
            <Link href="/location" className="hover:text-slate-700 transition">Location</Link>
            <Link href="/availability" className="hover:text-slate-700 transition">Availability</Link>
            <Link href="/about" className="hover:text-slate-700 transition">About</Link>
            <Link href="/contact" className="hover:text-slate-700 transition">Contact</Link>
          </nav>

          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </div>
        </div>
      </footer>

      <MobileStickyBookingBar checkDatesHref="#availability" />
    </main>
  );
}
