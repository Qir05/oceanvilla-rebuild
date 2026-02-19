"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type FeaturedRental = {
  id: string;
  name: string;
  tagline: string;
  sleeps: number;
  beds: number;
  baths: number;
  highlight: string;
  image: string;
  fromPrice?: string;
};

const BRAND = {
  name: "Sundance Shores",
  sub: "Oceanfront • Resort-Style Stay",
  phone: "(808) XXX-XXXX",
};

const FEATURED: FeaturedRental[] = [
  {
    id: "coastline-suite",
    name: "Coastline Suite",
    tagline: "Ocean views • Breezy modern interiors",
    sleeps: 6,
    beds: 3,
    baths: 2,
    highlight: "Beach access",
    image: "/media/rentals/1.jpg",
    fromPrice: "$399",
  },
  {
    id: "sunset-villa",
    name: "Sunset Villa",
    tagline: "Golden-hour balcony • Family friendly",
    sleeps: 8,
    beds: 4,
    baths: 3,
    highlight: "Private lanai",
    image: "/media/rentals/2.jpg",
    fromPrice: "$520",
  },
  {
    id: "reef-house",
    name: "Reef House",
    tagline: "Steps to the water • Premium amenities",
    sleeps: 10,
    beds: 5,
    baths: 4,
    highlight: "Pool + fast Wi-Fi",
    image: "/media/rentals/3.jpg",
    fromPrice: "$690",
  },
];

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
        "rounded-3xl border border-white/10 bg-white/5 backdrop-blur-[16px]",
        "shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
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
        "shadow-[0_12px_35px_rgba(15,110,140,0.35)]",
        "transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]",
        "focus:outline-none focus:ring-2 focus:ring-[#64B6AC]/60 focus:ring-offset-0",
        "disabled:opacity-70 disabled:cursor-not-allowed",
        className
      )}
    >
      <span className="relative z-10">{children}</span>
      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
    </button>
  );
}

function SecondaryLink({
  children,
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      className={cx(
        "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold",
        "text-white/90 ring-1 ring-white/12 bg-white/5 backdrop-blur",
        "transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] hover:bg-white/8",
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
          ? "bg-[#D9B87C]/15 text-[#D9B87C] ring-1 ring-[#D9B87C]/25"
          : "bg-white/6 text-white/80 ring-1 ring-white/10"
      )}
    >
      {children}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 px-4 py-3">
      <div className="text-[11px] font-medium text-white/60">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white/90">{value}</div>
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
        <div className="text-xs font-semibold tracking-wide text-[#64B6AC]">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
        {title}
      </h2>
      {desc ? (
        <p className="mt-3 text-sm leading-relaxed text-white/70">{desc}</p>
      ) : null}
    </div>
  );
}

