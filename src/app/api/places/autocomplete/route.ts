import { NextResponse } from "next/server";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_API_BASE = "https://places.googleapis.com/v1";

export interface AutocompletePrediction {
  placeId: string;
  text: string;
  mainText: string;
  secondaryText: string;
  types: string[];
}

export async function GET(request: Request) {
  if (!GOOGLE_PLACES_API_KEY) {
    return NextResponse.json(
      { error: "Google Places API not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input");

  if (!input || input.length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  try {
    const response = await fetch(`${PLACES_API_BASE}/places:autocomplete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      },
      body: JSON.stringify({
        input,
        includedPrimaryTypes: ["locality", "sublocality", "postal_code", "neighborhood"],
        includedRegionCodes: ["AU"],
        locationBias: {
          rectangle: {
            low: { latitude: -39.2, longitude: 140.9 },
            high: { latitude: -33.9, longitude: 150.0 },
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Places Autocomplete API error:", error);
      return NextResponse.json({ predictions: [] });
    }

    const data = await response.json();

    // Transform to our format
    const predictions: AutocompletePrediction[] = (data.suggestions || [])
      .filter((s: { placePrediction?: unknown }) => s.placePrediction)
      .map((s: {
        placePrediction: {
          placeId: string;
          text: { text: string };
          structuredFormat: {
            mainText: { text: string };
            secondaryText?: { text: string }
          };
          types: string[];
        }
      }) => ({
        placeId: s.placePrediction.placeId,
        text: s.placePrediction.text.text,
        mainText: s.placePrediction.structuredFormat.mainText.text,
        secondaryText: s.placePrediction.structuredFormat.secondaryText?.text || "",
        types: s.placePrediction.types || [],
      }));

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error("Places Autocomplete error:", error);
    return NextResponse.json({ predictions: [] });
  }
}
