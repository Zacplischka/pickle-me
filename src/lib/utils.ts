import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Calculate distance between two coordinates using the Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistance(from: LatLng, to: LatLng): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

/**
 * Escape special PostgREST filter characters so user input
 * can be safely used inside .or() / .filter() strings.
 */
export function sanitizePostgrestValue(input: string): string {
  // Remove characters that are PostgREST operators/delimiters
  return input.replace(/[,.()*\\]/g, "");
}

/** Convert a suburb/region name to a URL slug */
export function toSlug(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/** Find the original name from a slug given a list of known names */
export function fromSlug(slug: string, knownNames: string[]): string | undefined {
  return knownNames.find(name => toSlug(name) === slug);
}

export function formatDate(
  dateString: string,
  options?: { includeTime?: boolean }
): string {
  const date = new Date(dateString);
  const base: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  };
  if (options?.includeTime) {
    base.hour = "2-digit";
    base.minute = "2-digit";
  }
  return date.toLocaleDateString("en-AU", base);
}
