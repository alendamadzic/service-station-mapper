"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RouteData } from "@/types/service-station";
import { X } from "lucide-react";

interface RouteSummaryProps {
  route: RouteData | null;
  stationCount: number;
  onClear: () => void;
}

function formatDistance(meters: number): string {
  const miles = meters / 1609.34;
  if (miles < 1) {
    return `${Math.round(meters)} m`;
  }
  return `${miles.toFixed(1)} miles`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function RouteSummary({
  route,
  stationCount,
  onClear,
}: RouteSummaryProps) {
  if (!route) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Route Summary</CardTitle>
          <Button variant="ghost" size="icon-xs" onClick={onClear}>
            <X className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Distance:</span>
            <span className="font-medium">
              {formatDistance(route.distance)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimated time:</span>
            <span className="font-medium">
              {formatDuration(route.duration)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service stations:</span>
            <span className="font-medium">{stationCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
