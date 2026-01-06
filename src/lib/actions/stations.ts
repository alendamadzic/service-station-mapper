"use server";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ServiceStationFeatureCollection } from "@/types/service-station";

export async function getStationsAction(): Promise<ServiceStationFeatureCollection> {
  try {
    const filePath = join(
      process.cwd(),
      "src",
      "data",
      "service-stations.json",
    );
    const fileContents = await readFile(filePath, "utf8");
    const data = JSON.parse(fileContents) as ServiceStationFeatureCollection;
    return data;
  } catch (error) {
    console.error("Error loading service stations:", error);
    throw new Error("Failed to load service stations");
  }
}
