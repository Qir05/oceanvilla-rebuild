// app/sitemap.ts
import type { MetadataRoute } from "next";
import { OCEAN_VILLA_LISTING_IDS } from "@/lib/ocean-villas";

const siteUrl = "https://oceanvillasturtlebay.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    // 🔧 VERIFY: listing lastModified below uses build/request time like
    // every other entry in this file, not a real per-listing edit
    // timestamp — Hostaway's listing payload may expose an `updatedOn`
    // field that would make this an accurate freshness signal instead.
    ...OCEAN_VILLA_LISTING_IDS.map((id) => ({
      url: `${siteUrl}/listing/${id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/rentals`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/availability`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/location`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/amenities`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
