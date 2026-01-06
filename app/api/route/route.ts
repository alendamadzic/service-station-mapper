import { getRoute } from "@/lib/services/routing";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startLon = searchParams.get("startLon");
  const startLat = searchParams.get("startLat");
  const endLon = searchParams.get("endLon");
  const endLat = searchParams.get("endLat");

  if (!startLon || !startLat || !endLon || !endLat) {
    return NextResponse.json(
      {
        error:
          "Query parameters 'startLon', 'startLat', 'endLon', and 'endLat' are required",
      },
      { status: 400 },
    );
  }

  try {
    const start: [number, number] = [
      Number.parseFloat(startLon),
      Number.parseFloat(startLat),
    ];
    const end: [number, number] = [
      Number.parseFloat(endLon),
      Number.parseFloat(endLat),
    ];

    if (
      Number.isNaN(start[0]) ||
      Number.isNaN(start[1]) ||
      Number.isNaN(end[0]) ||
      Number.isNaN(end[1])
    ) {
      return NextResponse.json(
        { error: "Invalid coordinate values" },
        { status: 400 },
      );
    }

    const route = await getRoute(start, end);
    return NextResponse.json(route);
  } catch (error) {
    console.error("Routing API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate route" },
      { status: 500 },
    );
  }
}
