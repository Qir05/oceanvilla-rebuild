// app/availability/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import AvailabilitySearch from "./AvailabilitySearch";
import MobileStickyBookingBar from "@/components/MobileStickyBookingBar";

export const metadata: Metadata = {
  title: {
    absolute: "Check Availability — Turtle Bay, North Shore Oahu | Ocean Villas",
  },
  description:
    "Search live availability across 7 private villas at Turtle Bay, North Shore Oahu. Real-time Hostaway pricing, direct booking, no platform fees.",
  alternates: { canonical: "/availability" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Check Availability — Turtle Bay, North Shore Oahu | Ocean Villas",
    description:
      "Search live dates across 7 private Turtle Bay villas and continue straight into direct booking — no platform markups.",
    url: "/availability",
    siteName: "Ocean Villas at Turtle Bay",
    type: "website",
    images: [
      {
        url: "/brand/TTB-Logo.png",
        width: 1200,
        height: 630,
        alt: "Ocean Villas at Turtle Bay",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Check Availability — Turtle Bay, North Shore Oahu | Ocean Villas",
    description:
      "Search live dates across 7 private Turtle Bay villas — direct booking, no platform markups.",
    images: ["/brand/TTB-Logo.png"],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://oceanvillasturtlebay.com/" },
    { "@type": "ListItem", position: 2, name: "Availability", item: "https://oceanvillasturtlebay.com/availability" },
  ],
};

export default function AvailabilityPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            Back to Home
          </Link>
          <span className="text-sm font-medium text-slate-500">Ocean Villas at Turtle Bay</span>
        </div>
      </header>

      <section className="bg-white border-b border-slate-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-slate-900">
            Check Availability at Ocean Villas at Turtle Bay
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600 leading-relaxed">
            Search your dates below to see live availability across our 7 private villas at Turtle Bay, North Shore Oahu. Pricing and open dates are pulled directly from Hostaway, so what you see is accurate and ready to book direct — no third-party platform markups.
          </p>
          <p className="mt-3 max-w-2xl text-sm text-slate-500 leading-relaxed">
            Not ready to search yet? <Link href="/rentals" className="font-semibold text-slate-700 hover:text-slate-900 underline underline-offset-2">Browse the full villa collection</Link> or see what&apos;s included on the <Link href="/amenities" className="font-semibold text-slate-700 hover:text-slate-900 underline underline-offset-2">amenities page</Link>.
          </p>

          {/* Interactive search + live Hostaway results. Client-rendered so the
              date/guest form and results stay reactive; the heading and intro
              copy above are server-rendered so search engines and users see
              meaningful content immediately, before this hydrates. */}
          <AvailabilitySearch />
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-lg font-serif font-bold text-slate-900">Ocean Villas at Turtle Bay</div>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-500">
            <Link href="/rentals" className="hover:text-slate-700 transition">Rentals</Link>
            <Link href="/amenities" className="hover:text-slate-700 transition">Amenities</Link>
            <Link href="/location" className="hover:text-slate-700 transition">Location</Link>
            <Link href="/about" className="hover:text-slate-700 transition">About</Link>
            <Link href="/contact" className="hover:text-slate-700 transition">Contact</Link>
          </nav>
          <div className="text-sm text-slate-500">© {new Date().getFullYear()} Ocean Villas at Turtle Bay. All rights reserved.</div>
        </div>
      </footer>

      <MobileStickyBookingBar />
    </main>
  );
}
