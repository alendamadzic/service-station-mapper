"use client";

import { LocationInput } from "@/components/location-input";
import { MapDisplay } from "@/components/map-display";
import { ServiceStationList } from "@/components/service-station-list";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { getRouteAction } from "@/lib/actions/route";
import { getStationsAction } from "@/lib/actions/stations";
import { filterServiceStationsAlongRoute } from "@/lib/route-utils";
import type {
  Location,
  RouteData,
  ServiceStation,
  ServiceStationWithDistance,
} from "@/types/service-station";
import { Fuel, RouteIcon } from "lucide-react";
import Link from "next/link";
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

  // Load service stations data
  useEffect(() => {
    async function loadStations() {
      setIsLoadingStations(true);
      try {
        const data = await getStationsAction();
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
      const routeData = await getRouteAction(
        [startLocation.longitude, startLocation.latitude],
        [endLocation.longitude, endLocation.latitude],
      );
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

  return (
    <>
      <Sidebar variant="inset" className="min-w-md">
        <SidebarHeader className="mb-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="#">
                  <div className="bg-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-sm">
                    <Fuel className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="font-semibold">
                      Service Station Mapper
                    </span>
                    <span className="truncate text-muted-foreground text-xs">
                      Plan your journey and find service stations along your
                      route
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="p-4 space-y-4">
          <FieldGroup>
            <LocationInput
              label="Start"
              value={startLocation}
              onChange={setStartLocation}
            />
            <LocationInput
              label="Destination"
              value={endLocation}
              onChange={setEndLocation}
            />
            <Button
              onClick={handleCalculateRoute}
              disabled={!startLocation || !endLocation || isLoadingRoute}
              className="w-full"
            >
              {isLoadingRoute ? (
                <Spinner />
              ) : (
                <>
                  <RouteIcon /> Route
                </>
              )}
            </Button>
          </FieldGroup>

          {route && (
            <ServiceStationList
              stations={filteredStations}
              routeDistance={route.distance}
              routeDuration={route.duration}
              isLoading={isLoadingRoute || isLoadingStations}
            />
          )}
        </SidebarContent>
        <SidebarFooter className="flex flex-row items-center justify-between">
          <Link href="https://alen.world">
            <Button variant="link">@alendamadzic</Button>
          </Link>
          <ModeToggle />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <MapDisplay
          startLocation={startLocation}
          endLocation={endLocation}
          routeCoordinates={route?.coordinates || null}
          allStations={allStations}
          filteredStations={filteredStations}
        />
      </SidebarInset>
    </>
  );
}
