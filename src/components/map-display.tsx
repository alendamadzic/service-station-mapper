"use client";

import {
  MapClusterLayer,
  Map as MapComponent,
  MapControls,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerTooltip,
  useMap,
} from "@/components/ui/map";
import { MarkerPopup } from "@/components/ui/map";
import { cn } from "@/lib/utils";
import type { Location, ServiceStation } from "@/types/service-station";
import { useEffect } from "react";

interface MapDisplayProps {
  startLocation: Location | null;
  endLocation: Location | null;
  routeCoordinates: [number, number][] | null;
  allStations: ServiceStation[];
  filteredStations: ServiceStation[];
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

export function MapDisplay({
  startLocation,
  endLocation,
  routeCoordinates,
  allStations,
  filteredStations,
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
    <MapComponent
      center={[-2.0, 53.0]} // Center of UK
      zoom={6}
    >
      <MapControls showZoom showCompass position="bottom-right" />

      {routeCoordinates && routeCoordinates.length > 0 && (
        <>
          <MapFitBounds coordinates={routeCoordinates} />
          <MapRoute
            coordinates={routeCoordinates}
            color="#3b82f6"
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
              <div className="size-4 rounded-full border-2 border-foreground bg-primary shadow-lg" />
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
              <div className="size-4 rounded-full border-2 border-foreground bg-primary shadow-lg" />
            </div>
          </MarkerContent>
        </MapMarker>
      )}

      {allStations.map((station) => (
        <StationMarker
          key={station.properties.name}
          station={station}
          isOnRoute={filteredStations.some(
            (s) => s.properties.name === station.properties.name,
          )}
        />
      ))}
    </MapComponent>
  );
}

function StationMarker({
  station,
  isOnRoute = false,
}: { station: ServiceStation; isOnRoute: boolean }) {
  const styles = isOnRoute ? "size-4 bg-primary" : "size-2 bg-primary/60";

  return (
    <MapMarker
      longitude={station.geometry.coordinates[0]}
      latitude={station.geometry.coordinates[1]}
    >
      <MarkerContent>
        <div className={cn("rounded-full", styles)} />
      </MarkerContent>
      <MarkerTooltip>{station.properties.name}</MarkerTooltip>
    </MapMarker>
  );
}
