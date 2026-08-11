"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import TrustSignals from "@/components/TrustSignals";
import { trackEvent } from "@/lib/analytics";
import { type VillaComplianceDetails } from "@/lib/villaCompliance";
import { reorderImages } from "@/lib/villa-display";
import type { HostawayListingDetail } from "@/lib/hostaway-listing";

// ─── Constants ────────────────────────────────────────────────

const GHL_FORM_BASE = "https://api.leadconnectorhq.com/widget/form/ZSl4b5HMWIr8ULY5bAGa";
const BRAND_PHONE = "(858) 727-2427";
const BRAND_NAME = "Ocean Villas at Turtle Bay";

type DescriptionOverride = {
  paragraphs: string[];
  highlights: string[];
};

const LISTING_DESCRIPTION_OVERRIDES: Record<string, DescriptionOverride> = {
  "505671": {
    paragraphs: [
      "Welcome to The View Villa at Ocean Villas at Turtle Bay, a top-floor four-bedroom retreat designed for families, groups, and guests who want a more elevated North Shore stay. Set within the Turtle Bay resort area, this villa pairs ocean-view living with refined comfort, generous indoor space, and easy access to the beaches, resort paths, pool, tennis, oceanfront fitness, dining, and the relaxed rhythm of Oahu's North Shore.",
      "From the private lanai, guests can take in sweeping coastal views, fresh trade winds, and the peaceful setting that makes Turtle Bay one of the most desirable stays on the island. Inside, the villa offers high ceilings, central air conditioning, a well-equipped kitchen, comfortable gathering spaces, premium bedroom setups, and thoughtful beach-day essentials for a seamless stay.",
      "The View Villa is ideal for guests who want more than a standard Oahu rental. It gives you space to settle in, privacy to unwind, and a true North Shore base close to quiet beaches, scenic shoreline, family-friendly beach parks, surf breaks, local farms, Haleiwa, and the natural beauty that makes this side of Oahu feel special.",
    ],
    highlights: [
      "Rare four-bedroom top-floor layout",
      "Ocean-view lanai and elevated coastal perspective",
      "Comfortable living areas for families and groups",
      "Central air conditioning and refined interior finishes",
      "Well-equipped kitchen for easy meals and longer stays",
      "Beach essentials for relaxed North Shore days",
      "Access to Turtle Bay resort-area amenities",
      "Close to quiet beaches, surf spots, local dining, and North Shore attractions",
    ],
  },
};

// ─── Helpers ─────────────────────────────────────────────────

function sanitizeTel(phone: string) {
  return (phone || "").replace(/[^\d+]/g, "") || phone;
}

// ─── Scroll-reveal component ──────────────────────────────────

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
    <div className="flex h-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-4 text-center shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}

// ─── Gallery ─────────────────────────────────────────────────

