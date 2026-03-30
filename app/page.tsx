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
  bookingEngineBase?: string;
};

const SITE_URL = "https://oceanvillasturtlebay.com";

const BRAND = {
  name: "Ocean Villas at Turtle Bay",
  sub: "Luxury Vacation Rentals on Oahu’s North Shore",
  phone: "(858) 345-2082",
};

const LISTING_IDS = ["489089", "489093", "489095", "489097", "489092", "489094"] as const;

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

function clampText(s: string, max = 140) {
  const clean = (s || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trimEnd() + "…";
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
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_16px_50px_rgba(15,23,42,0.1)]"
    >
      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{desc}</p>
      <span className="mt-5 inline-flex text-sm font-semibold text-slate-900">
        Explore →
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
  const title = l.name || `Villa ${l.id}`;
  const subtitle =
    clampText(l.description || "", 110) ||
    `Browse this Turtle Bay villa on Oahu’s North Shore and explore live availability, stay details, and direct booking options.`;

  const hero = l.heroUrl || "/media/rentals/placeholder.jpg";
  const base = (l.bookingEngineBase || "https://182003_1.holidayfuture.com").replace(/\/$/, "");
  const bookUrl = `${base}/listings/${encodeURIComponent(l.id)}`;
  const detailUrl = `/listing/${encodeURIComponent(l.id)}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_6px_26px_rgba(15,23,42,0.06)] border border-slate-100 transition-all duration-300 hover:shadow-[0_18px_60px_rgba(15,23,42,0.14)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
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

      <div className="flex flex-col flex-grow p-5 md:p-6">
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm text-slate-500">
            {subtitle}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
          <Stat label="Sleeps" value={`${l.maxGuests ?? "-"}`} />
          <Stat label="Beds" value={`${l.bedrooms ?? "-"}`} />
          <Stat label="Baths" value={`${l.bathrooms ?? "-"}`} />
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href={detailUrl}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            View Villa
          </Link>

          <a
            href={bookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Book Direct
          </a>
        </div>
      </div>
    </article>
  );
}

/**
 * Desktop video seam fix
 */
const videoStyle: React.CSSProperties = { transform: "translateZ(0) scale(1.01)" };

export default function Home() {
  const router = useRouter();
  const today = useMemo(() => formatISO(new Date()), []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        name: "How do I check availability for Ocean Villas at Turtle Bay?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use the availability search on this page to view live dates and start your direct booking flow.",
        },
      },
      {
        "@type": "Question",
        name: "Can I book direct from the Ocean Villas website?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can browse villa details, check availability, and continue into the direct booking path from the website.",
        },
      },
      {
        "@type": "Question",
        name: "Where are Ocean Villas located?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ocean Villas are positioned in the Turtle Bay area on Oahu’s North Shore, giving guests a premium base for a luxury island stay.",
        },
      },
      {
        "@type": "Question",
        name: "Can I browse individual villas before booking?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Featured villas can be explored individually so you can compare layouts, guest capacity, and booking options before you reserve.",
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
      "Luxury vacation rentals at Turtle Bay on Oahu’s North Shore with direct booking and live availability support.",
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

      {/* HEADER */}
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
            <a className="hover:text-slate-900 transition-colors" href="#featured">
              Featured
            </a>
            <a className="hover:text-slate-900 transition-colors" href="#availability">
              Availability
            </a>
            <Link className="hover:text-slate-900 transition-colors" href="/rentals">
              Rentals
            </Link>
            <Link className="hover:text-slate-900 transition-colors" href="/location">
              Location
            </Link>
            <Link className="hover:text-slate-900 transition-colors" href="/amenities">
              Amenities
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-6 z-10">
            <a className="text-sm font-medium text-slate-600 hover:text-slate-900 transition" href={`tel:${sanitizeTel(BRAND.phone)}`}>
              {BRAND.phone}
            </a>
            <a href="#availability">
              <PrimaryButton type="button">Book Now</PrimaryButton>
            </a>
          </div>

          <button className="md:hidden p-2 text-sm font-semibold text-slate-600 z-10" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 shadow-lg absolute w-full z-20">
            <div className="flex flex-col gap-4 text-sm font-medium text-slate-600">
              <a onClick={() => setMobileMenuOpen(false)} href="#featured" className="py-2 hover:text-slate-900">
                Featured Villas
              </a>
              <a onClick={() => setMobileMenuOpen(false)} href="#availability-mobile" className="py-2 hover:text-slate-900">
                Check Availability
              </a>
              <Link onClick={() => setMobileMenuOpen(false)} href="/rentals" className="py-2 hover:text-slate-900">
                Rentals
              </Link>
              <Link onClick={() => setMobileMenuOpen(false)} href="/location" className="py-2 hover:text-slate-900">
                Location
              </Link>
              <Link onClick={() => setMobileMenuOpen(false)} href="/amenities" className="py-2 hover:text-slate-900">
                Amenities
              </Link>
              <a href={`tel:${sanitizeTel(BRAND.phone)}`} className="py-2 hover:text-slate-900">
                Call {BRAND.phone}
              </a>
            </div>
          </div>
        )}
      </header>

      {/* MOBILE */}
      <div className="block md:hidden">
        <div className="relative w-full h-[35vh] min-h-[250px] overflow-hidden bg-black isolate">
          <video
            className="absolute inset-0 h-full w-full object-cover object-center"
            style={{
              transform: "translate3d(-0.5px, 0, 0) scale(1.03)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            src="/media/hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
          <div className="absolute inset-0 bg-slate-900/20" />
        </div>

        <div id="availability-mobile" className="bg-slate-100 border-b border-slate-200 px-4 py-6 shadow-inner">
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
                {Array.from({ length: 14 }).map((_, i) => (
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

        <section className="bg-white px-6 py-10 flex flex-col items-center text-center">
          <div className="flex gap-2 mb-4 flex-wrap justify-center">
            <Pill darkText>Turtle Bay</Pill>
            <Pill tone="gold">North Shore Oahu</Pill>
            <Pill darkText>Direct Booking</Pill>
          </div>

          <h1 className="text-4xl font-serif font-medium tracking-tight text-slate-900 leading-tight">
            Luxury Villas at Turtle Bay
          </h1>

          <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-xl">
            Explore premium vacation rentals on Oahu’s North Shore, browse featured villas, and check live availability for your next Turtle Bay stay.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="#featured"
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              View Villas
            </a>
            <Link
              href="/location"
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
            >
              Explore Location
            </Link>
          </div>
        </section>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block">
        <section id="top" className="relative h-[80vh] w-full overflow-hidden bg-black isolate">
          <video
            className="absolute inset-0 h-full w-full object-cover object-center"
            style={videoStyle}
            src="/media/hero.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-slate-900/45" />

          <div className="absolute inset-0 flex flex-col justify-center pt-16 pb-24">
            <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
              <div className="max-w-4xl">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <Pill>Turtle Bay</Pill>
                  <Pill tone="gold">North Shore Oahu</Pill>
                  <Pill>Direct Booking</Pill>
                </div>

                <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight text-white leading-tight">
                  Luxury Vacation Rentals at Turtle Bay
                </h1>

                <p className="mt-6 max-w-2xl text-lg text-white/90 leading-relaxed">
                  Ocean Villas at Turtle Bay offers a premium North Shore Oahu stay with featured villas, live availability search, and a direct booking path designed for travelers who want a cleaner luxury booking experience.
                </p>

                <div className="mt-10 flex flex-row flex-wrap gap-4">
                  <a
                    href="#availability"
                    className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-bold text-slate-900 bg-white shadow-lg hover:bg-slate-100 transition-all text-center"
                  >
                    Check Availability
                  </a>
                  <a
                    href="#featured"
                    className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-bold text-white border border-white/50 bg-black/20 backdrop-blur-md hover:bg-black/40 hover:border-white transition-all text-center"
                  >
                    View Villas
                  </a>
                  <Link
                    href="/location"
                    className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-bold text-white border border-white/50 bg-black/20 backdrop-blur-md hover:bg-black/40 hover:border-white transition-all text-center"
                  >
                    Explore Turtle Bay
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="availability" className="relative z-10 -mt-12 mb-20">
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
                    {Array.from({ length: 14 }).map((_, i) => (
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
      </div>

      {/* TRUST / POSITIONING */}
      <section className="py-16 md:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Why Ocean Villas"
            title="A stronger luxury booking experience at Turtle Bay"
            desc="This homepage is designed to help guests understand where they are staying, what kind of experience to expect, and how to move from discovery into a direct booking path."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <InfoCard
              title="Luxury North Shore positioning"
              desc="Ocean Villas at Turtle Bay is framed around premium vacation rental intent for guests searching for a higher-end stay on Oahu’s North Shore."
            />
            <InfoCard
              title="Direct booking path"
              desc="Guests can search live availability, review featured villas, and continue into a clean direct booking experience without unnecessary friction."
            />
            <InfoCard
              title="Property-first browsing"
              desc="Featured villas now support stronger internal browsing so visitors and search engines can move deeper into the site before booking."
            />
          </div>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section id="featured" className="py-16 md:py-20 bg-slate-50">
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
            desc="These pages help guests and search engines understand the stay, the setting, and the direct booking journey more clearly."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <GuideCard
              href="/rentals"
              title="Browse Rentals"
              desc="See the broader rental collection and compare available villa options."
            />
            <GuideCard
              href="/location"
              title="Explore the Location"
              desc="Strengthen the Turtle Bay and North Shore context for guests planning their stay."
            />
            <GuideCard
              href="/amenities"
              title="View Amenities"
              desc="Review the comfort, convenience, and lifestyle details that matter before booking."
            />
            <GuideCard
              href="/availability"
              title="Check Availability"
              desc="Move directly into date-based availability for a faster booking decision."
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
              question="How do I check availability for Ocean Villas at Turtle Bay?"
              answer="Use the availability search on this page to view live dates and continue into the booking path."
            />
            <FAQItem
              question="Can I book direct from the website?"
              answer="Yes. The site supports a direct booking journey so guests can browse villas, check availability, and move toward reservation from the website."
            />
            <FAQItem
              question="Where are the villas located?"
              answer="The villas are positioned in the Turtle Bay area on Oahu’s North Shore, making this site especially relevant for guests searching that destination."
            />
            <FAQItem
              question="Can I review individual villas before I book?"
              answer="Yes. You can browse featured villas and open individual villa pages to compare the stay before continuing to book."
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
    </main>
  );
}
