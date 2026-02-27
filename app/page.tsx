"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type FeaturedRental = {
  id: string;
  name: string;
  tagline?: string | null;
  sleeps?: number | null;
  beds?: number | null;
  baths?: number | null;
  highlight?: string | null;
  image?: string | null;
  fromPrice?: string | null;
};

const BRAND = {
  name: "Ocean Villa at Turtle Bay",
  sub: "Direct booking • Resort-Style Stay",
  phone: "(808) XXX-XXXX",
  logo: "/brand/TTB-Logo.png",
};

// ✅ Your configured Hostaway listing IDs (from ENV screenshot)
const HOSTAWAY_LISTING_IDS = ["489089", "489093", "489095", "489097", "489092", "489094"];

// Small helper
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

function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        "rounded-3xl border border-black/10 bg-white/55 backdrop-blur-[14px] shadow-[0_18px_55px_rgba(2,20,40,0.12)]",
        className
      )}
    >
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cx(
        "relative inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white",
        "bg-gradient-to-b from-[#0F6E8C] to-[#0A4C61]",
        "shadow-[0_14px_35px_rgba(15,110,140,0.28)]",
        "transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]",
        "focus:outline-none focus:ring-2 focus:ring-[#0F6E8C]/35 focus:ring-offset-0",
        className
      )}
    >
      <span className="relative z-10">{children}</span>
      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
    </button>
  );
}

function SecondaryButton({
  children,
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      className={cx(
        "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold",
        "text-slate-900/80 ring-1 ring-black/10 bg-white/55 backdrop-blur",
        "transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] hover:bg-white/70",
        className
      )}
    >
      {children}
    </a>
  );
}

function Pill({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "gold";
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold",
        tone === "gold"
          ? "bg-[#D9B87C]/22 text-[#7A5A22] ring-1 ring-[#D9B87C]/35"
          : "bg-black/5 text-slate-800/70 ring-1 ring-black/10"
      )}
    >
      {children}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/60 ring-1 ring-black/10 px-4 py-3">
      <div className="text-[11px] font-medium text-slate-700/70">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900/90">{value}</div>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  desc,
  right,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div className="max-w-2xl">
        {eyebrow ? (
          <div className="text-xs font-semibold tracking-wide text-[#0F6E8C]">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          {title}
        </h2>
        {desc ? (
          <p className="mt-3 text-sm leading-relaxed text-slate-700/80">{desc}</p>
        ) : null}
      </div>
      {right ? <div className="hidden md:block">{right}</div> : null}
    </div>
  );
}