function Gallery({ images, title }: { images: string[]; title: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const safeImages = images.length > 0 ? images : ["/media/rentals/placeholder.jpg"];
  const active = safeImages[activeIdx] || safeImages[0];

  useEffect(() => {
    if (!showGrid) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [showGrid]);

  return (
    <div className="space-y-3 ov-gallery-enter">
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-200 shadow-[0_12px_48px_rgba(15,23,42,0.14)]">
        <Image
          key={active}
          src={active}
          alt={`${title}, photo ${activeIdx + 1}`}
          fill
          unoptimized
          className="object-cover ov-img-crossfade"
          priority={activeIdx === 0}
        />

        {safeImages.length > 1 && (
          <div className="absolute bottom-4 right-4 rounded-full bg-black/48 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white tabular-nums select-none">
            {activeIdx + 1} / {safeImages.length}
          </div>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
          {safeImages.map((src, i) => (
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

      {safeImages.length > 1 && (
        <button
          type="button"
          onClick={() => setShowGrid(true)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition underline underline-offset-2 decoration-slate-300"
        >
          View all {safeImages.length} photos
        </button>
      )}

      {showGrid && (
        <div
          className="fixed inset-0 z-[500] bg-black/85 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowGrid(false); }}
        >
          <div className="min-h-full flex flex-col">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-black/90 px-5 py-4">
              <span className="text-sm font-semibold text-white">
                {title} · {safeImages.length} photos
              </span>
              <button
                type="button"
                onClick={() => setShowGrid(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition text-xl leading-none"
                aria-label="Close gallery"
              >
                ×
              </button>
            </div>
            <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {safeImages.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setActiveIdx(i); setShowGrid(false); }}
                  className={[
                    "relative aspect-[4/3] overflow-hidden rounded-xl transition-all duration-150",
                    i === activeIdx ? "ring-2 ring-white" : "hover:opacity-90",
                  ].join(" ")}
                  aria-label={`View photo ${i + 1}`}
                >
                  <Image
                    src={src}
                    alt={`${title} photo ${i + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white tabular-nums leading-tight">
                    {i + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Description helpers ─────────────────────────────────────

function splitOverview(text: string): { overview: string; remainder: string } {
  if (!text) return { overview: "", remainder: "" };

  const re = /[^.!?]*[.!?]+/g;
  const sentences: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) sentences.push(m[0]);
  const consumed = sentences.reduce((n, s) => n + s.length, 0);
  if (consumed < text.length) sentences.push(text.slice(consumed));

  if (sentences.length <= 2) return { overview: text.trim(), remainder: "" };

  const first = sentences[0];
  let cut = 1;
  let overview = first;
  if (first.trim().length < 200 && sentences.length > 1) {
    overview += sentences[1];
    cut = 2;
  }

  return { overview: overview.trim(), remainder: sentences.slice(cut).join("").trim() };
}

type ParsedDescription = {
  overview: string;
  highlights: string[];
  details: string[];
};

function parseDescription(raw: string): ParsedDescription {
  const text = raw
    .replace(/[\uD800-\uDFFF]/g, "")
    .replace(/[✓✔►▸▶→➤➜➝➞➔❯❱⇒✦★☑]/g, "•")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!text) return { overview: "", highlights: [], details: [] };

  const dblNewlineBlocks = text.split(/\n\n+/).map(b => b.replace(/\n/g, " ").trim()).filter(Boolean);
  const inlineBulletCountFull = (text.match(/[•·▪]/g) || []).length;
  if (dblNewlineBlocks.length >= 2 && inlineBulletCountFull < 3) {
    const { overview, remainder } = splitOverview(dblNewlineBlocks[0]);
    const rest = [...(remainder ? [remainder] : []), ...dblNewlineBlocks.slice(1)];
    return { overview, highlights: [], details: rest.filter(Boolean) };
  }

  const inlineBulletCount = (text.match(/[•·▪]/g) || []).length;

  if (inlineBulletCount >= 2) {
    const segments = text.split(/\s*[•·▪]\s*/).map(s => s.trim()).filter(Boolean);

    const { overview, remainder: introRemainder } = splitOverview(segments[0] || "");

    const highlights: string[] = [];
    const longTexts: string[] = [];

    for (const seg of segments.slice(1)) {
      const clean = seg.replace(/[.!?,;]\s*$/, "").trim();
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

  const sentenceRe = /[^.!?]*[.!?]+/g;
  const allSentences: string[] = [];
  let sm: RegExpExecArray | null;
  while ((sm = sentenceRe.exec(text)) !== null) allSentences.push(sm[0]);
  const trailing = text.slice(allSentences.reduce((n, s) => n + s.length, 0)).trim();
  if (trailing) allSentences.push(trailing);

  if (allSentences.length <= 3) {
    return { overview: text.trim(), highlights: [], details: [] };
  }

  const CHUNK = 3;
  const chunks: string[] = [];
  for (let i = 0; i < allSentences.length; i += CHUNK) {
    const c = allSentences.slice(i, i + CHUNK).join("").trim();
    if (c) chunks.push(c);
  }
  return { overview: chunks[0] || text, highlights: [], details: chunks.slice(1) };
}

// ─── Compliance details (TMK, TA registration, occupancy) ─────

function ComplianceDetails({ compliance }: { compliance: VillaComplianceDetails }) {
  return (
    <div className="mt-6 pt-5 border-t border-slate-100">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
        Property Registration &amp; Occupancy
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
        <div className="flex items-baseline justify-between gap-3 sm:block">
          <dt className="text-slate-400">Licensed Maximum Occupancy</dt>
          <dd className="font-semibold text-slate-800 sm:mt-0.5">
            {compliance.licensedMaxOccupancy} guests
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 sm:block sm:col-span-2">
          <dt className="text-slate-400">Sleeping Arrangement</dt>
          <dd className="font-semibold text-slate-800 sm:mt-0.5">
            {compliance.occupancySummary}
          </dd>
        </div>
        {compliance.licenses.map((license) => (
          <div key={`${license.unit}-${license.taxMapKey}`} className="contents">
            <div className="flex items-baseline justify-between gap-3 sm:block">
              <dt className="text-slate-400">
                Tax Map Key (TMK){compliance.licenses.length > 1 ? ` — ${license.unit}` : ""}
              </dt>
              <dd className="font-semibold text-slate-800 sm:mt-0.5">{license.taxMapKey}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 sm:block">
              <dt className="text-slate-400">
                TA Registration{compliance.licenses.length > 1 ? ` — ${license.unit}` : ""}
              </dt>
              <dd className="font-semibold text-slate-800 sm:mt-0.5">{license.tat}</dd>
            </div>
          </div>
        ))}
      </dl>

      {compliance.sleepingSpaces && (
        <div className="mt-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Room-by-Room Breakdown
          </div>
          <ul className="space-y-1.5 text-sm text-slate-700">
            {compliance.sleepingSpaces.map((space, i) => (
              <li key={i} className="flex items-baseline justify-between gap-3">
                <span>
                  {space.label}
                  {space.type === "living_area" && (
                    <span className="ml-1.5 text-xs text-slate-400">(not a bedroom)</span>
                  )}
                </span>
                <span className="font-semibold text-slate-800 whitespace-nowrap">
                  {space.guests} guests
                  {space.adults != null && space.children != null && (
                    <span className="ml-1 font-normal text-slate-400">
                      ({space.adults} adults{space.children > 0 ? ` + ${space.children} children` : ""})
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Description ─────────────────────────────────────────────

function DescriptionSection({
  description,
  compliance,
}: {
  description: string;
  compliance?: VillaComplianceDetails;
}) {
  const [expanded, setExpanded] = useState(false);
  const parsed = useMemo(() => parseDescription(description), [description]);
  const hasHighlights = parsed.highlights.length > 0;
  const hasDetails = parsed.details.length > 0;

  return (
    <RevealSection className="mt-10">
      <h2 className="text-xl font-semibold text-slate-900 mb-5">About this villa</h2>

      <div className="space-y-5 max-w-[72ch]">
        <p className="text-[15px] leading-8 text-slate-600 font-light max-w-prose">
          {parsed.overview || description}
        </p>

        {hasHighlights && (
          <div className="pt-1">
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

        {hasDetails && (() => {
          const threshold = 3;
          const always = parsed.details.slice(0, threshold);
          const extra = parsed.details.slice(threshold);
          return (
            <div className={hasHighlights ? "pt-4 border-t border-slate-100" : ""}>
              <div className="space-y-4">
                {always.map((block, i) => (
                  <p key={i} className="text-[15px] leading-8 text-slate-600 font-light">{block}</p>
                ))}
              </div>
              {extra.length > 0 && (
                <>
                  {expanded && (
                    <div className="mt-4 space-y-4">
                      {extra.map((block, i) => (
                        <p key={i} className="text-[15px] leading-8 text-slate-600 font-light">{block}</p>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-200"
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
                </>
              )}
            </div>
          );
        })()}

        {compliance && <ComplianceDetails compliance={compliance} />}
      </div>
    </RevealSection>
  );
}

// ─── Override description (curated listings) ─────────────────

function OverrideDescriptionSection({
  override,
  compliance,
}: {
  override: DescriptionOverride;
  compliance?: VillaComplianceDetails;
}) {
  return (
    <RevealSection className="mt-10">
      <h2 className="text-xl font-semibold text-slate-900 mb-5">About this villa</h2>

      <div className="space-y-5">
        {override.paragraphs.map((para, i) => (
          <p key={i} className="text-[15px] leading-8 text-slate-600 font-light max-w-[72ch]">
            {para}
          </p>
        ))}
      </div>

      {override.highlights.length > 0 && (
        <div className="mt-7">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
            Why guests love this villa
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
            {override.highlights.map((item, i) => (
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

      {compliance && <ComplianceDetails compliance={compliance} />}
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
      <p className="mt-4 text-sm text-slate-500">
        See what&apos;s included across every villa, and what&apos;s available separately through Turtle Bay Resort,
        on the{" "}
        <Link href="/amenities" className="font-semibold text-slate-900 hover:underline underline-offset-2">
          full amenities page
        </Link>
        .
      </p>
    </RevealSection>
  );
}

// ─── Booking Card ─────────────────────────────────────────────

type PricingResult = {
  hasPricing: boolean;
  isAvailable: boolean;
  avgNightlyPrice: number;
  minNightlyPrice: number;
  totalNightlyPrice: number;
  nights: number;
};

function BookingCard({
  onInquire,
  startDate,
  endDate,
  guests,
  listingId,
  maxGuests,
}: {
  onInquire: () => void;
  startDate: string;
  endDate: string;
  guests: string;
  villaName: string;
  listingId: string;
  /** This villa's resolved capacity (Tier 2 compliance value where one exists,
   * else Hostaway's own figure) — the guest picker must never offer more
   * than this, per Section 3.7: every render surface reads from the same
   * resolved value. */
  maxGuests: number | null;
}) {
  // "Today" depends on the viewer's local timezone, which this component now
  // resolves on both the server (request time, server timezone — likely UTC)
  // and the client (the guest's actual local time, e.g. Hawaii, UTC-10) since
  // it's server-rendered. Computing it eagerly would make the server and
  // client disagree on the calendar date for several hours every day and
  // throw a real hydration mismatch on the `min` attribute below — not a
  // false-positive warning, an actually-wrong value on one side. So it
  // starts unset (identical, and therefore hydration-safe, on both sides)
  // and is corrected once the client mounts and its real local date is
  // knowable. No `min` constraint is applied for the brief window before
  // that effect runs, rather than guessing with a value that might be wrong.
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => {
    const d = new Date();
    setToday(
      [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0"),
      ].join("-")
    );
  }, []);

  // Conservative floor (not a marketing max) for the rare case this specific
  // listing has no resolved capacity at all — understating is an
  // inconvenience; overstating risks implying a non-compliant guest count is
  // bookable.
  const guestCap = maxGuests && maxGuests > 0 ? maxGuests : 2;
  const clampGuests = useCallback((n: number) => Math.min(Math.max(n, 1), guestCap), [guestCap]);

  const [localCheckIn, setLocalCheckIn] = useState(startDate);
  const [localCheckOut, setLocalCheckOut] = useState(endDate);
  const [localGuests, setLocalGuests] = useState(() => clampGuests(Number(guests) || 2));

  const nights = useMemo(() => {
    if (!localCheckIn || !localCheckOut) return 0;
    const n = Math.round(
      (new Date(localCheckOut).getTime() - new Date(localCheckIn).getTime()) / 86_400_000
    );
    return n > 0 ? n : 0;
  }, [localCheckIn, localCheckOut]);

  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  const hasValidDateRange = Boolean(localCheckIn && localCheckOut && nights > 0);

  useEffect(() => {
    if (!hasValidDateRange) return;

    let alive = true;

    async function loadPricing() {
      setPricingLoading(true);
      try {
        const res = await fetch(
          `/api/hostaway/pricing?listingId=${encodeURIComponent(listingId)}&startDate=${localCheckIn}&endDate=${localCheckOut}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (!alive) return;
        if (json?.success) {
          setPricing({
            hasPricing: Boolean(json.hasPricing),
            isAvailable: Boolean(json.isAvailable),
            avgNightlyPrice: json.avgNightlyPrice ?? 0,
            minNightlyPrice: json.minNightlyPrice ?? 0,
            totalNightlyPrice: json.totalNightlyPrice ?? 0,
            nights: json.nights ?? nights,
          });
        } else {
          setPricing(null);
        }
      } catch {
        if (alive) setPricing(null);
      } finally {
        if (alive) setPricingLoading(false);
      }
    }

    loadPricing();
    return () => {
      alive = false;
    };
  }, [listingId, localCheckIn, localCheckOut, nights, hasValidDateRange]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_12px_48px_rgba(15,23,42,0.09)]">

      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-900">Plan Your Stay</h3>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
          Share your dates and guest details. Our property manager will confirm availability and next steps.
        </p>
      </div>

      <div className="mb-5 space-y-3">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {nights > 0 ? "Your stay" : "Select dates"}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">Check-in</label>
            <input
              type="date"
              min={today ?? undefined}
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
              min={localCheckIn || today || undefined}
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
              onChange={(e) => setLocalGuests(clampGuests(Number(e.target.value)))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {Array.from({ length: guestCap }).map((_, i) => (
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

        {nights > 0 && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            {pricingLoading ? (
              <p className="text-xs text-slate-500">Checking availability and pricing…</p>
            ) : pricing?.hasPricing ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    {pricing.nights} night{pricing.nights === 1 ? "" : "s"} × ${Math.round(pricing.avgNightlyPrice)} avg/night
                  </span>
                  <span className="font-semibold text-slate-900">
                    ≈ ${Math.round(pricing.totalNightlyPrice)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-4">
                  Estimated accommodation total. Taxes, cleaning fees, and other required fees are calculated at checkout.
                </p>
                <p className={`text-xs font-semibold ${pricing.isAvailable ? "text-emerald-700" : "text-amber-700"}`}>
                  {pricing.isAvailable ? "Available for these dates" : "Not available for these dates"}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Check Availability and Pricing for these exact dates below.</p>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onInquire}
        className={[
          "flex items-center justify-center w-full rounded-2xl px-6 py-4",
          "bg-[#0A6B8A] text-white text-sm font-semibold",
          "shadow-[0_4px_18px_rgba(10,107,138,0.30)]",
          "hover:-translate-y-0.5 hover:bg-[#085f7a] hover:shadow-[0_8px_28px_rgba(10,107,138,0.40)]",
          "active:translate-y-0 active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A6B8A] focus-visible:ring-offset-2",
          "transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        ].join(" ")}
      >
        Check Availability
      </button>

      <button
        type="button"
        onClick={onInquire}
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

      <a
        href="tel:+18587272427"
        className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200"
      >
        <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        Call Us · +1 (858) 727-2427
      </a>

      <p className="mt-4 text-center text-[11px] text-slate-400 leading-5">
        No booking commitment yet. Our local team will confirm availability and guide you through the next step.
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

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
    <div
      className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Villa inquiry form"
    >
      <div
        className="absolute inset-0 bg-slate-900/65 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full h-[96dvh] sm:h-[92vh] sm:max-w-[820px] flex flex-col bg-white rounded-t-3xl sm:rounded-3xl shadow-[0_32px_80px_rgba(15,23,42,0.28)] overflow-hidden">

        <div className="flex items-start justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Request Availability for This Villa</h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Please fill out the form below and one of our team members will reach out to confirm availability and next steps. This request goes directly to our local team for faster assistance.
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

        <div className="px-5 sm:px-6 py-3 bg-slate-50 border-b border-slate-100 shrink-0">
          <p className="text-xs text-slate-500">
            Requesting availability for:{" "}
            <span className="font-semibold text-slate-800">{villaName}</span>
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <iframe
            src={formUrl}
            title="Villa Inquiry Form"
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main content (wrapped in Suspense for useSearchParams) ───

function ListingClientContent({
  listing,
  title,
  compliance,
}: {
  listing: HostawayListingDetail;
  title: string;
  compliance?: VillaComplianceDetails;
}) {
  const searchParams = useSearchParams();
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  // Prefer the compliance-enforced figure where a compliance entry exists,
  // falling back to Hostaway's own resolved maxGuests (listing.maxGuests
  // already incorporates VILLA_STAT_OVERRIDES, which is itself derived from
  // compliance — this is belt-and-suspenders so the invariant holds even if
  // that derivation ever changes). The URL-supplied guests value is a guest's
  // own input via a shareable link, not a verified fact, so it's clamped to
  // this villa's real capacity rather than trusted outright.
  const resolvedMaxGuests = compliance?.licensedMaxOccupancy ?? listing.maxGuests ?? null;
  const guestCap = resolvedMaxGuests && resolvedMaxGuests > 0 ? resolvedMaxGuests : 2;
  const requestedGuests = Number(searchParams.get("guests")) || 2;
  const guests = String(Math.min(Math.max(requestedGuests, 1), guestCap));

  const [inquiryOpen, setInquiryOpen] = useState(false);
  const openInquiry = useCallback(() => setInquiryOpen(true), []);
  const closeInquiry = useCallback(() => setInquiryOpen(false), []);

  const backHref = startDate && endDate
    ? `/availability?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&guests=${encodeURIComponent(guests)}`
    : "/rentals";

  const locationLabel = listing.city
    ? `${listing.city}${listing.state ? `, ${listing.state}` : ""}`
    : "Turtle Bay · North Shore, Oahu";

  const description = (listing.description || "")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    || "Explore this Ocean Villas property at Turtle Bay on Oahu's North Shore.";

  const rawImages = listing.images?.length ? listing.images : listing.heroUrl ? [listing.heroUrl] : [];
  const images = reorderImages(listing.id, rawImages);
  const amenities = listing.amenities || [];

  return (
    <>
      <InquiryModal
        open={inquiryOpen}
        onClose={closeInquiry}
        villaName={title}
        listingId={listing.id}
      />

      <main className="min-h-screen bg-slate-50 text-slate-900 pb-24 lg:pb-0">

        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              href={backHref}
              onClick={() => trackEvent("back_to_browse", { from: `listing_${listing.id}` })}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors duration-200"
            >
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
              href={`tel:+1${sanitizeTel(BRAND_PHONE)}`}
              onClick={() => trackEvent("phone_click", { source: "listing_header" })}
              className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200"
            >
              Call Us · {BRAND_PHONE}
            </a>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10 xl:py-14">
          <div className="lg:grid lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] lg:gap-10 xl:gap-14 lg:items-start">

            <div className="min-w-0">

              <Gallery images={images} title={title} />

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

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 ov-fade-up ov-fade-up-2">
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
                <StatBadge
                  label="Check-out by"
                  value={listing.checkOutTime || "—"}
                />
              </div>

              {LISTING_DESCRIPTION_OVERRIDES[listing.id]
                ? <OverrideDescriptionSection override={LISTING_DESCRIPTION_OVERRIDES[listing.id]!} compliance={compliance} />
                : <DescriptionSection description={description} compliance={compliance} />
              }

              <AmenitiesSection amenities={amenities} />

              <RevealSection className="mt-10" delay={100}>
                <TrustSignals variant="compact" />
              </RevealSection>

              <RevealSection className="mt-10 lg:hidden" delay={60}>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Check Availability</h2>
                <BookingCard
                  onInquire={openInquiry}
                  startDate={startDate}
                  endDate={endDate}
                  guests={guests}
                  villaName={title}
                  listingId={listing.id}
                  maxGuests={resolvedMaxGuests}
                />
              </RevealSection>
            </div>

            <div className="hidden lg:block lg:sticky lg:top-28 shrink-0">
              <BookingCard
                onInquire={openInquiry}
                startDate={startDate}
                endDate={endDate}
                guests={guests}
                villaName={title}
                listingId={listing.id}
                maxGuests={resolvedMaxGuests}
              />

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Have questions?
                </p>
                <p className="text-sm text-slate-600 leading-6">
                  Call Us at{" "}
                  <a
                    href={`tel:+1${sanitizeTel(BRAND_PHONE)}`}
                    onClick={() => trackEvent("phone_click", { source: "listing_sidebar" })}
                    className="font-semibold text-slate-900 hover:underline hover:underline-offset-2"
                  >
                    {BRAND_PHONE}
                  </a>{" "}
                  — our local team will get back to you shortly.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-[60] lg:hidden bg-white/96 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-[0_-6px_28px_rgba(15,23,42,0.09)] pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <div className="max-w-lg mx-auto flex gap-3">
            <a
              href={`tel:+1${sanitizeTel(BRAND_PHONE)}`}
              aria-label={`Call Us at ${BRAND_PHONE}`}
              onClick={() => trackEvent("phone_click", { source: "listing_mobile_bar" })}
              className={[
                "flex-1 inline-flex items-center justify-center min-h-[48px] rounded-xl px-3 py-3.5",
                "bg-white border border-slate-200 text-slate-700 text-sm font-semibold",
                "shadow-[0_2px_8px_rgba(15,23,42,0.08)]",
                "hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-px",
                "active:translate-y-0 active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2",
                "transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
              ].join(" ")}
            >
              <svg className="mr-1.5 h-4 w-4 opacity-70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Us
            </a>
            <button
              type="button"
              aria-label="Check availability for this villa"
              onClick={() => {
                trackEvent("inquiry_open", { villa: title, listing_id: listing.id, source: "mobile_bar" });
                openInquiry();
              }}
              className={[
                "min-h-[48px]",
                "flex-[2] inline-flex items-center justify-center rounded-xl px-3 py-3.5",
                "bg-[#3f5f4a] text-white text-sm font-semibold",
                "shadow-[0_3px_12px_rgba(63,95,74,0.22)]",
                "hover:-translate-y-px hover:bg-[#334e3c] hover:shadow-[0_6px_20px_rgba(63,95,74,0.28)]",
                "active:translate-y-0 active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3f5f4a] focus-visible:ring-offset-2",
                "transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
              ].join(" ")}
            >
              <svg className="mr-1.5 h-4 w-4 opacity-80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Check Availability
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

function ListingClientSkeleton() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="sticky top-0 z-50 h-16 md:h-20 border-b border-slate-200 bg-white/90 backdrop-blur-md" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10 animate-pulse">
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-10">
          <div className="space-y-4">
            <div className="aspect-[16/9] w-full rounded-3xl bg-slate-200" />
            <div className="mt-8 h-7 w-2/3 rounded-xl bg-slate-200" />
          </div>
          <div className="hidden lg:block">
            <div className="h-72 rounded-3xl bg-slate-200" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ListingClient(props: {
  listing: HostawayListingDetail;
  title: string;
  compliance?: VillaComplianceDetails;
}) {
  return (
    <Suspense fallback={<ListingClientSkeleton />}>
      <ListingClientContent {...props} />
    </Suspense>
  );
}
