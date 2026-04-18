"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { buildBookingUrl } from "@/lib/ocean-villas";

// ─── Types ────────────────────────────────────────────────────

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
  amenities?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  bookingEngineBase?: string;
};

// ─── Constants ────────────────────────────────────────────────

const GHL_FORM_BASE = "https://api.leadconnectorhq.com/widget/form/ZSl4b5HMWIr8ULY5bAGa";
const BRAND_PHONE = "(858) 345-2082";
const BRAND_NAME = "Ocean Villas at Turtle Bay";

// ─── Helpers ─────────────────────────────────────────────────

function sanitizeTel(phone: string) {
  return (phone || "").replace(/[^\d+]/g, "") || phone;
}

/**
 * Lightweight analytics stub. Wire to GA4, Segment, Mixpanel, or any other
 * analytics platform. Safe to call server-side (no-ops silently).
 *
 * Examples:
 *   GA4:    window.gtag?.("event", event, data)
 *   Segment: window.analytics?.track(event, data)
 */
function trackEvent(event: string, data?: Record<string, string | number>) {
  try {
    if (typeof window === "undefined") return;
    // Replace with your analytics calls:
    // window.gtag?.("event", event, data);
    if (process.env.NODE_ENV !== "production") {
      console.debug("[OceanVillas]", event, data);
    }
  } catch { /* analytics must never break the UI */ }
}

// ─── Scroll-reveal component ──────────────────────────────────
//
// Adds .ov-reveal class after mount (so SSR renders normally),
// then .ov-visible when the element enters the viewport.
// CSS transitions (defined in globals.css) handle the animation.

