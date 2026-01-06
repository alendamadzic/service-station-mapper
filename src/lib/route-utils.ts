import type {
  Location,
  ServiceStation,
  ServiceStationWithDistance,
} from "@/types/service-station";

const EARTH_RADIUS_MILES = 3959; // Earth's radius in miles

/**
 * Calculate the distance between two points using the Haversine formula
 * @returns Distance in miles
 */
export function calculateDistance(point1: Location, point2: Location): number {
  const lat1Rad = (point1.latitude * Math.PI) / 180;
  const lat2Rad = (point2.latitude * Math.PI) / 180;
  const deltaLatRad = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const deltaLonRad = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLonRad / 2) *
      Math.sin(deltaLonRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MILES * c;
}

/**
 * Calculate the perpendicular distance from a point to a line segment
 * Uses a sampling approach for reliability: samples points along the segment
 * and finds the minimum distance
 * @returns Distance in miles
 */
export function getPointToLineDistance(
  point: Location,
  lineStart: Location,
  lineEnd: Location,
): number {
  const segmentLength = calculateDistance(lineStart, lineEnd);

  // If segment is very short, return distance to closest endpoint
  if (segmentLength < 0.01) {
    const distToStart = calculateDistance(point, lineStart);
    const distToEnd = calculateDistance(point, lineEnd);
    return Math.min(distToStart, distToEnd);
  }

  // Sample points along the segment to find minimum distance
  // For longer segments, sample more points
  const numSamples = Math.max(10, Math.ceil(segmentLength * 2));
  let minDistance = Number.POSITIVE_INFINITY;

  for (let i = 0; i <= numSamples; i++) {
    const t = i / numSamples;
    const sampledPoint = interpolatePoint(lineStart, lineEnd, t);
    const distance = calculateDistance(point, sampledPoint);
    minDistance = Math.min(minDistance, distance);
  }

  return minDistance;
}

/**
 * Interpolate a point along a line segment on a sphere
 * @param start Start point
 * @param end End point
 * @param t Interpolation parameter (0 = start, 1 = end)
 * @returns Interpolated point
 */
function interpolatePoint(start: Location, end: Location, t: number): Location {
  // Clamp t to [0, 1]
  const clampedT = Math.max(0, Math.min(1, t));

  // Convert to radians
  const lat1 = (start.latitude * Math.PI) / 180;
  const lon1 = (start.longitude * Math.PI) / 180;
  const lat2 = (end.latitude * Math.PI) / 180;
  const lon2 = (end.longitude * Math.PI) / 180;

  // Calculate angular distance
  const d = Math.acos(
    Math.sin(lat1) * Math.sin(lat2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1),
  );

  // If points are very close, just interpolate linearly
  if (d < 0.0001) {
    return {
      latitude: start.latitude + (end.latitude - start.latitude) * clampedT,
      longitude: start.longitude + (end.longitude - start.longitude) * clampedT,
    };
  }

  // Spherical interpolation
  const a = Math.sin((1 - clampedT) * d) / Math.sin(d);
  const b = Math.sin(clampedT * d) / Math.sin(d);

  const x =
    a * Math.cos(lat1) * Math.cos(lon1) + b * Math.cos(lat2) * Math.cos(lon2);
  const y =
    a * Math.cos(lat1) * Math.sin(lon1) + b * Math.cos(lat2) * Math.sin(lon2);
  const z = a * Math.sin(lat1) + b * Math.sin(lat2);

  const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
  const lon = Math.atan2(y, x);

  return {
    latitude: (lat * 180) / Math.PI,
    longitude: (lon * 180) / Math.PI,
  };
}

/**
 * Filter service stations that are within the specified distance of the route
 * @param stations Array of service stations
 * @param routeCoordinates Array of [longitude, latitude] coordinates defining the route
 * @param maxDistanceMiles Maximum distance from route in miles (default: 5)
 * @returns Array of service stations with distance from route
 */
export function filterServiceStationsAlongRoute(
  stations: ServiceStation[],
  routeCoordinates: [number, number][],
  maxDistanceMiles = 5,
): ServiceStationWithDistance[] {
  if (routeCoordinates.length < 2) {
    return [];
  }

  const filtered: ServiceStationWithDistance[] = [];

  for (const station of stations) {
    const [lon, lat] = station.geometry.coordinates;
    const stationLocation: Location = { longitude: lon, latitude: lat };

    let minDistance = Number.POSITIVE_INFINITY;

    // Check distance to each segment of the route
    // Early exit if we find a distance within threshold
    for (let i = 0; i < routeCoordinates.length - 1; i++) {
      const segmentStart: Location = {
        longitude: routeCoordinates[i][0],
        latitude: routeCoordinates[i][1],
      };
      const segmentEnd: Location = {
        longitude: routeCoordinates[i + 1][0],
        latitude: routeCoordinates[i + 1][1],
      };

      const distance = getPointToLineDistance(
        stationLocation,
        segmentStart,
        segmentEnd,
      );

      minDistance = Math.min(minDistance, distance);

      // Early exit if we're already within threshold
      if (minDistance <= maxDistanceMiles) {
        break;
      }
    }

    if (minDistance <= maxDistanceMiles) {
      filtered.push({
        ...station,
        distanceFromRoute: minDistance,
      });
    }
  }

  // Sort by distance from route start
  const routeStart: Location = {
    longitude: routeCoordinates[0][0],
    latitude: routeCoordinates[0][1],
  };

  filtered.sort((a, b) => {
    const distA = calculateDistance(routeStart, {
      longitude: a.geometry.coordinates[0],
      latitude: a.geometry.coordinates[1],
    });
    const distB = calculateDistance(routeStart, {
      longitude: b.geometry.coordinates[0],
      latitude: b.geometry.coordinates[1],
    });
    return distA - distB;
  });

  return filtered;
}
