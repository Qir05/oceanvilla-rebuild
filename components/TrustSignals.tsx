// components/TrustSignals.tsx
//
// Trust/social-proof section built entirely from facts already true elsewhere
// in this codebase (villa count, Hostaway-sourced live pricing, direct
// booking). No star rating, review count, or response-time SLA is invented —
// the reviews slot is a clearly labeled placeholder until real testimonials
// and a verified rating are provided.
//
// Copy is framed around the guest benefit of each fact (personalized support,
// booking confidence, effortless stays) rather than the operational feature
// itself, per the Phase 1 homepage messaging refresh. Icon treatment and
// section framing refined in Phase 2D for visual consistency with the rest
// of the premium-coastal design system — no factual copy changed.

import { OCEAN_VILLA_LISTING_IDS } from "@/lib/ocean-villas";

const VILLA_COUNT = OCEAN_VILLA_LISTING_IDS.length;

function HomeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 10.5 12 3.5l8.5 7M5.5 9.5V19a1 1 0 001 1h4v-6h3v6h4a1 1 0 001-1V9.5" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5 5.5 6v5.2c0 4.6 2.9 7.7 6.5 9.3 3.6-1.6 6.5-4.7 6.5-9.3V6L12 3.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4.5" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="8.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.6 9.4 13 13l-3.6 1.6L11 11l3.6-1.6z" />
    </svg>
  );
}

function StarOutlineIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75l2.47 5.13 5.66.63-4.2 3.9 1.1 5.6L12 16.3l-5.03 2.71 1.1-5.6-4.2-3.9 5.66-.63L12 3.75z" />
    </svg>
  );
}

const FACTS = [
  {
    title: "Effortless Stays, Every Time",
    desc: `Every one of our ${VILLA_COUNT} Ocean Villas properties at Turtle Bay is professionally managed, so guests can relax knowing their stay is well cared for from arrival to departure.`,
    icon: HomeIcon,
  },
  {
    title: "Book with Confidence",
    desc: "Guests receive direct communication, personalized service, and support from a dedicated local team committed to making their vacation effortless from arrival to departure.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Personalized Local Support",
    desc: "From restaurant recommendations and island activities to pre-arrival assistance, our local team is here to help guests experience the very best of Oahu's North Shore.",
    icon: CompassIcon,
  },
];

export default function TrustSignals({ variant = "full" }: { variant?: "full" | "compact" }) {
  if (variant === "compact") {
    return (
      // 3-up once there's room (full-width stacked layout or the widened xl
      // sidebar column); 2-up in the lg–xl band where the listing page's
      // 360px booking sidebar squeezes the main column and 3 columns made
      // this longer guest-benefit copy wrap awkwardly tight. At 2-up, the
      // 3rd (odd, last) card would otherwise sit alone with dead space
      // beside it — span it full-width instead of leaving it orphaned.
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 lg:[&>*:nth-child(3):last-child]:col-span-2 xl:[&>*:nth-child(3):last-child]:col-span-1">
        {FACTS.map((f) => (
          <div
            key={f.title}
            className="group rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-[#3f5f4a]/30 hover:shadow-[0_6px_20px_rgba(15,23,42,0.06)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3f5f4a]/8 text-[#3f5f4a] transition-colors duration-200 group-hover:bg-[#3f5f4a]/14">
              <f.icon />
            </div>
            <div className="mt-3 text-sm font-semibold text-slate-900">{f.title}</div>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="py-14 md:py-20 bg-[#f8f4ec] border-y border-[#ece4d4]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="h-px w-8 bg-[#3f5f4a]" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Why Guests Book With Us</span>
          </div>
          <h2 className="text-3xl font-serif tracking-tight text-slate-900 md:text-4xl">
            A direct, transparent way to stay at Turtle Bay
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {FACTS.map((f) => (
            <div
              key={f.title}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_44px_rgba(15,23,42,0.1)] hover:border-[#3f5f4a]/25"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3f5f4a]/8 text-[#3f5f4a] transition-colors duration-300 group-hover:bg-[#3f5f4a] group-hover:text-white">
                <f.icon />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2.5 text-sm leading-6 text-slate-600">{f.desc}</p>
            </div>
          ))}

          {/* Clearly-labeled placeholder — no fabricated rating or review count */}
          <div className="flex flex-col rounded-2xl border border-dashed border-[#D9B87C]/50 bg-white/70 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D9B87C]/12 text-[#8B6B2B]">
              <StarOutlineIcon />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-500">Verified Guest Reviews</h3>
              <span className="rounded-full bg-[#D9B87C]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8B6B2B]">
                Coming Soon
              </span>
            </div>
            <p className="mt-2.5 text-sm leading-6 text-slate-400">
              We&apos;re collecting verified guest testimonials and a review rating to display here.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
