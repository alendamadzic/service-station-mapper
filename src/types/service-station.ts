export interface ServiceStationProperties {
  name: string;
  postcode: string;
  URL: string;
}

export interface ServiceStation {
  type: "Feature";
  properties: ServiceStationProperties;
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface ServiceStationFeatureCollection {
  type: "FeatureCollection";
  features: ServiceStation[];
}

export type Location = {
  longitude: number;
  latitude: number;
};

export interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

export interface OSRMRouteResponse {
  code: string;
  routes: Array<{
    distance: number; // in meters
    duration: number; // in seconds
    geometry:
      | string
      | {
          type: "LineString";
          coordinates: [number, number][];
        }; // encoded polyline string or GeoJSON LineString
  }>;
  waypoints: Array<{
    location: [number, number]; // [longitude, latitude]
  }>;
}

export interface RouteData {
  coordinates: [number, number][];
  distance: number; // in meters
  duration: number; // in seconds
}

export interface ServiceStationWithDistance extends ServiceStation {
  distanceFromRoute: number; // in miles
}
