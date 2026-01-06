import type { GeocodingResult } from "@/types/service-station";

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";

export interface GeocodeOptions {
  q: string;
  format?: "json";
  limit?: number;
  countrycodes?: string;
}

export async function geocodeAddress(
  query: string,
  options?: { limit?: number; countrycodes?: string },
): Promise<GeocodingResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: String(options?.limit ?? 5),
    addressdetails: "1",
    ...(options?.countrycodes && { countrycodes: options.countrycodes }),
  });

  const url = `${NOMINATIM_BASE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Service Station Mapper",
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data as GeocodingResult[];
  } catch (error) {
    console.error("Geocoding error:", error);
    throw new Error("Failed to geocode address");
  }
}
