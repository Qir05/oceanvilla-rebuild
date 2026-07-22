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
  | "date_search"
  | "guest_count_change"
  | "filter_apply"
  | "filter_clear"
  | "sort_change"
  | "villa_card_click"
  | "compare_select"
  | "compare_view"
  | "villa_view"
  | "booking_start"
  | "checkout_click"
  | "booking_confirmed"
  | "availability_search_failed"
  | "no_availability_result"
  | "phone_click"
  | "chat_open"
  | "inquiry_form_start"
  | "inquiry_form_submit"
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
