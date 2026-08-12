// components/TrackedLink.tsx
//
// Thin client-boundary wrapper around next/link so Server Component pages
// (e.g. app/amenities/page.tsx) can attach click tracking to a CTA without
// converting the whole page to a Client Component — Next.js does not allow
// an inline event-handler function to be authored directly in a Server
// Component's JSX, even when passed to a Client Component like <Link>.
"use client";

import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

type TrackedLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    event: AnalyticsEvent | string;
    eventParams?: Record<string, string | number | boolean>;
    children: ReactNode;
  };

export default function TrackedLink({ event, eventParams, children, ...linkProps }: TrackedLinkProps) {
  return (
    <Link {...linkProps} onClick={() => trackEvent(event, eventParams)}>
      {children}
    </Link>
  );
}
