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
// itself, per the Phase 1 homepage messaging refresh.

import { OCEAN_VILLA_LISTING_IDS } from "@/lib/ocean-villas";

const VILLA_COUNT = OCEAN_VILLA_LISTING_IDS.length;

const FACTS = [
  {
    title: "Effortless Stays, Every Time",
    desc: `Every one of our ${VILLA_COUNT} Ocean Villas properties at Turtle Bay is professionally managed, so guests can relax knowing their stay is well cared for from arrival to departure.`,
  },
  {
    title: "Book with Confidence",
    desc: "Guests receive direct communication, personalized service, and support from a dedicated local team committed to making their vacation effortless from arrival to departure.",
  },
  {
    title: "Personalized Local Support",
    desc: "From restaurant recommendations and island activities to pre-arrival assistance, our local team is here to help guests experience the very best of Oahu's North Shore.",
  },
];

export default function TrustSignals({ variant = "full" }: { variant?: "full" | "compact" }) {
  if (variant === "compact") {
    return (
      // 3-up once there's room (full-width stacked layout or the widened xl
      // sidebar column); 2-up in the lg–xl band where the listing page's
      // 360px booking sidebar squeezes the main column and 3 columns made
      // this longer guest-benefit copy wrap awkwardly tight.
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {FACTS.map((f) => (
          <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">{f.title}</div>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="py-14 md:py-16 bg-slate-50 border-y border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Why Guests Book With Us</div>
          <h2 className="text-3xl font-serif tracking-tight text-slate-900 md:text-4xl">
            A direct, transparent way to stay at Turtle Bay
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {FACTS.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
              <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{f.desc}</p>
            </div>
          ))}

          {/* Clearly-labeled placeholder — no fabricated rating or review count */}
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 flex flex-col justify-center">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Coming Soon</div>
            <h3 className="mt-2 text-base font-semibold text-slate-500">Verified Guest Reviews</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              We&apos;re collecting verified guest testimonials and a review rating to display here.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
