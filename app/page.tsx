"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

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
};

const BRAND = {
  // ✅ Ocean Villa branding
  name: "Ocean Villas • Turtle Bay",
  sub: "Oceanfront • Private Luxury Stay",
  phone: "(808) XXX-XXXX",
};

// ✅ ONLY show these listing IDs (source of truth = Hostaway)
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

function clampText(s: string, max = 120) {
  const clean = (s || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trimEnd() + "…";
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
        // ✅ glass preserved, but works on light background
        "rounded-3xl border border-black/5 bg-white/55 backdrop-blur-[16px]",
        "shadow-[0_18px_60px_rgba(0,0,0,0.12)]",
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
        "shadow-[0_12px_30px_rgba(15,110,140,0.22)]",
        "transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]",
        "focus:outline-none focus:ring-2 focus:ring-[#64B6AC]/50 focus:ring-offset-0",
        className
      )}
    >
      <span className="relative z-10">{children}</span>
      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/20" />
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
        "text-slate-900/85 ring-1 ring-black/10 bg-white/60 backdrop-blur",
        "transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] hover:bg-white/75",
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
          ? "bg-[#D9B87C]/20 text-[#8B6B2B] ring-1 ring-[#D9B87C]/35"
          : "bg-black/5 text-slate-900/70 ring-1 ring-black/10"
      )}
    >
      {children}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/60 ring-1 ring-black/10 px-4 py-3">
      <div className="text-[11px] font-medium text-slate-600">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  desc,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
}) {
  return (
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
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{desc}</p>
      ) : null}
    </div>
  );
}

