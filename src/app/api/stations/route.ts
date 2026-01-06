import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ServiceStationFeatureCollection } from "@/types/service-station";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const filePath = join(
      process.cwd(),
      "src",
      "data",
      "service-stations.json",
    );
    const fileContents = await readFile(filePath, "utf8");
    const data = JSON.parse(fileContents) as ServiceStationFeatureCollection;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error loading service stations:", error);
    return NextResponse.json(
      { error: "Failed to load service stations" },
      { status: 500 },
    );
  }
}
