"use client";

import { Button } from "@/components/ui/button";
import { filterServiceStationsAlongRoute } from "@/lib/route-utils";
import { LocationInput } from "@/src/components/location-input";
import { MapDisplay } from "@/src/components/map-display";
import { RouteSummary } from "@/src/components/route-summary";
import { ServiceStationList } from "@/src/components/service-station-list";
import type {
  Location,
  RouteData,
  ServiceStation,
  ServiceStationFeatureCollection,
  ServiceStationWithDistance,
} from "@/src/types/service-station";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [allStations, setAllStations] = useState<ServiceStation[]>([]);
  const [filteredStations, setFilteredStations] = useState<
    ServiceStationWithDistance[]
  >([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [selectingLocation, setSelectingLocation] = useState<
    "start" | "end" | null
  >(null);

  // Load service stations data
  useEffect(() => {
    async function loadStations() {
      setIsLoadingStations(true);
      try {
        const response = await fetch("/api/stations");
        if (!response.ok) throw new Error("Failed to load stations");
        const data = (await response.json()) as ServiceStationFeatureCollection;
        setAllStations(data.features);
      } catch (error) {
        console.error("Error loading stations:", error);
        toast.error("Failed to load service stations");
      } finally {
        setIsLoadingStations(false);
      }
    }
    loadStations();
  }, []);

  // Clear route when locations change
  useEffect(() => {
    if (!startLocation || !endLocation) {
      setRoute(null);
      setFilteredStations([]);
    }
  }, [startLocation, endLocation]);

  // Calculate route handler
  const handleCalculateRoute = useCallback(async () => {
    if (!startLocation || !endLocation) {
      toast.error("Please set both start and end locations");
      return;
    }

    setIsLoadingRoute(true);
    try {
      const response = await fetch(
        `/api/route?startLon=${startLocation.longitude}&startLat=${startLocation.latitude}&endLon=${endLocation.longitude}&endLat=${endLocation.latitude}`,
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to calculate route");
      }

      const routeData = (await response.json()) as RouteData;
      setRoute(routeData);

      // Filter service stations along the route
      const filtered = filterServiceStationsAlongRoute(
        allStations,
        routeData.coordinates,
        5, // 5 miles
      );
      setFilteredStations(filtered);

      toast.success(`Found ${filtered.length} service stations along route`);
    } catch (error) {
      console.error("Route calculation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to calculate route",
      );
      setRoute(null);
      setFilteredStations([]);
    } finally {
      setIsLoadingRoute(false);
    }
  }, [startLocation, endLocation, allStations]);

  const handleMapClick = useCallback(
    (location: Location) => {
      if (selectingLocation === "start") {
        setStartLocation(location);
        setSelectingLocation(null);
        toast.success("Start location set");
      } else if (selectingLocation === "end") {
        setEndLocation(location);
        setSelectingLocation(null);
        toast.success("End location set");
      }
    },
    [selectingLocation],
  );

  const handleClearRoute = useCallback(() => {
    setStartLocation(null);
    setEndLocation(null);
    setRoute(null);
    setFilteredStations([]);
    setSelectingLocation(null);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="border-b border-border px-6 py-4 flex-shrink-0">
        <h1 className="text-2xl font-bold">Service Station Mapper</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Plan your journey and find service stations along your route
        </p>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 min-h-0 overflow-hidden">
        <div className="lg:w-1/3 flex flex-col gap-4 min-h-0 overflow-hidden">
          <div className="space-y-4">
            <LocationInput
              label="Start Location"
              value={startLocation}
              onChange={setStartLocation}
              onSelectFromMap={() => setSelectingLocation("start")}
              placeholder="Enter start address or postcode"
            />
            <LocationInput
              label="End Location"
              value={endLocation}
              onChange={setEndLocation}
              onSelectFromMap={() => setSelectingLocation("end")}
              placeholder="Enter end address or postcode"
            />
            {selectingLocation && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setSelectingLocation(null)}
                >
                  Cancel
                </Button>
              </div>
            )}
            <Button
              onClick={handleCalculateRoute}
              disabled={!startLocation || !endLocation || isLoadingRoute}
              className="w-full"
            >
              {isLoadingRoute ? "Calculating..." : "Route"}
            </Button>
          </div>

          {route && (
            <RouteSummary
              route={route}
              stationCount={filteredStations.length}
              onClear={handleClearRoute}
            />
          )}

          <ServiceStationList
            stations={filteredStations}
            isLoading={isLoadingRoute || isLoadingStations}
          />
        </div>

        <div className="lg:flex-1">
          <MapDisplay
            startLocation={startLocation}
            endLocation={endLocation}
            routeCoordinates={route?.coordinates || null}
            allStations={allStations}
            filteredStations={filteredStations}
            onMapClick={handleMapClick}
            selectingLocation={selectingLocation}
          />
        </div>
      </main>
    </div>
  );
}
