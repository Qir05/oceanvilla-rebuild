// components/contact/InquiryForm.tsx
"use client";

import { useMemo, useState } from "react";
import { OCEAN_VILLA_LISTING_IDS, MAX_SITE_GUEST_CAPACITY } from "@/lib/ocean-villas";
import { trackEvent } from "@/lib/analytics";

// Same GHL form already used by the villa inquiry modal (app/listing/[id]/page.tsx) —
// this is the only proven, working inquiry-routing mechanism in the project, so the
// contact form hands off to it rather than inventing a new backend/CRM integration.
const GHL_FORM_BASE = "https://api.leadconnectorhq.com/widget/form/ZSl4b5HMWIr8ULY5bAGa";

const VILLA_DISPLAY_NAMES: Record<string, string> = {
  "489095": "The Penthouse Villa",
  "505671": "The View Villa",
};

type InquiryType = "new" | "existing";
type PreferredContact = "call" | "text" | "email";

type FormState = {
  inquiryType: InquiryType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredContact: PreferredContact;
  villaOfInterest: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  message: string;
  consent: boolean;
  // Honeypot — real guests never see or fill this field.
  company: string;
};

const INITIAL_STATE: FormState = {
  inquiryType: "new",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  preferredContact: "email",
  villaOfInterest: "",
  checkIn: "",
  checkOut: "",
  guests: "2",
  message: "",
  consent: false,
  company: "",
};

type Errors = Partial<Record<keyof FormState, string>>;

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isValidPhone(v: string) {
  return /^[\d\s()+\-.]{7,}$/.test(v);
}

