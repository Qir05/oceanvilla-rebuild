import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://oceanvillasturtlebay.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ocean Villas at Turtle Bay | Luxury Vacation Rentals on Oahu’s North Shore",
    template: "%s | Ocean Villas at Turtle Bay",
  },
  description:
    "Discover luxury vacation rentals at Turtle Bay on Oahu’s North Shore. Browse featured villas, check availability, and book direct.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Ocean Villas at Turtle Bay | Luxury Vacation Rentals on Oahu’s North Shore",
    description:
      "Browse premium Turtle Bay villas, explore amenities, check availability, and book direct from Ocean Villas at Turtle Bay.",
    url: siteUrl,
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
    title: "Ocean Villas at Turtle Bay | Luxury Vacation Rentals on Oahu’s North Shore",
    description:
      "Luxury Turtle Bay vacation rentals with direct booking and live availability.",
    images: ["/brand/TTB-Logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}

        <Script
          src="https://widgets.leadconnectorhq.com/loader.js"
          data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
          data-widget-id="69ba6ac68c5d7321dbb777ee"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
