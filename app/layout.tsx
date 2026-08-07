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
    default: "Ocean Villas at Turtle Bay — Luxury Beachfront Villas, North Shore Oahu",
    template: "%s | Ocean Villas at Turtle Bay",
  },
  description:
    "Luxury beachfront villas at Turtle Bay on Oahu’s North Shore — ideal for family vacations, milestone celebrations, and island getaways. Book direct for live availability and transparent pricing — no platform fees. 7 curated private villa rentals.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Ocean Villas at Turtle Bay — Luxury Beachfront Villas, North Shore Oahu",
    description:
      "Stay in a private luxury beachfront villa at Turtle Bay, Oahu’s North Shore. Browse 7 curated villas, check live availability, and book direct — no platform fees.",
    url: siteUrl,
    siteName: "Ocean Villas at Turtle Bay",
    type: "website",
    images: [
      {
        url: "/brand/TTB-Logo.png",
        width: 1200,
        height: 630,
        alt: "Ocean Villas at Turtle Bay — Luxury North Shore Oahu Vacation Rentals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ocean Villas at Turtle Bay — Luxury Beachfront Villas, North Shore Oahu",
    description:
      "Private luxury beachfront villas at Turtle Bay, North Shore Oahu. Book direct with live availability — no platform markups.",
    images: ["/brand/TTB-Logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* GTM noscript fallback — must be first child of body */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}

        {children}

        {/* Google Tag Manager */}
        {GTM_ID && (
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
        )}

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
