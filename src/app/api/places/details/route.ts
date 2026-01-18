import { NextResponse } from "next/server";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_API_BASE = "https://places.googleapis.com/v1";

export interface PlaceLocation {
  placeId: string;
  name: string;
  lat: number;
  lng: number;
}

export async function GET(request: Request) {
  if (!GOOGLE_PLACES_API_KEY) {
    return NextResponse.json(
      { error: "Google Places API not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json(
      { error: "placeId is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${PLACES_API_BASE}/places/${placeId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": "id,displayName,location",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Places Details API error:", error);
      return NextResponse.json(
        { error: "Failed to fetch place details" },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!data.location) {
      return NextResponse.json(
        { error: "Place location not found" },
        { status: 404 }
      );
    }

    const place: PlaceLocation = {
      placeId: data.id,
      name: data.displayName?.text || "",
      lat: data.location.latitude,
      lng: data.location.longitude,
    };

    return NextResponse.json({ place });
  } catch (error) {
    console.error("Places Details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch place details" },
      { status: 500 }
    );
  }
}