function ListingCard({ l }: { l: HostawayListing }) {
  const title = l.name || `Listing ${l.id}`;
  const subtitle = clampText(l.description || "", 86);
  const hero = l.heroUrl || "/media/rentals/placeholder.jpg";

  return (
    <div className="group overflow-hidden rounded-3xl ring-1 ring-black/10 bg-white/55 backdrop-blur-[14px] transition-transform duration-200 hover:scale-[1.01]">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={hero}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
        <div className="absolute left-4 top-4">
          <Pill>Hostaway • #{l.id}</Pill>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-slate-900">{title}</div>
            <div className="mt-1 text-xs text-slate-600">
              {subtitle || `${l.city || ""}${l.state ? `, ${l.state}` : ""}`}
            </div>
          </div>

          {/* ✅ No /rentals route yet → avoid 404. Use hash jump to Availability. */}
          <a
            href="#availability"
            className="shrink-0 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-900/80 bg-white/60 ring-1 ring-black/10 hover:bg-white/80 transition"
          >
            Check
          </a>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="Sleeps" value={`${l.maxGuests ?? "-"}`} />
          <Stat label="Beds" value={`${l.bedrooms ?? "-"}`} />
          <Stat label="Baths" value={`${l.bathrooms ?? "-"}`} />
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

  // ✅ Hostaway listings state
  const [listings, setListings] = useState<HostawayListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState<string>("");

  // ✅ Fetch ONLY those 6 IDs
  useEffect(() => {
    let alive = true;

    async function load() {
      setListingsLoading(true);
      setListingsError("");

      try {
        const results = await Promise.all(
          LISTING_IDS.map(async (id) => {
            const res = await fetch(`/api/hostaway/listings?id=${encodeURIComponent(id)}`, {
              cache: "no-store",
            });
            const json = await res.json().catch(() => null);

            if (!res.ok || !json?.success) {
              throw new Error(`Failed to load listing ${id}`);
            }

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
      // ✅ Keep your existing availability route (if you already wired it)
      window.location.href = `/availability?startDate=${encodeURIComponent(checkIn)}&endDate=${encodeURIComponent(
        checkOut
      )}&guests=${encodeURIComponent(String(guests))}${promo.trim() ? `&promo=${encodeURIComponent(promo.trim())}` : ""}`;
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F7FB] text-slate-900 selection:bg-[#64B6AC]/20 selection:text-slate-900">
      {/* ✅ LIGHT BACKGROUND (no more dark blue all the way down) */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_20%_10%,rgba(100,182,172,0.22),transparent_55%),radial-gradient(760px_520px_at_80%_18%,rgba(15,110,140,0.18),transparent_58%),radial-gradient(900px_650px_at_50%_95%,rgba(217,184,124,0.12),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22 viewBox=%220 0 140 140%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22140%22 height=%22140%22 filter=%22url(%23n)%22 opacity=%220.7%22/%3E%3C/svg%3E')]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/70 backdrop-blur-[14px]">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <a href="#top" className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-2xl bg-white ring-1 ring-black/10">
              {/* ✅ CHANGE LOGO FILE if needed */}
              <Image
                src="/brand/TTB-Logo.png"
                alt={BRAND.name}
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">{BRAND.name}</div>
              <div className="text-[11px] text-slate-600">{BRAND.sub}</div>
            </div>
          </a>

          {/* Desktop nav → hash links (no 404) */}
          <nav className="ml-auto hidden items-center gap-6 text-sm text-slate-700 md:flex">
            <a className="hover:text-slate-900 transition" href="#featured">
              Featured
            </a>
            <a className="hover:text-slate-900 transition" href="#availability">
              Availability
            </a>
            <a className="hover:text-slate-900 transition" href="#reviews">
              Reviews
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a className="text-sm text-slate-600 hover:text-slate-900 transition" href={`tel:${BRAND.phone}`}>
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
              className="rounded-2xl bg-white/70 ring-1 ring-black/10 px-3 py-2 text-sm font-semibold text-slate-900/90"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="md:hidden border-t border-black/10 bg-white/80 backdrop-blur-[14px]">
            <div className="mx-auto max-w-6xl px-4 py-4 grid gap-2 text-sm text-slate-700">
              <a onClick={() => setMobileMenuOpen(false)} className="rounded-2xl px-3 py-2 hover:bg-black/5" href="#featured">
                Featured
              </a>
              <a onClick={() => setMobileMenuOpen(false)} className="rounded-2xl px-3 py-2 hover:bg-black/5" href="#availability">
                Availability
              </a>
              <a onClick={() => setMobileMenuOpen(false)} className="rounded-2xl px-3 py-2 hover:bg-black/5" href="#reviews">
                Reviews
              </a>

              <div className="mt-2 flex gap-2">
                <a className="flex-1" href={`tel:${BRAND.phone}`}>
                  <span className="inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-slate-900/90 bg-white/70 ring-1 ring-black/10">
                    Call
                  </span>
                </a>
                <a className="flex-1" href="#availability">
                  <span className="inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-b from-[#0F6E8C] to-[#0A4C61]">
                    Check
                  </span>
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      {/* HERO */}
      <section id="top" className="relative">
        <div className="relative h-[70vh] min-h-[520px] overflow-hidden">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/media/hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/12 to-[#F4F7FB]" />
          <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_20%_22%,rgba(100,182,172,0.25),transparent_58%)]" />

          <div className="absolute inset-0">
            <div className="mx-auto flex h-full max-w-6xl flex-col justify-end px-4 pb-10 md:pb-14">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill>Oceanfront</Pill>
                  <Pill>Gated community</Pill>
                  <Pill tone="gold">Turtle Bay</Pill>
                </div>

                <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
                  Luxury villas on the North Shore,
                  <span className="text-white/85"> built for calm.</span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/85 md:text-base">
                  Premium space, resort-adjacent location, and direct booking flow — powered by Hostaway listings.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="#availability">
                    <PrimaryButton type="button">Check Availability</PrimaryButton>
                  </a>
                  <SecondaryButton href="#featured">View Featured</SecondaryButton>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <Stat label="Location" value="Turtle Bay" />
                  <Stat label="Style" value="Luxury villa" />
                  <Stat label="Support" value="Local host" />
                  <Stat label="Booking" value="Direct" />
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
                  <div className="text-sm font-semibold text-slate-900">Check availability</div>
                  <div className="mt-1 text-xs text-slate-600">
                    Connected to Hostaway via secure server-side API.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill>Secure server-side API</Pill>
                  <Pill>Mobile-first</Pill>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-12">
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-600">Check-in</label>
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
                  <label className="block text-[11px] font-semibold text-slate-600">Check-out</label>
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
                  <label className="block text-[11px] font-semibold text-slate-600">Guests</label>
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
                  <label className="block text-[11px] font-semibold text-slate-600">
                    Promo code (optional)
                  </label>
                  <div className="mt-2 rounded-2xl bg-white/70 ring-1 ring-black/10 px-3 py-2">
                    <input
                      value={promo}
                      onChange={(e) => setPromo(e.target.value)}
                      placeholder="PROMO"
                      className="h-9 w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                      aria-label="Promo code"
                    />
                  </div>
                </div>

                <div className="md:col-span-12">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-xs text-slate-600">
                      {error ? (
                        <span className="inline-flex items-center gap-2 rounded-2xl bg-red-500/10 px-3 py-2 ring-1 ring-red-400/20 text-red-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          {error}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2 ring-1 ring-black/10">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#64B6AC]" />
                          Tip: Choose dates first — then search to view availability.
                        </span>
                      )}
                    </div>

                    <PrimaryButton type="button" onClick={onSearch} disabled={loading} className={cx(loading && "opacity-80")}>
                      {loading ? "Searching…" : "Search"}
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* FEATURED LISTINGS (Hostaway) */}
      <section id="featured" className="relative">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="flex items-end justify-between gap-6">
            <SectionTitle
              eyebrow="Featured stays"
              title="Only Hostaway listings show here."
              desc="This section is wired to Hostaway — limited to the 6 listing IDs you specified."
            />
            <div className="hidden md:block">
              <a href="#availability">
                <PrimaryButton type="button">Check Availability</PrimaryButton>
              </a>
            </div>
          </div>

          <div className="mt-8">
            {listingsLoading ? (
              <GlassCard className="p-6">
                <div className="text-sm font-semibold text-slate-900">Loading listings…</div>
                <div className="mt-2 text-sm text-slate-600">Fetching 6 Hostaway listings by ID.</div>
              </GlassCard>
            ) : listingsError ? (
              <GlassCard className="p-6">
                <div className="text-sm font-semibold text-slate-900">Listings unavailable</div>
                <div className="mt-2 text-sm text-red-700">{listingsError}</div>
                <div className="mt-4 text-xs text-slate-600">
                  Tip: open <code className="rounded bg-black/5 px-2 py-1">/api/hostaway/listings?id=489089</code> to verify.
                </div>
              </GlassCard>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {listings.map((l) => (
                  <ListingCard key={l.id} l={l} />
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 md:hidden">
            <a className="block" href="#availability">
              <PrimaryButton type="button" className="w-full">
                Check Availability
              </PrimaryButton>
            </a>
          </div>
        </div>
      </section>

      {/* REVIEWS (short) */}
      <section id="reviews" className="relative border-t border-black/10">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <SectionTitle
            eyebrow="Reviews"
            title="Guests remember the feeling."
            desc="Short quotes for now — we can wire real reviews later."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                q: "Beautiful oceanfront stay — quiet, clean, and premium.",
                a: "Verified guest",
              },
              {
                q: "Great location near Turtle Bay. Smooth check-in and fast support.",
                a: "Verified guest",
              },
              {
                q: "Perfect for families — spacious and comfortable.",
                a: "Verified guest",
              },
            ].map((t, i) => (
              <GlassCard key={i} className="p-6">
                <div className="text-sm text-slate-800">“{t.q}”</div>
                <div className="mt-4 text-xs font-semibold text-slate-600">{t.a}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER (no 404 links) */}
      <footer className="relative border-t border-black/10">
        <div className="mx-auto max-w-6xl px-4 py-8 text-xs text-slate-600 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3">
            <a className="hover:text-slate-900 transition" href="#top">
              Top
            </a>
            <a className="hover:text-slate-900 transition" href="#featured">
              Featured
            </a>
            <a className="hover:text-slate-900 transition" href="#availability">
              Availability
            </a>
            <a className="hover:text-slate-900 transition" href="#reviews">
              Reviews
            </a>
          </div>
          <div>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
