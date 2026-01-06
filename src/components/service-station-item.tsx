import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import type { ServiceStationWithDistance } from "@/types/service-station";
import { ExternalLinkIcon, FuelIcon } from "lucide-react";
import Link from "next/link";

export function ServiceStationItem({
  station,
}: { station: ServiceStationWithDistance }) {
  return (
    <Item variant="outline" asChild>
      <Link
        href={station.properties.URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ItemMedia variant="icon">
          <FuelIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{station.properties.name}</ItemTitle>
          <ItemDescription>
            {station.distanceFromRoute.toFixed(1)} miles from route
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <ExternalLinkIcon className="size-4" />
        </ItemActions>
      </Link>
    </Item>
  );
}