function RentalCard({ r }: { r: FeaturedRental }) {
  return (
    <div className="group overflow-hidden rounded-3xl ring-1 ring-white/10 bg-white/5 backdrop-blur-[14px] transition-transform duration-200 hover:scale-[1.01]">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={r.image}
          alt={r.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4">
          <Pill>{r.highlight}</Pill>
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
            <div className="text-base font-semibold text-white">{r.name}</div>
            <div className="mt-1 text-xs text-white/65">{r.tagline}</div>
          </div>
          <Link
            href={`/rentals/${r.id}`}
            className="shrink-0 rounded-2xl px-3 py-2 text-xs font-semibold text-white/90 bg-white/5 ring-1 ring-white/10 hover:bg-white/8 transition"
          >
            View
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="Sleeps" value={`${r.sleeps}`} />
          <Stat label="Beds" value={`${r.beds}`} />
          <Stat label="Baths" value={`${r.baths}`} />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const today = useMemo(() => formatISO(new Date()), []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // booking state (mock)
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<number>(2);
  const [propertyId, setPropertyId] = useState<string>("");
  const [promo, setPromo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const propertyOptions = useMemo(
    () => [
      { id: "", label: "Any property" },
      { id: "coastline-suite", label: "Coastline Suite" },
      { id: "sunset-villa", label: "Sunset Villa" },
      { id: "reef-house", label: "Reef House" },
    ],
    []
  );

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
      // later: Hostaway quote endpoint
      await new Promise((r) => setTimeout(r, 550));

      const qp = new URLSearchParams();
      qp.set("checkIn", checkIn);
      qp.set("checkOut", checkOut);
      qp.set("guests", String(guests));
      if (propertyId) qp.set("propertyId", propertyId);
      if (promo.trim()) qp.set("promo", promo.trim());

      window.location.href = `/rentals?${qp.toString()}`;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#071421] text-white selection:bg-[#64B6AC]/25 selection:text-white">
      {/* Subtle background depth (site-wide) */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_10%,rgba(100,182,172,0.18),transparent_55%),radial-gradient(700px_450px_at_80%_20%,rgba(15,110,140,0.18),transparent_55%),radial-gradient(900px_650px_at_50%_90%,rgba(217,184,124,0.10),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22 viewBox=%220 0 140 140%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22140%22 height=%22140%22 filter=%22url(%23n)%22 opacity=%220.7%22/%3E%3C/svg%3E')]" />
      </div>

      {/* HEADER (top-center look, premium) */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071421]/55 backdrop-blur-[14px]">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
              <Image
                src="/brand/TTB-Logo.png"
                alt={BRAND.name}
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">
                {BRAND.name}
              </div>
              <div className="text-[11px] text-white/60">{BRAND.sub}</div>
            </div>
          </Link>

          <nav className="ml-auto hidden items-center gap-6 text-sm text-white/75 md:flex">
            <Link className="hover:text-white transition" href="/rentals">
              Rentals
            </Link>
            <Link className="hover:text-white transition" href="/amenities">
              Amenities
            </Link>
            <Link className="hover:text-white transition" href="/location">
              Location
            </Link>
            <Link className="hover:text-white transition" href="/about">
              About
            </Link>
            <Link className="hover:text-white transition" href="/contact">
              Contact
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a
              className="text-sm text-white/70 hover:text-white transition"
              href={`tel:${BRAND.phone}`}
            >
              {BRAND.phone}
            </a>
            <SecondaryLink href="/contact">Book a Call</SecondaryLink>
            <a href="#availability">
              <PrimaryButton type="button">Check Availability</PrimaryButton>
            </a>
          </div>

          <div className="ml-auto flex items-center gap-2 md:hidden">
            <a href="#availability">
              <PrimaryButton type="button" className="px-4 py-2">
                Check
              </PrimaryButton>
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="rounded-2xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm font-semibold text-white/90"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="md:hidden border-t border-white/10 bg-[#071421]/70 backdrop-blur-[14px]">
            <div className="mx-auto max-w-6xl px-4 py-4 grid gap-2 text-sm text-white/80">
              <Link
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl px-3 py-2 hover:bg-white/5"
                href="/rentals"
              >
                Rentals
              </Link>
              <Link
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl px-3 py-2 hover:bg-white/5"
                href="/amenities"
              >
                Amenities
              </Link>
              <Link
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl px-3 py-2 hover:bg-white/5"
                href="/location"
              >
                Location
              </Link>
              <Link
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl px-3 py-2 hover:bg-white/5"
                href="/about"
              >
                About
              </Link>
              <Link
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl px-3 py-2 hover:bg-white/5"
                href="/contact"
              >
                Contact
              </Link>

              <div className="mt-2 flex gap-2">
                <SecondaryLink className="flex-1" href="/contact">
                  Book a Call
                </SecondaryLink>
                <a className="flex-1" href={`tel:${BRAND.phone}`}>
                  <span className="inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white/90 bg-white/5 ring-1 ring-white/10">
                    Call
                  </span>
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      {/* HERO VIDEO (full cover, center, like 3rd photo) */}
      <section className="relative">
        <div className="relative h-[80vh] min-h-[560px] w-full overflow-hidden">
          {/* Video background */}
          <video
            className="absolute inset-0 h-full w-full object-cover object-center"
            src="/media/hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />

          {/* overlays to make text readable + premium depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-[#071421]" />
          <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_20%_15%,rgba(100,182,172,0.18),transparent_55%)]" />

          {/* Hero content (center-left like premium hospitality) */}
          <div className="absolute inset-0">
            <div className="mx-auto max-w-6xl px-4">
              <div className="pt-20 md:pt-24">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill>Direct booking</Pill>
                  <Pill>Resort-style comfort</Pill>
                  <Pill tone="gold">Best value online</Pill>
                </div>

                <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
                  A premium oceanfront
                  <span className="text-white/85"> stay, built for calm.</span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
                  Modern coastal interiors, fast Wi-Fi, family-friendly spaces, and effortless booking —
                  designed to feel like a luxury hotel, but more private.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="#availability">
                    <PrimaryButton type="button">Check Availability</PrimaryButton>
                  </a>
                  <SecondaryLink href="/rentals">View Rentals</SecondaryLink>
                </div>

                <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 md:grid-cols-4">
                  <Stat label="Response time" value="Fast (typ.)" />
                  <Stat label="Check-in" value="Flexible" />
                  <Stat label="Location" value="Oceanfront" />
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
                  <div className="text-sm font-semibold text-white">
                    Check availability
                  </div>
                  <div className="mt-1 text-xs text-white/60">
                    Ready to connect to Hostaway once your API keys arrive.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill>Secure server-side API</Pill>
                  <Pill>Mobile-first</Pill>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-12">
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-semibold text-white/65">
                    Check-in
                  </label>
                  <div className="mt-2 rounded-2xl bg-white/5 ring-1 ring-white/10 px-3 py-2">
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
                      className="h-9 w-full bg-transparent text-sm text-white outline-none [color-scheme:dark]"
                      aria-label="Check-in date"
                    />
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[11px] font-semibold text-white/65">
                    Check-out
                  </label>
                  <div className="mt-2 rounded-2xl bg-white/5 ring-1 ring-white/10 px-3 py-2">
                    <input
                      type="date"
                      min={checkIn || today}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="h-9 w-full bg-transparent text-sm text-white outline-none [color-scheme:dark]"
                      aria-label="Check-out date"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-white/65">
                    Guests
                  </label>
                  <div className="mt-2 rounded-2xl bg-white/5 ring-1 ring-white/10 px-3 py-2">
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="h-9 w-full bg-transparent text-sm text-white outline-none"
                      aria-label="Guests"
                    >
                      {Array.from({ length: 14 }).map((_, i) => (
                        <option key={i + 1} value={i + 1} className="text-slate-900">
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-white/65">
                    Property
                  </label>
                  <div className="mt-2 rounded-2xl bg-white/5 ring-1 ring-white/10 px-3 py-2">
                    <select
                      value={propertyId}
                      onChange={(e) => setPropertyId(e.target.value)}
                      className="h-9 w-full bg-transparent text-sm text-white outline-none"
                      aria-label="Property selector"
                    >
                      {propertyOptions.map((p) => (
                        <option key={p.id} value={p.id} className="text-slate-900">
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-white/65">
                    Promo code (optional)
                  </label>
                  <div className="mt-2 rounded-2xl bg-white/5 ring-1 ring-white/10 px-3 py-2">
                    <input
                      value={promo}
                      onChange={(e) => setPromo(e.target.value)}
                      placeholder="PROMO"
                      className="h-9 w-full bg-transparent text-sm text-white placeholder:text-white/35 outline-none"
                      aria-label="Promo code"
                    />
                  </div>
                </div>

                <div className="md:col-span-12">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-xs text-white/60">
                      {error ? (
                        <span className="inline-flex items-center gap-2 rounded-2xl bg-red-500/10 px-3 py-2 ring-1 ring-red-400/20 text-red-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-300" />
                          {error}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#64B6AC]" />
                          Tip: Choose dates first — quote breakdown will appear when Hostaway is connected.
                        </span>
                      )}
                    </div>

                    <PrimaryButton type="button" onClick={onSearch} disabled={loading}>
                      {loading ? "Searching…" : "Search"}
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* FEATURED RENTALS */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="flex items-end justify-between gap-6">
            <SectionTitle
              eyebrow="Featured stays"
              title="Select a space that fits your vibe."
              desc="This section is using mock data for now — later we’ll feed it from Hostaway listings."
            />
            <div className="hidden md:block">
              <SecondaryLink href="/rentals">Browse all</SecondaryLink>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {FEATURED.map((r) => (
              <RentalCard key={r.id} r={r} />
            ))}
          </div>

          <div className="mt-6 md:hidden">
            <SecondaryLink className="w-full" href="/rentals">
              Browse all rentals
            </SecondaryLink>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section className="relative border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <footer className="flex flex-col gap-4 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3">
              <Link className="hover:text-white/80 transition" href="/privacy-policy">
                Privacy Policy
              </Link>
              <Link className="hover:text-white/80 transition" href="/terms-of-service">
                Terms of Service
              </Link>
              <Link className="hover:text-white/80 transition" href="/contact">
                Contact
              </Link>
            </div>
            <div>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</div>
          </footer>
        </div>
      </section>
    </main>
  );
}
