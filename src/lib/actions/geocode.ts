"use server";

import { geocodeAddress } from "@/lib/services/geocoding";
import type { GeocodingResult } from "@/types/service-station";

export interface GeocodeActionOptions {
  limit?: number;
  countrycodes?: string;
}

export async function geocodeAction(
  query: string,
  options?: GeocodeActionOptions,
): Promise<GeocodingResult[]> {
  if (!query || !query.trim()) {
    throw new Error("Query parameter is required");
  }

  try {
    const results = await geocodeAddress(query, {
      limit: options?.limit,
      countrycodes: options?.countrycodes,
    });
    return results;
  } catch (error) {
    console.error("Geocoding action error:", error);
    throw new Error("Failed to geocode address");
  }
}
