"use server";

import { getRoute } from "@/lib/services/routing";
import type { RouteData } from "@/types/service-station";

export async function getRouteAction(
  start: [number, number],
  end: [number, number],
): Promise<RouteData> {
  if (
    !start ||
    !end ||
    start.length !== 2 ||
    end.length !== 2 ||
    Number.isNaN(start[0]) ||
    Number.isNaN(start[1]) ||
    Number.isNaN(end[0]) ||
    Number.isNaN(end[1])
  ) {
    throw new Error("Valid start and end coordinates are required");
  }

  try {
    const route = await getRoute(start, end);
    return route;
  } catch (error) {
    console.error("Routing action error:", error);
    throw new Error("Failed to calculate route");
  }
}
