"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ServiceStationWithDistance } from "@/src/types/service-station";
import { ExternalLink } from "lucide-react";

interface ServiceStationListProps {
  stations: ServiceStationWithDistance[];
  isLoading?: boolean;
}

export function ServiceStationList({
  stations,
  isLoading = false,
}: ServiceStationListProps) {
  if (isLoading) {
    return (
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader>
          <CardTitle>Service Stations</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (stations.length === 0) {
    return (
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader>
          <CardTitle>Service Stations</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <p className="text-muted-foreground text-sm">
            No service stations found along the route. Plan a route to see
            service stations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1 flex flex-col min-h-0">
      <CardHeader>
        <CardTitle>Service Stations ({stations.length})</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-3 pr-4">
            {stations.map((station, index) => (
              <div
                key={`${station.properties.name}-${index}`}
                className="border border-border rounded-md p-3 hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm mb-1">
                      {station.properties.name}
                    </h3>
                    <p className="text-muted-foreground text-xs mb-2">
                      {station.properties.postcode}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {station.distanceFromRoute.toFixed(1)} miles from route
                    </p>
                  </div>
                  <a
                    href={station.properties.URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                    title="View details"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
