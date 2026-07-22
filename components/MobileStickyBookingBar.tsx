// components/MobileStickyBookingBar.tsx
"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

const BRAND_PHONE = "(858) 727-2427";
const TEL_HREF = "tel:+18587272427";

/**
 * Mobile-only sticky bottom booking bar. Not rendered on /contact (the whole
 * page is already a form) or on villa detail pages (which have their own
 * tailored sticky bar with the same Call Us / Check Availability pattern).
 */
export default function MobileStickyBookingBar({
  checkDatesHref = "/availability",
}: {
  checkDatesHref?: string;
}) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] md:hidden bg-white/96 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-[0_-6px_28px_rgba(15,23,42,0.09)] pb-[calc(env(safe-area-inset-bottom)+12px)]"
      role="region"
      aria-label="Booking actions"
    >
      <div className="max-w-lg mx-auto flex gap-3">
        <a
          href={TEL_HREF}
          onClick={() => trackEvent("phone_click", { source: "mobile_sticky_bar" })}
          aria-label={`Call Us at ${BRAND_PHONE}`}
          className="flex-1 inline-flex items-center justify-center min-h-[48px] rounded-xl px-3 py-3.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold shadow-[0_2px_8px_rgba(15,23,42,0.08)] hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-px active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          <svg className="mr-1.5 h-4 w-4 opacity-70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Call Us
        </a>
        <Link
          href={checkDatesHref}
          onClick={() => trackEvent("mobile_sticky_cta_click", { cta: "check_dates" })}
          aria-label="Check available dates"
          className="flex-[2] inline-flex items-center justify-center min-h-[48px] rounded-xl px-3 py-3.5 bg-[#3f5f4a] text-white text-sm font-semibold shadow-[0_3px_12px_rgba(63,95,74,0.22)] hover:-translate-y-px hover:bg-[#334e3c] hover:shadow-[0_6px_20px_rgba(63,95,74,0.28)] active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3f5f4a] focus-visible:ring-offset-2 transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          <svg className="mr-1.5 h-4 w-4 opacity-80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Check Dates
        </Link>
      </div>
    </div>
  );
}
