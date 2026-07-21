import zipcodes from "zipcodes";
import type { ZipInfo } from "@/lib/types";

export function normalizeZip(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 5);
  return digits.padStart(5, "0");
}

export function lookupZip(input: string): ZipInfo | null {
  const zip = normalizeZip(input);
  if (zip.length !== 5) return null;
  const row = zipcodes.lookup(zip);
  if (!row) return null;
  return {
    zip,
    city: row.city,
    state: row.state,
    latitude: row.latitude,
    longitude: row.longitude,
  };
}

export function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
