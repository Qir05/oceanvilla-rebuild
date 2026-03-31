// app/contact/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Ocean Villas at Turtle Bay",
  description:
    "Get in touch with Ocean Villas at Turtle Bay. Questions about availability, bookings, or villa details — we're here to help.",
  alternates: { canonical: "/contact" },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
            ← Back to Home
          </Link>
          <span className="text-sm font-medium text-slate-500">Ocean Villas at Turtle Bay</span>
        </div>
      </header>

      <section className="bg-white border-b border-slate-100 py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">
            Get in Touch
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-slate-900 leading-tight">
            Contact Ocean Villas
          </h1>
          <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-xl">
            Have a question about a villa, your booking, or planning your North Shore stay? Use the chat widget on this page or reach us by phone.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Phone</h2>
              <p className="text-sm text-slate-600 mb-4">
                Call us directly for booking questions, availability, or general inquiries.
              </p>
              <a
                href="tel:+18583452082"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                (858) 345-2082
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Live Chat</h2>
              <p className="text-sm text-slate-600 mb-4">
                Use the chat widget at the bottom-right of any page to connect with the team directly.
              </p>
              <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-700">
                Chat available on every page
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Booking Questions</h2>
              <p className="text-sm leading-7 text-slate-600">
                All booking, pricing, and availability is managed through Hostaway. Once you've selected dates and a villa, the booking engine will guide you through secure checkout.
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Search Availability
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Location</h2>
              <p className="text-sm leading-7 text-slate-600">
                Ocean Villas at Turtle Bay is located on Oahu's North Shore, Hawaii. The properties are within the Turtle Bay resort area, approximately 45 minutes north of Honolulu International Airport.
              </p>
              <Link
                href="/location"
                className="mt-4 inline-flex items-center text-sm font-semibold text-slate-900 hover:text-slate-700"
              >
                View location details →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-lg font-serif font-bold text-slate-900">Ocean Villas at Turtle Bay</div>
          <div className="text-sm text-slate-500">© {new Date().getFullYear()} Ocean Villas at Turtle Bay. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
