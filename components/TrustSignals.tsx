// components/TrustSignals.tsx
//
// Trust/social-proof section built entirely from facts already true elsewhere
// in this codebase (villa count, Hostaway-sourced live pricing, direct
// booking). No star rating, review count, or response-time SLA is invented —
// the reviews slot is a clearly labeled placeholder until real testimonials
// and a verified rating are provided.

import { OCEAN_VILLA_LISTING_IDS } from "@/lib/ocean-villas";

const VILLA_COUNT = OCEAN_VILLA_LISTING_IDS.length;

const FACTS = [
  {
    title: `${VILLA_COUNT} Villas, Professionally Managed`,
    desc: "Every Ocean Villas property at Turtle Bay is professionally managed, from housekeeping to guest support.",
  },
  {
    title: "Direct Booking, Live Pricing",
    desc: "Availability and rates are sourced directly from Hostaway — no third-party platform markups added on top.",
  },
  {
    title: "Local, On-the-Ground Team",
    desc: "Our team is based on Oahu's North Shore and supports guests throughout their stay at Turtle Bay.",
  },
];

export default function TrustSignals({ variant = "full" }: { variant?: "full" | "compact" }) {
  if (variant === "compact") {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
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
