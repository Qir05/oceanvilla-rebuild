// components/AmenityDisclaimer.tsx
import { AMENITIES_DISCLAIMER } from "@/lib/amenities-data";

export default function AmenityDisclaimer() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-3">
      <svg
        className="h-5 w-5 shrink-0 text-amber-500 mt-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-8.25 3h.008v.008h-.008V15z"
        />
      </svg>
      <p className="text-sm leading-relaxed text-amber-900">{AMENITIES_DISCLAIMER}</p>
    </div>
  );
}
