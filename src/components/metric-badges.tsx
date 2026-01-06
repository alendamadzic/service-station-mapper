import { Badge } from "@/components/ui/badge";
import { CarIcon, ClockIcon } from "lucide-react";

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

export function DistanceBadge({ distance }: { distance: number }) {
  return (
    <Badge>
      <CarIcon />
      {formatDistance(distance)}
    </Badge>
  );
}

export function DurationBadge({ duration }: { duration: number }) {
  return (
    <Badge>
      <ClockIcon />
      {formatDuration(duration)}
    </Badge>
  );
}
