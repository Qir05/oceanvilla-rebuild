/**
 * lib/villa-display.ts
 *
 * Shared display helpers (curated title overrides, preferred hero image
 * index) consumed by both the server-rendered /listing/[id] page and the
 * /rentals collection, so these editorial choices are set in exactly one
 * place instead of being copy-pasted per route.
 */

// Canonical customer-facing name for every villa: [marketing identity]
// (villa/unit identity). Keeping the villa number inside the name itself is
// what makes "The Penthouse Villa (Villa 318)" unambiguously the same entity
// as the "Villa 318" identifier used in compliance/occupancy data and
// llms.txt, without needing a separate equivalence mapping anywhere.
export const LISTING_DISPLAY_NAMES: Record<string, string> = {
  "489089": "Presidential Suite (Villa 218)",
  "489092": "Honeymoon Suite (Villa 120)",
  "489093": "Ohana Villa (Villa 111)",
  "489094": "The Model Villa (Villa 119)",
  "489095": "The Penthouse Villa (Villa 318)",
  "489097": "2 Villas in 1 (Villas 119 + 120)",
  "505671": "The View Villa (Villa 304)",
};

export const HERO_IMAGE_OVERRIDES: Record<string, number> = {
  "505671": 1,
};

export function getDisplayName(id: string, rawName: string): string {
  if (LISTING_DISPLAY_NAMES[id]) return LISTING_DISPLAY_NAMES[id];
  return rawName || `Villa ${id}`;
}

export function getPreferredHero(id: string, heroUrl: string | null | undefined, images?: string[]): string {
  const overrideIdx = HERO_IMAGE_OVERRIDES[id];
  if (overrideIdx !== undefined && images && images.length > overrideIdx) {
    return images[overrideIdx];
  }
  return heroUrl || images?.[0] || "";
}

export function reorderImages(listingId: string, images: string[]): string[] {
  const preferredIdx = HERO_IMAGE_OVERRIDES[listingId];
  if (preferredIdx === undefined || preferredIdx === 0 || images.length <= preferredIdx) {
    return images;
  }
  const reordered = [...images];
  const [preferred] = reordered.splice(preferredIdx, 1);
  return [preferred, ...reordered];
}