function RevealSection({
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

    // Mark hidden (transition starting point)
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
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

// ─── StatBadge ───────────────────────────────────────────────

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center min-w-[80px] flex-1 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}

function CheckTimeBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

// ─── Gallery ─────────────────────────────────────────────────

function Gallery({ images, title }: { images: string[]; title: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const safeImages = images.length > 0 ? images : ["/media/rentals/placeholder.jpg"];
  const active = safeImages[activeIdx] || safeImages[0];

  return (
    // ov-gallery-enter: CSS animation defined in globals.css for the initial entrance
    <div className="space-y-3 ov-gallery-enter">
      {/* Main image */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-200 shadow-[0_12px_48px_rgba(15,23,42,0.14)]">
        {/*
          key={active} forces remount on image switch → triggers ov-img-crossfade.
          priority only on first image for LCP.
        */}
        <Image
          key={active}
          src={active}
          alt={`${title} — photo ${activeIdx + 1}`}
          fill
          unoptimized
          className="object-cover ov-img-crossfade"
          priority={activeIdx === 0}
        />

        {/* Photo counter pill */}
        {safeImages.length > 1 && (
          <div className="absolute bottom-4 right-4 rounded-full bg-black/48 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white tabular-nums select-none">
            {activeIdx + 1} / {safeImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {safeImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
          {safeImages.slice(0, 12).map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={[
                "relative shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200",
                "w-16 h-11 sm:w-[78px] sm:h-14",
                i === activeIdx
                  ? "border-slate-900 opacity-100 shadow-[0_4px_12px_rgba(15,23,42,0.18)] scale-[1.03]"
                  : "border-transparent opacity-45 hover:opacity-80 hover:border-slate-300",
              ].join(" ")}
              aria-label={`View photo ${i + 1}`}
              aria-pressed={i === activeIdx}
            >
              <Image
                src={src}
                alt={`${title} thumbnail ${i + 1}`}
                fill
                unoptimized
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Description helpers ─────────────────────────────────────
//
// NOTE: By the time text reaches parseDescription, the caller has already
// run .replace(/\s+/g, " ") — collapsing all newlines into spaces.
// The parser must therefore work on flat, single-paragraph text.
// The primary structure to detect is inline • bullet separators.

function splitOverview(text: string): { overview: string; remainder: string } {
  if (!text) return { overview: "", remainder: "" };

  // Collect sentence-ending chunks
  const re = /[^.!?]*[.!?]+/g;
  const sentences: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) sentences.push(m[0]);
  // Capture any trailing fragment that lacks ending punctuation
  const consumed = sentences.reduce((n, s) => n + s.length, 0);
  if (consumed < text.length) sentences.push(text.slice(consumed));

  // Short descriptions — show in full, no "Read more" needed
  if (sentences.length <= 2) return { overview: text.trim(), remainder: "" };

  // Always take at least the first sentence; add the second only when the
  // first is short enough that two sentences still feel like an intro.
  const first = sentences[0];
  let cut = 1;
  let overview = first;
  if (first.trim().length < 200 && sentences.length > 1) {
    overview += sentences[1];
    cut = 2;
  }

  return { overview: overview.trim(), remainder: sentences.slice(cut).join("").trim() };
}

// ─── Description parser ───────────────────────────────────────

type ParsedDescription = {
  overview: string;
  highlights: string[];
  details: string[];
};

function parseDescription(raw: string): ParsedDescription {
  const text = raw.trim();
  if (!text) return { overview: "", highlights: [], details: [] };

  // ── Path A: inline bullet separators (•, ·, ▪) ───────────────
  // Hostaway descriptions commonly use • mid-sentence as list delimiters,
  // e.g. "Great villa! • Ocean views • Private pool • Sleeps 8 • More text."
  const inlineBulletCount = (text.match(/[•·▪]/g) || []).length;

  if (inlineBulletCount >= 2) {
    const segments = text.split(/\s*[•·▪]\s*/).map(s => s.trim()).filter(Boolean);

    // First segment = prose intro → extract 1-2 sentence overview from it
    const { overview, remainder: introRemainder } = splitOverview(segments[0] || "");

    const highlights: string[] = [];
    const longTexts: string[] = [];

    for (const seg of segments.slice(1)) {
      // Strip trailing punctuation for cleaner display
      const clean = seg.replace(/[.!?,;]\s*$/, "").trim();
      // Short, single-clause items → highlights; long prose → details
      if (clean.length <= 110 && !/\.\s+[A-Z]/.test(clean)) {
        highlights.push(clean);
      } else {
        longTexts.push(seg);
      }
    }

    return {
      overview,
      highlights,
      details: [introRemainder, ...longTexts].filter(Boolean),
    };
  }

  // ── Path B: line-based bullets (newlines intact, rare after preprocessing) ─
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
  const bulletLineRe = /^[\-*►✓✔▸]|\d+\.\s/;

  if (lines.length > 2 && lines.filter(l => bulletLineRe.test(l)).length >= 2) {
    const proseLines: string[] = [];
    const highlights: string[] = [];
    const detailLines: string[] = [];
    let seenBullets = false;

    for (const line of lines) {
      if (bulletLineRe.test(line)) {
        seenBullets = true;
        highlights.push(
          line.replace(/^[\-*►✓✔▸]\s*/, "").replace(/^\d+\.\s*/, "").trim()
        );
      } else if (!seenBullets) {
        proseLines.push(line);
      } else {
        detailLines.push(line);
      }
    }

    const { overview, remainder } = splitOverview(proseLines.join(" "));
    return {
      overview,
      highlights,
      details: [remainder, detailLines.join(" ")].filter(Boolean),
    };
  }

  // ── Path C: plain prose — sentence-based split ────────────────
  const { overview, remainder } = splitOverview(text);
  return {
    overview,
    highlights: [],
    details: remainder ? [remainder] : [],
  };
}

// ─── Description ─────────────────────────────────────────────

function DescriptionSection({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const parsed = useMemo(() => parseDescription(description), [description]);
  const hasHighlights = parsed.highlights.length > 0;
  const hasDetails = parsed.details.length > 0;

  return (
    <RevealSection className="mt-10">
      <h2 className="text-xl font-semibold text-slate-900 mb-5">About this villa</h2>

      <div className="space-y-6">
        {/* Overview — always visible, 1–2 sentences max */}
        {parsed.overview ? (
          <p className="text-[15px] leading-8 text-slate-600 font-light max-w-[72ch]">
            {parsed.overview}
          </p>
        ) : (
          /* Safety fallback — should not normally be reached */
          <p className="text-[15px] leading-8 text-slate-600 font-light max-w-[72ch]">
            {description}
          </p>
        )}

        {/* Highlights grid — extracted from inline • bullets */}
        {hasHighlights && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              Highlights
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
              {parsed.highlights.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-6">
                  <svg
                    className="h-4 w-4 shrink-0 mt-[3px] text-[#3f5f4a]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expandable details — hidden behind "Read more" */}
        {hasDetails && (
          <div>
            {expanded && (
              <div className="space-y-4 mb-4 pt-1 border-t border-slate-100">
                {parsed.details.map((block, i) => (
                  <p key={i} className="text-sm leading-7 text-slate-500">
                    {block}
                  </p>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-200"
            >
              {expanded ? "Show less" : "Read more"}
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </RevealSection>
  );
}

// ─── Amenities ────────────────────────────────────────────────

function AmenitiesSection({ amenities }: { amenities: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const LIMIT = 12;
  const shown = expanded ? amenities : amenities.slice(0, LIMIT);
  const hasMore = amenities.length > LIMIT;

  if (!amenities.length) return null;

  return (
    <RevealSection className="mt-10" delay={80}>
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Amenities</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {shown.map((a, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-xl bg-white border border-slate-100 px-3 py-2.5 text-sm text-slate-700 shadow-[0_1px_4px_rgba(15,23,42,0.04)]"
          >
            <svg
              className="h-3.5 w-3.5 shrink-0 text-[#3f5f4a]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="truncate">{a}</span>
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-sm font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-600 transition-colors duration-200"
        >
          {expanded ? "Show fewer amenities" : `Show all ${amenities.length} amenities`}
        </button>
      )}
    </RevealSection>
  );
}

// ─── Booking Card ─────────────────────────────────────────────
//
// Self-contained: manages its own date/guest state (initialised from URL
// params), computes the booking URL dynamically, and fetches availability +
// pricing from /api/hostaway/pricing whenever dates are set.
// The final "Continue to Book" hands off to Hostaway with dates pre-filled.

type PricingResult = {
  isAvailable: boolean;
  hasPricing: boolean;
  avgNightlyPrice: number;
};

function BookingCard({
  onInquire,
  startDate,
  endDate,
  guests,
  villaName,
  listingId,
  bookingEngineBase,
}: {
  onInquire: () => void;
  startDate: string;
  endDate: string;
  guests: string;
  villaName: string;
  listingId: string;
  bookingEngineBase?: string | null;
}) {
  const today = useMemo(() => {
    const d = new Date();
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
  }, []);

  const [localCheckIn, setLocalCheckIn] = useState(startDate);
  const [localCheckOut, setLocalCheckOut] = useState(endDate);
  const [localGuests, setLocalGuests] = useState(Number(guests) || 2);

  const nights = useMemo(() => {
    if (!localCheckIn || !localCheckOut) return 0;
    const n = Math.round(
      (new Date(localCheckOut).getTime() - new Date(localCheckIn).getTime()) / 86_400_000
    );
    return n > 0 ? n : 0;
  }, [localCheckIn, localCheckOut]);

  const hasDates = nights > 0;

  const dynamicBookUrl = useMemo(
    () =>
      buildBookingUrl(listingId, bookingEngineBase, {
        startDate: localCheckIn || undefined,
        endDate: localCheckOut || undefined,
        guests: localGuests,
      }),
    [listingId, bookingEngineBase, localCheckIn, localCheckOut, localGuests]
  );

  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  useEffect(() => {
    if (!localCheckIn || !localCheckOut || localCheckIn >= localCheckOut) {
      setPricing(null);
      return;
    }
    let alive = true;
    setPricingLoading(true);
    setPricing(null);
    fetch(
      `/api/hostaway/pricing?listingId=${encodeURIComponent(listingId)}` +
        `&startDate=${encodeURIComponent(localCheckIn)}&endDate=${encodeURIComponent(localCheckOut)}`,
      { cache: "no-store" }
    )
      .then((r) => r.json())
      .then((json) => {
        if (!alive || !json?.success) return;
        setPricing({
          isAvailable: !!json.isAvailable,
          hasPricing: !!json.hasPricing,
          avgNightlyPrice: json.avgNightlyPrice ?? 0,
        });
      })
      .catch(() => {})
      .finally(() => { if (alive) setPricingLoading(false); });
    return () => { alive = false; };
  }, [listingId, localCheckIn, localCheckOut]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_12px_48px_rgba(15,23,42,0.09)]">

      {/* ── Date + guest selector ──────────────────────────── */}
      <div className="mb-5 space-y-3">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {hasDates ? "Your stay" : "Select dates"}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">Check-in</label>
            <input
              type="date"
              min={today}
              value={localCheckIn}
              onChange={(e) => {
                const v = e.target.value;
                setLocalCheckIn(v);
                if (localCheckOut && v >= localCheckOut) setLocalCheckOut("");
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">Check-out</label>
            <input
              type="date"
              min={localCheckIn || today}
              value={localCheckOut}
              onChange={(e) => setLocalCheckOut(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-[10px] text-slate-400 mb-1">Guests</label>
            <select
              value={localGuests}
              onChange={(e) => setLocalGuests(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i === 0 ? "Guest" : "Guests"}
                </option>
              ))}
            </select>
          </div>
          {nights > 0 && (
            <div className="shrink-0 flex flex-col items-center justify-center rounded-xl bg-slate-100 border border-slate-200 px-4 min-w-[64px]">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Nights</span>
              <span className="text-sm font-bold text-slate-900">{nights}</span>
            </div>
          )}
        </div>

        {/* Availability + pricing badge */}
        {pricingLoading && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-400 animate-pulse">
            Checking availability…
          </div>
        )}
        {!pricingLoading && pricing && (
          <div
            className={`rounded-xl px-3 py-2 text-xs font-medium ${
              pricing.isAvailable
                ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                : "bg-red-50 text-red-700 border border-red-100"
            }`}
          >
            {pricing.isAvailable
              ? pricing.hasPricing
                ? `Available · ~$${Math.round(pricing.avgNightlyPrice).toLocaleString()}/night`
                : "Available for these dates"
              : "Not available — try different dates"}
          </div>
        )}
      </div>

      {/* ── Primary CTA — Booking (Hostaway) ──────────────── */}
      <a
        href={dynamicBookUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          trackEvent("booking_click", { villa: villaName, listing_id: listingId, nights: String(nights) })
        }
        className={[
          "flex items-center justify-center w-full rounded-2xl px-6 py-4",
          "bg-[#0f172a] text-white text-sm font-semibold",
          "shadow-[0_4px_18px_rgba(15,23,42,0.20)]",
          "hover:-translate-y-0.5 hover:bg-[#1e293b] hover:shadow-[0_8px_28px_rgba(15,23,42,0.28)]",
          "active:translate-y-0 active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2",
          "transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        ].join(" ")}
      >
        {hasDates ? "Continue to Book" : "Check Availability & Book"}
        <svg className="ml-2 h-4 w-4 opacity-55" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>

      {/* ── Secondary CTA — Inquiry (GHL) ─────────────────── */}
      <button
        type="button"
        onClick={() => {
          trackEvent("inquiry_open", { villa: villaName, listing_id: listingId, source: "sidebar" });
          onInquire();
        }}
        className={[
          "mt-3 flex items-center justify-center w-full rounded-2xl px-6 py-4",
          "bg-[#3f5f4a] text-white text-sm font-semibold",
          "shadow-[0_4px_18px_rgba(63,95,74,0.22)]",
          "hover:-translate-y-0.5 hover:bg-[#334e3c] hover:shadow-[0_8px_28px_rgba(63,95,74,0.30)]",
          "active:translate-y-0 active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3f5f4a] focus-visible:ring-offset-2",
          "transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        ].join(" ")}
      >
        <svg className="mr-2 h-4 w-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Ask About This Villa
      </button>

      <p className="mt-5 text-center text-[11px] text-slate-400 leading-5">
        Final booking via Hostaway · Our team responds within hours
      </p>
    </div>
  );
}

// ─── Inquiry Modal ────────────────────────────────────────────

function InquiryModal({
  open,
  onClose,
  villaName,
  listingId,
}: {
  open: boolean;
  onClose: () => void;
  villaName: string;
  listingId: string;
}) {
  const formUrl = [
    GHL_FORM_BASE,
    `?villa=${encodeURIComponent(villaName)}`,
    `&listing_id=${encodeURIComponent(listingId)}`,
    `&source=${encodeURIComponent("oceanvillasturtlebay.com")}`,
    `&Villa_of_Interest=${encodeURIComponent(villaName)}`,
  ].join("");

  // Escape key closes modal
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll + manage GHL widget z-index via body class
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("ov-modal-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("ov-modal-open");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("ov-modal-open");
    };
  }, [open]);

  if (!open) return null;

  return (
    // z-[500] — sits above sticky bars (z-50), GHL widget (~9999 is suppressed to 90 via .ov-modal-open CSS)
    <div
      className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Villa inquiry form"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/65 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel: bottom sheet on mobile, centered dialog on sm+ */}
      <div className="relative z-10 w-full sm:max-w-lg flex flex-col bg-white rounded-t-3xl sm:rounded-3xl shadow-[0_32px_80px_rgba(15,23,42,0.28)] overflow-hidden max-h-[92vh]">

        {/* Modal header */}
        <div className="flex items-start justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Ask About This Villa</h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Our team responds within a few hours
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 shrink-0 flex items-center justify-center h-9 w-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            aria-label="Close inquiry form"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Villa context strip */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50 border-b border-slate-100 shrink-0">
          <p className="text-xs text-slate-500">
            Inquiring about:{" "}
            <span className="font-semibold text-slate-800">{villaName}</span>
          </p>
        </div>

        {/* GHL form iframe */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <iframe
            src={formUrl}
            title="Villa Inquiry Form"
            className="w-full"
            style={{ minHeight: "520px", border: "none", display: "block" }}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="sticky top-0 z-50 h-16 md:h-20 border-b border-slate-200 bg-white/90 backdrop-blur-md" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10 animate-pulse">
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-10">
          <div className="space-y-4">
            <div className="aspect-[16/9] w-full rounded-3xl bg-slate-200" />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-[78px] h-14 rounded-xl bg-slate-200 shrink-0" />
              ))}
            </div>
            <div className="mt-8 h-7 w-2/3 rounded-xl bg-slate-200" />
            <div className="h-4 w-1/3 rounded-lg bg-slate-200" />
            <div className="flex gap-3 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 h-[72px] rounded-2xl bg-slate-200" />
              ))}
            </div>
            <div className="mt-10 h-44 rounded-2xl bg-slate-200" />
            <div className="mt-10 h-60 rounded-2xl bg-slate-200" />
          </div>
          <div className="hidden lg:block">
            <div className="h-72 rounded-3xl bg-slate-200" />
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Page content (wrapped in Suspense for useSearchParams) ───

function ListingDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = useMemo(() => {
    const raw = params?.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const guests = searchParams.get("guests") || "2";

  const [listing, setListing] = useState<HostawayListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const openInquiry = useCallback(() => setInquiryOpen(true), []);
  const closeInquiry = useCallback(() => setInquiryOpen(false), []);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!id) {
        setError("Missing listing ID.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/hostaway/listings?id=${encodeURIComponent(id)}`, {
          cache: "no-store",
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success || !json?.listing) {
          throw new Error("Listing not found.");
        }
        if (!alive) return;
        setListing(json.listing as HostawayListing);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load listing.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [id]);

  const backHref = startDate && endDate
    ? `/availability?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&guests=${encodeURIComponent(guests)}`
    : "/rentals";

  const bookUrl = listing ? buildBookingUrl(listing.id, listing.bookingEngineBase) : "#";

  // ── Loading ───────────────────────────────────────
  if (loading) return <LoadingSkeleton />;

  // ── Error ─────────────────────────────────────────
  if (error || !listing) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h1 className="text-2xl font-serif text-red-800">Unable to load villa</h1>
            <p className="mt-4 text-sm text-red-700">{error || "Listing not found."}</p>
            <div className="mt-6">
              <Link
                href={backHref}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                ← Go Back
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Derived values ────────────────────────────────
  const title = listing.name || `Villa ${listing.id}`;
  const locationLabel = listing.city
    ? `${listing.city}${listing.state ? `, ${listing.state}` : ""}`
    : "Turtle Bay · North Shore, Oahu";
  const description = (listing.description || "").replace(/\s+/g, " ").trim()
    || "Explore this Ocean Villas property at Turtle Bay on Oahu's North Shore. Check availability and continue directly into booking.";
  const images = listing.images?.length
    ? listing.images
    : listing.heroUrl
    ? [listing.heroUrl]
    : [];
  const amenities = listing.amenities || [];

  return (
    <>
      <InquiryModal
        open={inquiryOpen}
        onClose={closeInquiry}
        villaName={title}
        listingId={listing.id}
      />

      {/* pb-24 lg:pb-0 = clearance for mobile sticky bottom bar */}
      <main className="min-h-screen bg-slate-50 text-slate-900 pb-24 lg:pb-0">

        {/* ── Header ──────────────────────────────────────── */}
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              href={backHref}
              onClick={() => trackEvent("back_to_browse", { from: `listing_${listing.id}` })}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors duration-200"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back to Browse</span>
              <span className="sm:hidden">Back</span>
            </Link>

            <Link
              href="/"
              className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors duration-200"
            >
              {BRAND_NAME}
            </Link>

            <a
              href={`tel:${sanitizeTel(BRAND_PHONE)}`}
              className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200"
            >
              {BRAND_PHONE}
            </a>
          </div>
        </header>

        {/* ── Page body ───────────────────────────────────── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10 xl:py-14">
          <div className="lg:grid lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] lg:gap-10 xl:gap-14 lg:items-start">

            {/* ── Left column ─────────────────────────────── */}
            <div className="min-w-0">

              {/* Gallery — CSS entrance animation (ov-gallery-enter in globals.css) */}
              <Gallery images={images} title={title} />

              {/* Villa identity — CSS fade-up on page load */}
              <div className="mt-8 ov-fade-up">
                <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4">
                  Villa #{listing.id} · Ocean Villas at Turtle Bay
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 leading-tight">
                  {title}
                </h1>

                <p className="mt-3 flex items-center gap-2 text-base text-slate-500">
                  <svg
                    className="h-4 w-4 shrink-0 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {locationLabel}
                </p>
              </div>

              {/* Stats badges — fade-up as a row */}
              <div className="mt-6 flex flex-wrap gap-2 sm:gap-3 ov-fade-up ov-fade-up-2">
                <StatBadge
                  label="Sleeps"
                  value={listing.maxGuests ? String(listing.maxGuests) : "—"}
                />
                <StatBadge
                  label="Bedrooms"
                  value={listing.bedrooms ? String(listing.bedrooms) : "—"}
                />
                <StatBadge
                  label="Bathrooms"
                  value={listing.bathrooms ? String(listing.bathrooms) : "—"}
                />
              </div>

              {/* Check-in / check-out times */}
              {(listing.checkInTime || listing.checkOutTime) && (
                <div className="mt-3 flex flex-wrap gap-2 sm:gap-3 ov-fade-up ov-fade-up-3">
                  {listing.checkInTime && (
                    <CheckTimeBadge label="Check-in from" value={listing.checkInTime} />
                  )}
                  {listing.checkOutTime && (
                    <CheckTimeBadge label="Check-out by" value={listing.checkOutTime} />
                  )}
                </div>
              )}

              {/* Description — scroll reveal */}
              <DescriptionSection description={description} />

              {/* Amenities — scroll reveal */}
              <AmenitiesSection amenities={amenities} />

              {/* Inline booking card — mobile only, scroll reveal */}
              <RevealSection className="mt-10 lg:hidden" delay={60}>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Book or Inquire</h2>
                <BookingCard
                  onInquire={openInquiry}
                  startDate={startDate}
                  endDate={endDate}
                  guests={guests}
                  villaName={title}
                  listingId={listing.id}
                  bookingEngineBase={listing.bookingEngineBase}
                />
              </RevealSection>
            </div>

            {/* ── Right column — sticky desktop sidebar ────── */}
            <div className="hidden lg:block lg:sticky lg:top-28 shrink-0">
              <BookingCard
                onInquire={openInquiry}
                startDate={startDate}
                endDate={endDate}
                guests={guests}
                villaName={title}
                listingId={listing.id}
                bookingEngineBase={listing.bookingEngineBase}
              />

              {/* Contact support card */}
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Have questions?
                </p>
                <p className="text-sm text-slate-600 leading-6">
                  Call{" "}
                  <a
                    href={`tel:${sanitizeTel(BRAND_PHONE)}`}
                    className="font-semibold text-slate-900 hover:underline hover:underline-offset-2"
                  >
                    {BRAND_PHONE}
                  </a>{" "}
                  or click &ldquo;Ask About This Villa&rdquo; above — our team
                  responds within a few hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile sticky bottom bar ─────────────────────── */}
        {/*
          z-[60]: above regular page content but below the modal (z-[500]).
          GHL widget is lifted to 80px above bottom via globals.css.
        */}
        <div className="fixed bottom-0 left-0 right-0 z-[60] lg:hidden bg-white/96 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-[0_-6px_28px_rgba(15,23,42,0.09)]">
          <div className="flex gap-2.5 max-w-lg mx-auto">
            {/* Ask CTA — olive green */}
            <button
              type="button"
              onClick={() => {
                trackEvent("inquiry_open", { villa: title, listing_id: listing.id, source: "mobile_bar" });
                openInquiry();
              }}
              className={[
                "flex-1 inline-flex items-center justify-center rounded-xl px-3 py-3.5",
                "bg-[#3f5f4a] text-white text-sm font-semibold",
                "shadow-[0_3px_12px_rgba(63,95,74,0.22)]",
                "hover:-translate-y-px hover:bg-[#334e3c] hover:shadow-[0_6px_20px_rgba(63,95,74,0.28)]",
                "active:translate-y-0 active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3f5f4a] focus-visible:ring-offset-2",
                "transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
              ].join(" ")}
            >
              <svg
                className="mr-1.5 h-4 w-4 opacity-80 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Ask About Villa
            </button>

            {/* Book CTA — navy */}
            <a
              href={bookUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("booking_click", { villa: title, listing_id: listing.id, source: "mobile_bar" })}
              className={[
                "flex-1 inline-flex items-center justify-center rounded-xl px-3 py-3.5",
                "bg-[#0f172a] text-white text-sm font-semibold",
                "shadow-[0_3px_12px_rgba(15,23,42,0.22)]",
                "hover:-translate-y-px hover:bg-[#1e293b] hover:shadow-[0_6px_20px_rgba(15,23,42,0.28)]",
                "active:translate-y-0 active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2",
                "transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
              ].join(" ")}
            >
              Book Now
            </a>
          </div>
        </div>
      </main>
    </>
  );
}

// ─── Default export ───────────────────────────────────────────

export default function ListingDetailsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ListingDetailsContent />
    </Suspense>
  );
}
