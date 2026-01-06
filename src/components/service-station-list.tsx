"use client";

import { DistanceBadge, DurationBadge } from "@/components/metric-badges";
import { ServiceStationItem } from "@/components/service-station-item";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import type { ServiceStationWithDistance } from "@/types/service-station";
import { FuelIcon } from "lucide-react";

interface ServiceStationListProps {
  stations: ServiceStationWithDistance[];
  routeDistance: number;
  routeDuration: number;
  isLoading?: boolean;
}

export function ServiceStationList({
  stations,
  routeDistance,
  routeDuration,
  isLoading = false,
}: ServiceStationListProps) {
  if (isLoading) {
    return <Spinner />;
  }

  if (stations.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FuelIcon />
          </EmptyMedia>
          <EmptyTitle>No Stations on this Route</EmptyTitle>
          <EmptyDescription>Try another route.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Card className="flex flex-1 flex-col min-h-0">
      <CardHeader>
        <CardTitle>
          Services on Route <Badge variant="outline">{stations.length}</Badge>
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2">
          <DistanceBadge distance={routeDistance} />
          <DurationBadge duration={routeDuration} />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-2">
            {stations.map((station, index) => (
              <ServiceStationItem
                key={`${station.properties.name}-${index}`}
                station={station}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
