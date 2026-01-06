import type { RouteData } from "@/src/types/service-station";

interface OSRMRouteResponse {
  code: string;
  routes: Array<{
    distance: number;
    duration: number;
    geometry:
      | string
      | {
          type: "LineString";
          coordinates: [number, number][];
        };
  }>;
  waypoints: Array<{
    location: [number, number];
  }>;
}

const OSRM_BASE_URL = "https://router.project-osrm.org/route/v1/driving";

export interface RouteOptions {
  coordinates: Array<[number, number]>; // [longitude, latitude]
  alternatives?: boolean;
  steps?: boolean;
  geometries?: "polyline" | "geojson";
  overview?: "full" | "simplified" | "false";
}

export async function getRoute(
  start: [number, number],
  end: [number, number],
): Promise<RouteData> {
  const coordinates = `${start[0]},${start[1]};${end[0]},${end[1]}`;
  const url = `${OSRM_BASE_URL}/${coordinates}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Service Station Mapper",
      },
    });

    if (!response.ok) {
      throw new Error(`Routing failed: ${response.statusText}`);
    }

    const data = (await response.json()) as OSRMRouteResponse;

    if (data.code !== "Ok" || !data.routes.length) {
      throw new Error("No route found");
    }

    const route = data.routes[0];
    const geometry = route.geometry;

    // OSRM with geometries=geojson returns geometry as GeoJSON LineString
    let coordinates: [number, number][] = [];

    if (typeof geometry === "string") {
      // Polyline encoded - decode it (fallback if geojson not available)
      coordinates = decodePolyline(geometry);
    } else if (geometry && typeof geometry === "object") {
      // GeoJSON format - geometry is an object with coordinates array
      const geoJsonGeometry = geometry as {
        type: string;
        coordinates: [number, number][];
      };
      if (
        geoJsonGeometry.type === "LineString" &&
        Array.isArray(geoJsonGeometry.coordinates)
      ) {
        coordinates = geoJsonGeometry.coordinates;
      } else {
        throw new Error("Invalid GeoJSON geometry format");
      }
    } else {
      throw new Error("Invalid route geometry format");
    }

    return {
      coordinates,
      distance: route.distance,
      duration: route.duration,
    };
  } catch (error) {
    console.error("Routing error:", error);
    throw new Error("Failed to calculate route");
  }
}

// Polyline decoding function (simplified - OSRM uses a specific encoding)
function decodePolyline(encoded: string): [number, number][] {
  const coordinates: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let shift = 0;
    let result = 0;
    let byte: number;

    // Decode latitude
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    // Decode longitude
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push([lng / 1e5, lat / 1e5]);
  }

  return coordinates;
}