function RentalCard({ r }: { r: FeaturedRental }) {
  return (
    <div className="group overflow-hidden rounded-3xl ring-1 ring-black/10 bg-white/55 backdrop-blur-[14px] transition-transform duration-200 hover:scale-[1.01]">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {r.image ? (
          <Image
            src={r.image}
            alt={r.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-100 to-slate-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
        <div className="absolute left-4 top-4">
          <Pill>{r.highlight || "Featured"}</Pill>
        </div>
        {r.fromPrice ? (
          <div className="absolute right-4 top-4">
            <Pill tone="gold">From {r.fromPrice}/night</Pill>
          </div>
        ) : null}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-slate-900">{r.name}</div>
            <div className="mt-1 text-xs text-slate-700/70">
              {r.tagline || "Ocean views • Premium stay"}
            </div>
          </div>

          <Link
            href={`/listing/${encodeURIComponent(r.id)}`}
            className="shrink-0 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-900/80 bg-white/60 ring-1 ring-black/10 hover:bg-white/75 transition"
          >
            View
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="Sleeps" value={`${r.sleeps ?? "—"}`} />
          <Stat label="Beds" value={`${r.beds ?? "—"}`} />
          <Stat label="Baths" value={`${r.baths ?? "—"}`} />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const today = useMemo(() => formatISO(new Date()), []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Booking bar state
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<number>(2);
  const [promo, setPromo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // ✅ Featured pulled from Hostaway via your existing API route: /api/hostaway/listings?id=
  const [featured, setFeatured] = useState<FeaturedRental[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadFeatured() {
      setFeaturedLoading(true);
      try {
        const results = await Promise.all(
          HOSTAWAY_LISTING_IDS.slice(0, 6).map(async (id) => {
            const res = await fetch(`/api/hostaway/listings?id=${encodeURIComponent(id)}`, {
              cache: "no-store",
            });
            const json = await res.json().catch(() => null);
            const l = json?.listing;

            // If your /api/hostaway/listings?id= route returns {success:true, listing:{...}}
            if (!l) return null;

            const img = l.heroUrl || l.thumbnailUrl || null;

            return {
              id: String(l.id),
              name: l.name || `Listing ${id}`,
              tagline: l.city ? `${l.city}${l.state ? `, ${l.state}` : ""}` : "Turtle Bay • Oahu",
              sleeps: l.maxGuests ?? null,
              beds: l.bedrooms ?? null,
              baths: l.bathrooms ?? null,
              highlight: "Direct booking",
              image: img,
              fromPrice: null,
            } as FeaturedRental;
          })
        );

        if (!cancelled) setFeatured(results.filter(Boolean) as FeaturedRental[]);
      } catch {
        if (!cancelled) setFeatured([]);
      } finally {
        if (!cancelled) setFeaturedLoading(false);
      }
    }

    loadFeatured();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSearch() {
    setError("");

    if (!checkIn || !checkOut) {
      setError("Please choose your check-in and check-out dates.");
      return;
    }
    if (isAfter(checkIn, checkOut) || checkIn === checkOut) {
      setError("Check-out must be after check-in.");
      return;
    }
    if (isAfter(today, checkIn)) {
      setError("Check-in date must be today or later.");
      return;
    }
    if (guests < 1) {
      setError("Guests must be at least 1.");
      return;
    }

    setLoading(true);

    try {
      // ✅ go to your working availability page
      window.location.href = `/availability?startDate=${encodeURIComponent(
        checkIn
      )}&endDate=${encodeURIComponent(checkOut)}&guests=${encodeURIComponent(String(guests))}${
        promo.trim() ? `&promo=${encodeURIComponent(promo.trim())}` : ""
      }`;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen text-slate-900 selection:bg-[#0F6E8C]/15 selection:text-slate-900">
      {/* ✅ LIGHT, SHORTER BACKGROUND (not super dark, still premium) */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_15%_10%,rgba(15,110,140,0.14),transparent_60%),radial-gradient(820px_520px_at_80%_5%,rgba(100,182,172,0.18),transparent_55%),radial-gradient(900px_650px_at_50%_80%,rgba(217,184,124,0.10),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F7FAFC] via-[#F4F8FB] to-[#EEF5FA]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22 viewBox=%220 0 140 140%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22140%22 height=%22140%22 filter=%22url(%23n)%22 opacity=%220.7%22/%3E%3C/svg%3E')]" />
      </div>

      {/* HEADER (no 404 links — just anchors) */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/65 backdrop-blur-[14px]">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <a href="#top" className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-2xl bg-white/70 ring-1 ring-black/10">
              <Image
                src={BRAND.logo}
                alt={BRAND.name}
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">{BRAND.name}</div>
              <div className="text-[11px] text-slate-700/70">{BRAND.sub}</div>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="ml-auto hidden items-center gap-6 text-sm text-slate-700/80 md:flex">
            <a className="hover:text-slate-900 transition" href="#featured">
              Featured
            </a>
            <a className="hover:text-slate-900 transition" href="#availability">
              Availability
            </a>
            <a className="hover:text-slate-900 transition" href="#reviews">
              Reviews
            </a>
            <a className="hover:text-slate-900 transition" href="#contact">
              Contact
            </a>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            <a className="text-sm text-slate-700/80 hover:text-slate-900 transition" href={`tel:${BRAND.phone}`}>
              {BRAND.phone}
            </a>
            <a href="#availability">
              <PrimaryButton type="button">Check Availability</PrimaryButton>
            </a>
          </div>

          {/* Mobile */}
          <div className="ml-auto flex items-center gap-2 md:hidden">
            <a href="#availability">
              <PrimaryButton type="button" className="px-4 py-2">
                Check
              </PrimaryButton>
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="rounded-2xl bg-white/60 ring-1 ring-black/10 px-3 py-2 text-sm font-semibold text-slate-900/80"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="md:hidden border-t border-black/10 bg-white/70 backdrop-blur-[14px]">
            <div className="mx-auto max-w-6xl px-4 py-4 grid gap-2 text-sm text-slate-800/80">
              <a onClick={() => setMobileMenuOpen(false)} className="rounded-2xl px-3 py-2 hover:bg-black/5" href="#featured">
                Featured
              </a>
              <a onClick={() => setMobileMenuOpen(false)} className="rounded-2xl px-3 py-2 hover:bg-black/5" href="#availability">
                Availability
              </a>
              <a onClick={() => setMobileMenuOpen(false)} className="rounded-2xl px-3 py-2 hover:bg-black/5" href="#reviews">
                Reviews
              </a>
              <a onClick={() => setMobileMenuOpen(false)} className="rounded-2xl px-3 py-2 hover:bg-black/5" href="#contact">
                Contact
              </a>

              <div className="mt-2 flex gap-2">
                <a className="flex-1" href={`tel:${BRAND.phone}`}>
                  <span className="inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-slate-900/80 bg-white/60 ring-1 ring-black/10">
                    Call
                  </span>
                </a>
                <a className="flex-1" href="#availability">
                  <PrimaryButton type="button" className="w-full">
                    Check
                  </PrimaryButton>
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      {/* HERO (kept clean + lighter overlay) */}
      <section id="top" className="relative">
        <div className="relative h-[68vh] min-h-[520px] overflow-hidden">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/media/hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/15 to-white/65" />
          <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_20%,rgba(15,110,140,0.18),transparent_60%)]" />

          <div className="absolute inset-0">
            <div className="mx-auto flex h-full max-w-6xl flex-col justify-end px-4 pb-10 md:pb-12">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill>Direct booking</Pill>
                  <Pill>Resort-style comfort</Pill>
                  <Pill tone="gold">Best value online</Pill>
                </div>

                <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-slate-900 md:text-6xl">
                  A premium Turtle Bay stay,
                  <span className="text-slate-900/75"> built for calm.</span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-700/80 md:text-base">
                  Modern coastal interiors, fast Wi-Fi, and effortless booking —
                  powered by Hostaway as the source of truth.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="#availability">
                    <PrimaryButton type="button">Check Availability</PrimaryButton>
                  </a>
                  <a href="#featured">
                    <SecondaryButton>View Featured</SecondaryButton>
                  </a>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <Stat label="Response time" value="Fast (typ.)" />
                  <Stat label="Check-in" value="Flexible" />
                  <Stat label="Location" value="Turtle Bay" />
                  <Stat label="Support" value="Local team" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING BAR */}
      <section id="availability" className="relative">
        <div className="mx-auto max-w-6xl px-4">
          <div className="-mt-10 md:-mt-12 pb-10">
            <GlassCard className="p-4 md:p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Check availability
                  </div>
                  <div className="mt-1 text-xs text-slate-700/70">
                    Searches Hostaway calendars (server-side) and returns real available listings.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill>Secure server-side API</Pill>
                  <Pill>Mobile-first</Pill>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-12">
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-700/70">
                    Check-in
                  </label>
                  <div className="mt-2 rounded-2xl bg-white/70 ring-1 ring-black/10 px-3 py-2">
                    <input
                      type="date"
                      min={today}
                      value={checkIn}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCheckIn(v);
                        if (checkOut && (v === checkOut || isAfter(v, checkOut))) {
                          setCheckOut(addDays(v, 2));
                        }
                      }}
                      className="h-9 w-full bg-transparent text-sm text-slate-900 outline-none"
                      aria-label="Check-in date"
                    />
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-700/70">
                    Check-out
                  </label>
                  <div className="mt-2 rounded-2xl bg-white/70 ring-1 ring-black/10 px-3 py-2">
                    <input
                      type="date"
                      min={checkIn || today}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="h-9 w-full bg-transparent text-sm text-slate-900 outline-none"
                      aria-label="Check-out date"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700/70">
                    Guests
                  </label>
                  <div className="mt-2 rounded-2xl bg-white/70 ring-1 ring-black/10 px-3 py-2">
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="h-9 w-full bg-transparent text-sm text-slate-900 outline-none"
                      aria-label="Guests"
                    >
                      {Array.from({ length: 14 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700/70">
                    Promo code (optional)
                  </label>
                  <div className="mt-2 rounded-2xl bg-white/70 ring-1 ring-black/10 px-3 py-2">
                    <input
                      value={promo}
                      onChange={(e) => setPromo(e.target.value)}
                      placeholder="PROMO"
                      className="h-9 w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-500/70 outline-none"
                      aria-label="Promo code"
                    />
                  </div>
                </div>

                <div className="md:col-span-12">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-xs text-slate-700/80">
                      {error ? (
                        <span className="inline-flex items-center gap-2 rounded-2xl bg-red-500/10 px-3 py-2 ring-1 ring-red-400/20 text-red-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          {error}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-2xl bg-black/5 px-3 py-2 ring-1 ring-black/10">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#0F6E8C]" />
                          Tip: Select dates — we’ll return real Hostaway availability.
                        </span>
                      )}
                    </div>

                    <PrimaryButton
                      type="button"
                      onClick={onSearch}
                      disabled={loading}
                      className={cx(loading && "opacity-80")}
                    >
                      {loading ? "Searching…" : "Search"}
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* FEATURED (real Hostaway data when API works) */}
      <section id="featured" className="relative">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
          <SectionTitle
            eyebrow="Featured stays"
            title="Ocean Villas pulled from Hostaway."
            desc="If images/details look blank, it means Hostaway listing data didn’t return (auth/env)."
            right={
              <a href="#availability">
                <PrimaryButton type="button">Check Availability</PrimaryButton>
              </a>
            }
          />

          <div className="mt-8">
            {featuredLoading ? (
              <div className="text-sm text-slate-700/80">Loading listings…</div>
            ) : featured.length === 0 ? (
              <GlassCard className="p-5">
                <div className="text-sm font-semibold text-slate-900">No featured listings loaded.</div>
                <div className="mt-2 text-sm text-slate-700/80">
                  This usually means one of these:
                  <ul className="mt-2 list-disc pl-5">
                    <li>Hostaway token call failed</li>
                    <li>ENV names mismatch (HOSTAWAY_ACCOUNT_ID / HOSTAWAY_API_KEY)</li>
                    <li>/api/hostaway/listings route is erroring</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <a href="/availability?startDate=2026-03-01&endDate=2026-03-05&guests=2">
                    <SecondaryButton>Open availability test</SecondaryButton>
                  </a>
                </div>
              </GlassCard>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {featured.slice(0, 6).map((r) => (
                  <RentalCard key={r.id} r={r} />
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 md:hidden">
            <a href="#availability">
              <PrimaryButton type="button" className="w-full">
                Check Availability
              </PrimaryButton>
            </a>
          </div>
        </div>
      </section>

      {/* REVIEWS (keep short, not too tall) */}
      <section id="reviews" className="relative border-t border-black/10">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
          <SectionTitle
            eyebrow="Reviews"
            title="Guests remember the feeling."
            desc="Short, clean, minimal — keeps scroll shorter."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                q: "The space felt like a high-end hotel, but calmer. Everything was thoughtfully done.",
                a: "Verified guest",
              },
              {
                q: "Fast responses, easy check-in, and the ocean view was unreal. We’ll be back.",
                a: "Verified guest",
              },
              {
                q: "Clean, modern, and perfect for our family trip. Booking direct was seamless.",
                a: "Verified guest",
              },
            ].map((t, i) => (
              <GlassCard key={i} className="p-6">
                <div className="text-sm text-slate-900/85">“{t.q}”</div>
                <div className="mt-4 text-xs font-semibold text-slate-700/70">{t.a}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section id="contact" className="relative border-t border-black/10">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
          <div className="rounded-3xl bg-white/60 ring-1 ring-black/10 p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xl font-semibold tracking-tight text-slate-900">
                  Ready to plan your stay?
                </div>
                <p className="mt-2 text-sm text-slate-700/80">
                  Search availability and book securely via Hostaway booking engine.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="#availability">
                  <PrimaryButton type="button">Check Availability</PrimaryButton>
                </a>
                <a href={`tel:${BRAND.phone}`}>
                  <SecondaryButton>Call</SecondaryButton>
                </a>
              </div>
            </div>
          </div>

          <footer className="mt-8 flex flex-col gap-3 border-t border-black/10 pt-6 text-xs text-slate-700/70 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3">
              {/* Keep these as plain text for now if pages don't exist */}
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
            <div>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</div>
          </footer>
        </div>
      </section>
    </main>
  );
}
