"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
      {eyebrow ? <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{eyebrow}</div> : null}
      <h2 className="text-3xl font-serif tracking-tight text-slate-900 md:text-4xl">{title}</h2>
      {desc ? <p className="mt-4 text-base leading-relaxed text-slate-600">{desc}</p> : null}
    </div>
  );
}

function InfoCard({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{desc}</p>
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
    <details className="group rounded-2xl border border-slate-200 bg-white p-5">
      <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
        {question}
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

        {/* CTA — pinned to card bottom */}
        <div className="mt-4">
          <Link
            href={detailUrl}
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#0f172a] px-4 py-3 text-sm font-semibold text-white shadow-[0_3px_12px_rgba(15,23,42,0.18)] hover:-translate-y-px hover:bg-[#1e293b] hover:shadow-[0_6px_20px_rgba(15,23,42,0.24)] active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2 transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            View Villa
          </Link>
        </div>
      </div>
    </article>
  );
}

const videoStyle: React.CSSProperties = { transform: "translateZ(0) scale(1.01)" };

export default function Home() {
  const router = useRouter();
  const today = useMemo(() => formatISO(new Date()), []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<number>(2);
  const [promo, setPromo] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [listings, setListings] = useState<HostawayListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState<string>("");

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I book a villa at Ocean Villas at Turtle Bay?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use the availability search on the homepage to select your dates and number of guests, then continue directly into the booking path — no third-party platform required.",
        },
      },
      {
        "@type": "Question",
        name: "How far are Ocean Villas from Honolulu International Airport?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ocean Villas at Turtle Bay is approximately 35 miles north of Honolulu International Airport (HNL), about a 45–60 minute drive via H-2 and Kamehameha Highway.",
        },
      },
      {
        "@type": "Question",
        name: "What beaches and surf spots are near Turtle Bay on Oahu’s North Shore?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Banzai Pipeline is 12 minutes away, Waimea Bay 10 minutes, Shark’s Cove 11 minutes, and Haleiwa Town 15 minutes. Turtle Bay Resort beach is a 2-minute walk from the villas.",
        },
      },
      {
        "@type": "Question",
        name: "What is included in the Ocean Villas nightly rate?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Each villa includes a fully equipped gourmet kitchen, high-speed WiFi, resort pool access, private lanai, beach gear (chairs, umbrellas, snorkel sets), and dedicated parking. Rates are sourced directly from Hostaway with no platform markups.",
        },
      },
      {
        "@type": "Question",
        name: "Is Turtle Bay better than staying in Waikiki for an Oahu vacation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Turtle Bay offers a private-villa experience far from the crowds of Waikiki, on Oahu’s quieter, more scenic North Shore. Guests enjoy direct beach access, world-class surf nearby, and a more authentic island lifestyle with all the comforts of a luxury villa.",
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
    name: BRAND.name,
    url: SITE_URL,
    description:
      "Luxury private villa rentals at Turtle Bay on Oahu’s North Shore. Book direct for live availability and transparent pricing — no platform fees.",
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
    numberOfRooms: 7,
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Ocean view", value: true },
      { "@type": "LocationFeatureSpecification", name: "Pool", value: true },
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
      } catch (e) {
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

  function scrollToAvailability(targetId?: "availability" | "availability-mobile") {
    const resolvedTarget =
      targetId || (window.innerWidth < 768 ? "availability-mobile" : "availability");

    const section = document.getElementById(resolvedTarget);
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
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-slate-200">
      <Script
        id="ov-website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Script
        id="ov-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id="ov-lodging-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(lodgingJsonLd) }}
      />

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="relative mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3 z-10 shrink-0">
            <div className="relative h-8 w-8 md:h-10 md:w-10 overflow-hidden">
              <Image src="/brand/TTB-Logo.png" alt={BRAND.name} fill className="object-contain" priority />
            </div>
            <div className="text-lg md:text-xl font-serif font-bold text-slate-900 hidden sm:block">{BRAND.name}</div>
          </a>

          <div className="absolute inset-0 flex items-center justify-center md:hidden pointer-events-none px-14">
            <span className="text-[13px] font-serif font-bold text-[#0A4C61] text-center leading-tight tracking-tight">
              Luxury Villas on Oahu’s North Shore
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 z-10">
            <Link className="hover:text-slate-900 transition-colors" href="/rentals">
              Villas
            </Link>
            <button
              type="button"
              onClick={() => scrollToAvailability("availability")}
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

          <div className="hidden md:flex items-center gap-6 z-10">
            <a className="text-sm font-medium text-slate-600 hover:text-slate-900 transition" href={`tel:+1${sanitizeTel(BRAND.phone)}`}>
              Mira · {BRAND.phone}
            </a>
            <PrimaryButton type="button" onClick={() => scrollToAvailability("availability")}>
              Book Now
            </PrimaryButton>
          </div>

          <button className="md:hidden p-2 text-sm font-semibold text-slate-600 z-10" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 shadow-lg absolute w-full z-20">
            <div className="flex flex-col gap-4 text-sm font-medium text-slate-600">
              <Link onClick={() => setMobileMenuOpen(false)} href="/rentals" className="py-2 hover:text-slate-900">
                Villas
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToAvailability("availability-mobile");
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
              <a href={`tel:+1${sanitizeTel(BRAND.phone)}`} className="py-2 hover:text-slate-900">
                Call Mira · {BRAND.phone}
              </a>
            </div>
          </div>
        )}
      </header>

      <div className="block md:hidden">
        <div className="relative w-full h-[35vh] min-h-[250px] overflow-hidden bg-[#020611] isolate">
          <video
            className="absolute inset-0 h-full w-full object-cover object-center scale-[1.035]"
            style={{
              transform: "translate3d(-0.5px, 0, 0) scale(1.03)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
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
          <div className="absolute inset-0 bg-slate-900/20" />
        </div>

        <section className="bg-white px-4 pt-8 pb-3">
          <div
            id="availability-mobile"
            className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-6 shadow-sm"
          >
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Arrival</label>
                <input
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCheckIn(v);
                    if (checkOut && (v === checkOut || isAfter(v, checkOut))) setCheckOut(addDays(v, 2));
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Departure</label>
                <input
                  type="date"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {Array.from({ length: 10 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Guests
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Promo</label>
                <input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="Optional code"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <PrimaryButton type="button" onClick={onSearch} disabled={loading} className="w-full py-3">
              {loading ? "Searching…" : "Search Availability"}
            </PrimaryButton>

            {error && <div className="mt-3 text-center text-xs text-red-600 font-medium">{error}</div>}
          </div>
        </section>

        <section className="bg-white px-6 py-10 flex flex-col items-center text-center">
          <h1 className="text-4xl font-serif font-medium tracking-tight text-slate-900 leading-tight">
            Luxury Vacation Rentals at Turtle Bay, Oahu’s North Shore
          </h1>

          <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-xl">
            Ocean Villas sits in the heart of Turtle Bay, near the Ritz Carlton. North Shore regulars keep coming back to our villas. Browse featured villas, check live availability, and book direct.
          </p>
        </section>
      </div>

      <div className="hidden md:block">
        <section id="top" className="relative h-[80vh] w-full overflow-hidden bg-[#020611] isolate">
          <video
            className={`absolute inset-0 h-full w-full object-cover object-center scale-[1.035] transition-opacity duration-1000 ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
            style={videoStyle}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
            onCanPlay={() => setVideoReady(true)}
          >
            <source src="/media/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 z-[1] bg-[#020611]/68" />

          <div className="absolute inset-0 z-10 flex flex-col justify-center pt-16 pb-24">
            <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
              <div className="max-w-4xl">
                <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight text-white leading-tight">
                  Luxury Vacation Rentals at Turtle Bay, Oahu's North Shore
                </h1>

                <p className="mt-6 max-w-2xl text-lg text-white/90 leading-relaxed">
                  Ocean Villas sits in the heart of Turtle Bay, near the Ritz Carlton. North Shore regulars keep coming back to our villas. Browse featured villas, check live availability, and book direct.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="availability" className="bg-white pt-14 md:pt-20 pb-16 md:pb-20">
          <div className="mx-auto max-w-5xl px-6">
            <GlassCard className="p-8">
              <div className="flex flex-row items-end gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Check-in</label>
                  <input
                    type="date"
                    min={today}
                    value={checkIn}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCheckIn(v);
                      if (checkOut && (v === checkOut || isAfter(v, checkOut))) setCheckOut(addDays(v, 2));
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Check-out</label>
                  <input
                    type="date"
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="w-32">
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Guests</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    {Array.from({ length: 10 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} Guests
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-44">
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Promo</label>
                  <input
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <PrimaryButton type="button" onClick={onSearch} disabled={loading} className="w-full py-3 h-[48px]">
                    {loading ? "Searching…" : "Search"}
                  </PrimaryButton>
                </div>
              </div>

              {error && <div className="mt-4 text-sm text-red-600 font-medium">{error}</div>}
            </GlassCard>
          </div>
        </section>

      {/* TRUST / POSITIONING */}
      <section className="py-16 md:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Why Book Direct"
            title="The North Shore, without the platform markup"
            desc="Ocean Villas at Turtle Bay is built for guests who want a genuine North Shore experience: private villas, live rates, and a clean direct booking path."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <InfoCard
              title="North Shore access"
              desc="Turtle Bay sits at the far northeast of Oahu, away from the resort crowds, close to legendary surf breaks, local beaches, and the unhurried pace the North Shore is known for."
            />
            <InfoCard
              title="Book direct and save"
              desc="Search live availability, review the full villa, and move directly into booking, without the service fees that third-party travel platforms add on top."
            />
            <InfoCard
              title="Private villa stays"
              desc="These aren’t hotel rooms. Each villa is a full private space, managed through Hostaway for accurate availability and pricing, every time you search."
            />
          </div>
        </div>
      </section>

      {/* BEACHES */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="North Shore Beaches"
            title="Where you'll spend your days"
            desc="The North Shore of Oahu moves at its own pace, less crowded, more local, and a long way from Waikiki. The beaches here don't need much explaining."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <InfoCard
              title="Kokololio Beach Park, Hauula"
              desc="A quieter stretch of North Shore coastline with soft sand, shaded grassy areas, and picnic tables. It draws a local crowd and has an easy, family-friendly feel that's hard to find in busier parts of Oahu. The kind of place you stay all day without the rush."
            />
            <InfoCard
              title="The North Shore beach experience"
              desc="Fewer crowds, more space, scenic shorelines, and that genuinely relaxed local rhythm. Whether you're watching a winter swell roll in or just setting up for a quiet afternoon, this coastline offers something more authentic than most visitors to Oahu ever find."
            />
          </div>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section id="featured" className="py-16 md:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="The Collection"
            title="Featured Turtle Bay Villas"
            desc="Browse curated villas connected to live booking data, then view the individual villa page or continue directly into booking."
          />

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

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="FAQ"
            title="Questions guests ask before booking"
            desc="This section helps both users and search engines understand the site’s purpose, booking flow, and location relevance."
          />

          <div className="mt-10 space-y-4">
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
              answer="Each villa includes a fully equipped gourmet kitchen, high-speed WiFi, resort pool access, private lanai, beach gear (chairs, umbrellas, snorkel sets), and dedicated parking. Rates are sourced directly from Hostaway with no platform markups."
            />
            <FAQItem
              question="Is Turtle Bay better than staying in Waikiki?"
              answer="Turtle Bay offers a private-villa experience far from the crowds of Waikiki. Guests enjoy direct beach access, world-class surf nearby, and a more authentic island pace, with all the comfort of a luxury villa."
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

          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </div>
        </div>
      </footer>
      </div>
    </main>
  );
}
