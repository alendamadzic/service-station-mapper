"use client";

import {
  MapClusterLayer,
  Map as MapComponent,
  MapControls,
  MapMarker,
  MapRoute,
  MarkerContent,
  useMap,
} from "@/components/ui/map";
import type { Location, ServiceStation } from "@/types/service-station";
import type MapLibreGL from "maplibre-gl";
import { useEffect } from "react";

interface MapDisplayProps {
  startLocation: Location | null;
  endLocation: Location | null;
  routeCoordinates: [number, number][] | null;
  allStations: ServiceStation[];
  filteredStations: ServiceStation[];
  onMapClick?: (location: Location) => void;
  selectingLocation?: "start" | "end" | null;
}

function MapFitBounds({
  coordinates,
}: {
  coordinates: [number, number][];
}) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!isLoaded || !map || coordinates.length < 2) return;

    // Create bounds from coordinates
    let minLng = coordinates[0][0];
    let maxLng = coordinates[0][0];
    let minLat = coordinates[0][1];
    let maxLat = coordinates[0][1];

    for (const coord of coordinates) {
      minLng = Math.min(minLng, coord[0]);
      maxLng = Math.max(maxLng, coord[0]);
      minLat = Math.min(minLat, coord[1]);
      maxLat = Math.max(maxLat, coord[1]);
    }

    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        duration: 1000,
      },
    );
  }, [map, isLoaded, coordinates]);

  return null;
}

function MapClickHandler({
  onMapClick,
  selectingLocation,
}: {
  onMapClick?: (location: Location) => void;
  selectingLocation?: "start" | "end" | null;
}) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!isLoaded || !map || !onMapClick || !selectingLocation) return;

    const handleClick = (e: MapLibreGL.MapMouseEvent) => {
      onMapClick({
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
      });
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [map, isLoaded, onMapClick, selectingLocation]);

  return null;
}

export function MapDisplay({
  startLocation,
  endLocation,
  routeCoordinates,
  allStations,
  filteredStations,
  onMapClick,
  selectingLocation,
}: MapDisplayProps) {
  // Create GeoJSON for filtered stations
  const filteredStationsGeoJSON: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: "FeatureCollection",
    features: filteredStations.map((station) => ({
      type: "Feature",
      properties: station.properties,
      geometry: station.geometry,
    })),
  };

  // Create GeoJSON for all stations (non-filtered)
  const allStationsGeoJSON: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: "FeatureCollection",
    features: allStations
      .filter(
        (station) =>
          !filteredStations.some(
            (fs) => fs.properties.name === station.properties.name,
          ),
      )
      .map((station) => ({
        type: "Feature",
        properties: station.properties,
        geometry: station.geometry,
      })),
  };

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <MapComponent
        center={[-2.0, 53.0]} // Center of UK
        zoom={6}
      >
        <MapClickHandler
          onMapClick={onMapClick}
          selectingLocation={selectingLocation}
        />
        <MapControls showZoom position="bottom-right" />

        {routeCoordinates && routeCoordinates.length > 0 && (
          <>
            <MapFitBounds coordinates={routeCoordinates} />
            <MapRoute
              coordinates={routeCoordinates}
              color="#4285F4"
              width={4}
              opacity={0.8}
            />
          </>
        )}

        {startLocation && (
          <MapMarker
            longitude={startLocation.longitude}
            latitude={startLocation.latitude}
          >
            <MarkerContent>
              <div className="relative">
                <div className="size-4 rounded-full border-2 border-white bg-green-500 shadow-lg" />
              </div>
            </MarkerContent>
          </MapMarker>
        )}

        {endLocation && (
          <MapMarker
            longitude={endLocation.longitude}
            latitude={endLocation.latitude}
          >
            <MarkerContent>
              <div className="relative">
                <div className="size-4 rounded-full border-2 border-white bg-red-500 shadow-lg" />
              </div>
            </MarkerContent>
          </MapMarker>
        )}

        {filteredStations.length > 0 && (
          <MapClusterLayer
            data={filteredStationsGeoJSON}
            pointColor="#f97316"
            clusterColors={["#fb923c", "#f97316", "#ea580c"]}
          />
        )}

        {allStationsGeoJSON.features.length > 0 && (
          <MapClusterLayer
            data={allStationsGeoJSON}
            pointColor="#3b82f6"
            clusterColors={["#60a5fa", "#3b82f6", "#2563eb"]}
          />
        )}

        {selectingLocation && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-background border border-border rounded-md px-4 py-2 shadow-md text-sm">
            Click on the map to set{" "}
            {selectingLocation === "start" ? "start" : "end"} location
          </div>
        )}
      </MapComponent>
    </div>
  );
}
