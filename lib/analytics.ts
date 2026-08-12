/**
 * lib/analytics.ts
 *
 * Single, consistent event-tracking helper for the booking funnel.
 * Pushes to the GTM dataLayer when present (see GTM_ID wiring in app/layout.tsx);
 * no-ops safely everywhere else (SSR, GTM not configured, dataLayer blocked).
 *
 * Never pass PII (name, email, phone, full address) as event data —
 * listing IDs, villa names, counts, and booleans are fine.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type AnalyticsEvent =
  | "availability_search"
  | "availability_search_failed"
  | "no_availability_result"
  | "filter_apply"
  | "filter_clear"
  | "sort_change"
  | "villa_card_click"
  | "browse_villas_click"
  | "compare_select"
  | "compare_view"
  | "villa_view"
  | "inquiry_open"
  | "listing_amenities_click"
  | "amenities_expand"
  | "amenities_cta_click"
  // Defined for a future direct-to-checkout flow (see lib/ocean-villas.ts
  // buildBookingUrl) that no current UI element triggers yet — Phase 3
  // conversion audit found no live external-booking transition to
  // instrument. Left in the vocabulary so it's ready when/if that flow
  // ships, rather than inventing a name for it later.
  | "booking_start"
  | "checkout_click"
  | "booking_confirmed"
  | "phone_click"
  | "chat_open"
  | "inquiry_form_start"
  // Fires when the local contact form passes client-side validation and the
  // cross-origin GHL "secure form" iframe is displayed in its place — NOT
  // when GHL actually receives a completed lead. This codebase has no way
  // to observe submission inside that iframe (different origin, no
  // postMessage listener exists, none is documented). Previously named
  // "inquiry_form_submit", which overstated what it measures; renamed
  // during the Phase 3 conversion audit (production testing that same week
  // found no GTM tag currently forwards this — or any other ov_* custom
  // event — to GA4, so this rename carries negligible continuity risk).
  // Treat as HIGH INTENT, never as a confirmed conversion.
  | "inquiry_form_handoff"
  | "inquiry_form_error"
  | "back_to_browse"
  | "mobile_sticky_cta_click";

export function trackEvent(event: AnalyticsEvent | string, data?: Record<string, string | number | boolean>) {
  try {
    if (typeof window === "undefined") return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: `ov_${event}`, ...data });

    if (process.env.NODE_ENV !== "production") {
      console.debug("[OceanVillas]", event, data);
    }
  } catch {
    /* analytics must never break the UI */
  }
}