export default function InquiryForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "ready" | "error">("idle");
  const [startedTracked, setStartedTracked] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    if (!startedTracked) {
      trackEvent("inquiry_form_start");
      setStartedTracked(true);
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!form.firstName.trim()) next.firstName = "First name is required.";
    if (!form.lastName.trim()) next.lastName = "Last name is required.";
    if (!form.email.trim() || !isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (!form.phone.trim() || !isValidPhone(form.phone)) next.phone = "Enter a valid phone number.";
    if (form.inquiryType === "new" && form.checkIn && form.checkOut && form.checkIn >= form.checkOut) {
      next.checkOut = "Check-out must be after check-in.";
    }
    if (!form.message.trim()) next.message = "Tell us a little about your inquiry.";
    if (!form.consent) next.consent = "Please confirm you agree to be contacted.";
    return next;
  }

  const formUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("source", "oceanvillasturtlebay.com/contact");
    params.set("inquiry_type", form.inquiryType === "new" ? "New Inquiry" : "Existing Booking");
    params.set("first_name", form.firstName);
    params.set("last_name", form.lastName);
    params.set("email", form.email);
    params.set("phone", form.phone);
    params.set("preferred_contact", form.preferredContact);
    params.set("message", form.message);
    if (form.inquiryType === "new") {
      if (form.villaOfInterest) {
        const label = VILLA_DISPLAY_NAMES[form.villaOfInterest] || `Villa ${form.villaOfInterest}`;
        params.set("villa", label);
        params.set("listing_id", form.villaOfInterest);
        params.set("Villa_of_Interest", label);
      }
      if (form.checkIn) params.set("check_in", form.checkIn);
      if (form.checkOut) params.set("check_out", form.checkOut);
      params.set("guests", form.guests);
    }
    return `${GHL_FORM_BASE}?${params.toString()}`;
  }, [form]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Honeypot — if a bot filled this hidden field, silently no-op.
    if (form.company.trim()) {
      setStatus("ready");
      return;
    }

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      trackEvent("inquiry_form_error", { fields: Object.keys(nextErrors).join(",") });
      return;
    }

    if (status === "submitting" || status === "ready") return; // duplicate-submit guard

    // Local form validated and handed off to the GHL iframe — not yet a
    // confirmed lead. See the AnalyticsEvent doc comment in lib/analytics.ts.
    trackEvent("inquiry_form_handoff", { inquiry_type: form.inquiryType });
    setStatus("submitting");
  }

  function reset() {
    setForm(INITIAL_STATE);
    setErrors({});
    setStatus("idle");
    setStartedTracked(false);
  }

  if (status === "submitting" || status === "ready") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Complete your inquiry</h2>
            <p className="mt-1 text-sm text-slate-500 leading-relaxed">
              Your details are ready below. Review the secure form and submit it to send your inquiry to our local team.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="shrink-0 text-xs font-semibold text-slate-500 hover:text-slate-900 underline underline-offset-2"
          >
            Start over
          </button>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-slate-200" style={{ minHeight: 640 }}>
          {status === "submitting" && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <span className="text-sm font-medium text-slate-500">Loading secure form…</span>
            </div>
          )}
          <iframe
            src={formUrl}
            title="Ocean Villas Inquiry Form"
            style={{ width: "100%", height: "640px", border: "none", display: "block" }}
            loading="lazy"
            onLoad={() => setStatus("ready")}
            onError={() => {
              trackEvent("inquiry_form_error", { reason: "iframe_load_failed" });
              setStatus("error");
            }}
          />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-700">The secure inquiry form couldn&apos;t load. Please try again.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-red-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900";
  const labelClass = "block text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1.5";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5"
    >
      {/* Honeypot field — visually hidden via Tailwind's clip-based sr-only
          utility rather than off-screen absolute positioning, so it can
          never introduce page-level horizontal overflow. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.company}
          onChange={(e) => update("company", e.target.value)}
        />
      </div>

      {/* Inquiry type */}
      <div>
        <span className={labelClass}>Inquiry Type</span>
        <div className="grid grid-cols-2 gap-2">
          {(["new", "existing"] as InquiryType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update("inquiryType", type)}
              aria-pressed={form.inquiryType === type}
              className={[
                "rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                form.inquiryType === type
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              ].join(" ")}
            >
              {type === "new" ? "New Inquiry" : "Existing Booking"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className={labelClass}>First Name</label>
          <input
            id="firstName"
            className={inputClass}
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            autoComplete="given-name"
          />
          {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
        </div>
        <div>
          <label htmlFor="lastName" className={labelClass}>Last Name</label>
          <input
            id="lastName"
            className={inputClass}
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            autoComplete="family-name"
          />
          {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            id="email"
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            autoComplete="email"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>Phone Number</label>
          <input
            id="phone"
            type="tel"
            className={inputClass}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            autoComplete="tel"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="preferredContact" className={labelClass}>Preferred Contact Method</label>
        <select
          id="preferredContact"
          className={inputClass}
          value={form.preferredContact}
          onChange={(e) => update("preferredContact", e.target.value as PreferredContact)}
        >
          <option value="email">Email</option>
          <option value="call">Call</option>
          <option value="text">Text</option>
        </select>
      </div>

      {form.inquiryType === "new" && (
        <>
          <div>
            <label htmlFor="villaOfInterest" className={labelClass}>Villa of Interest</label>
            <select
              id="villaOfInterest"
              className={inputClass}
              value={form.villaOfInterest}
              onChange={(e) => update("villaOfInterest", e.target.value)}
            >
              <option value="">Not sure yet</option>
              {OCEAN_VILLA_LISTING_IDS.map((id) => (
                <option key={id} value={id}>
                  {VILLA_DISPLAY_NAMES[id] || `Villa ${id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="checkIn" className={labelClass}>Check-in</label>
              <input
                id="checkIn"
                type="date"
                className={inputClass}
                value={form.checkIn}
                onChange={(e) => update("checkIn", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="checkOut" className={labelClass}>Check-out</label>
              <input
                id="checkOut"
                type="date"
                className={inputClass}
                value={form.checkOut}
                onChange={(e) => update("checkOut", e.target.value)}
              />
              {errors.checkOut && <p className="mt-1 text-xs text-red-600">{errors.checkOut}</p>}
            </div>
            <div>
              <label htmlFor="guests" className={labelClass}>Guests</label>
              <select
                id="guests"
                className={inputClass}
                value={form.guests}
                onChange={(e) => update("guests", e.target.value)}
              >
                {/* No villa selected yet on this generic form, so bounded by
                    the largest resolved capacity across all villas rather
                    than a hardcoded number. */}
                {Array.from({ length: MAX_SITE_GUEST_CAPACITY }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      <div>
        <label htmlFor="message" className={labelClass}>Message</label>
        <textarea
          id="message"
          rows={4}
          className={inputClass}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder={
            form.inquiryType === "new"
              ? "Tell us about your trip — dates, group size, or anything else we should know."
              : "Tell us about your existing booking and how we can help."
          }
        />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
      </div>

      <label className="flex items-start gap-3 text-xs text-slate-500 leading-5">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => update("consent", e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-slate-900 shrink-0"
        />
        <span>
          I agree to be contacted by Ocean Villas at Turtle Bay by phone, text, or email regarding my inquiry. Message
          and data rates may apply.
        </span>
      </label>
      {errors.consent && <p className="text-xs text-red-600">{errors.consent}</p>}

      <button
        type="submit"
        className="w-full inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
      >
        Continue to Secure Form
      </button>
    </form>
  );
}
