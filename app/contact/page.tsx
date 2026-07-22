// app/contact/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import InquiryForm from "@/components/contact/InquiryForm";

const pageTitle = "Contact | Ocean Villas at Turtle Bay";
const pageDescription =
  "Get in touch with Ocean Villas at Turtle Bay. Questions about availability, bookings, or villa details — we're here to help.";

export const metadata: Metadata = {
  title: { absolute: pageTitle },
  description: pageDescription,
  alternates: { canonical: "/contact" },
  robots: { index: true, follow: true },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/contact",
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
    title: pageTitle,
    description: pageDescription,
    images: ["/brand/TTB-Logo.png"],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://oceanvillasturtlebay.com/" },
    { "@type": "ListItem", position: 2, name: "Contact", item: "https://oceanvillasturtlebay.com/contact" },
  ],
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
            Back to Home
          </Link>
          <span className="text-sm font-medium text-slate-500">Ocean Villas at Turtle Bay</span>
        </div>
      </header>

      <section className="bg-white border-b border-slate-100 py-8 md:py-10">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
            Get in Touch
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-slate-900 leading-tight">
            Contact Ocean Villas
          </h1>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-xl">
            Have a question about a villa, your booking, or planning your North Shore stay? Send an inquiry below, use the chat widget on this page, or reach us by phone.
          </p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          {/* Inquiry form */}
          <InquiryForm />

          {/* Sidebar: phone / chat / hours / other ways to reach us */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-3">Phone</h2>
              <p className="text-sm text-slate-600 mb-4">
                Call Us directly for booking questions, availability, or general inquiries.
              </p>
              <a
                href="tel:+18587272427"
                className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Call Us · (858) 727-2427
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-3">Chat With Us</h2>
              <p className="text-sm text-slate-600 mb-4">
                Use the chat widget at the bottom-right of any page to connect with our local team directly.
              </p>
              <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-700">
                Chat available on every page
              </span>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-3">Other Ways to Reach Us</h2>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center justify-between">
                  <span>Email</span>
                  <span className="text-xs font-medium text-amber-600">To be confirmed</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Text message</span>
                  <span className="text-xs font-medium text-amber-600">To be confirmed</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>WhatsApp</span>
                  <span className="text-xs font-medium text-amber-600">To be confirmed</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Contact hours</span>
                  <span className="text-xs font-medium text-amber-600">To be confirmed</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Typical response time</span>
                  <span className="text-xs font-medium text-amber-600">To be confirmed</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-3">Booking Questions</h2>
              <p className="text-sm leading-7 text-slate-600">
                All booking, pricing, and availability is managed through Hostaway. Once you&apos;ve selected dates and a villa, the booking engine will guide you through secure checkout.
              </p>
              <Link
                href="/availability"
                className="mt-4 inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Search Availability
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-3">Location</h2>
              <p className="text-sm leading-7 text-slate-600">
                Ocean Villas at Turtle Bay is located on Oahu&apos;s North Shore, Hawaii, within the Turtle Bay resort area, approximately 45 minutes north of Honolulu International Airport.
              </p>
              <Link
                href="/location"
                className="mt-4 inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                View Location Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-lg font-serif font-bold text-slate-900">Ocean Villas at Turtle Bay</div>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-500">
            <Link href="/rentals" className="hover:text-slate-700 transition">Villas</Link>
            <Link href="/amenities" className="hover:text-slate-700 transition">Amenities</Link>
            <Link href="/location" className="hover:text-slate-700 transition">Location</Link>
            <Link href="/about" className="hover:text-slate-700 transition">About</Link>
          </nav>
          <div className="text-sm text-slate-500">© {new Date().getFullYear()} Ocean Villas at Turtle Bay. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
