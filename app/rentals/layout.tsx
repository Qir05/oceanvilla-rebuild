import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Turtle Bay Villa Rentals — North Shore Oahu | Ocean Villas",
  },
  description:
    "Browse 7 luxury private villa rentals at Turtle Bay on Oahu's North Shore. Live rates, real availability, and direct booking — no platform markups. Book direct and save.",
  alternates: { canonical: "/rentals" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Turtle Bay Villa Rentals — North Shore Oahu | Ocean Villas",
    description:
      "7 luxury private villas at Turtle Bay, North Shore Oahu. Live availability, transparent pricing, and direct booking — no Airbnb or VRBO fees.",
    type: "website",
  },
};

export default function RentalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
