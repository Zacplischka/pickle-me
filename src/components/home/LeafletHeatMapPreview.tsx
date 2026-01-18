"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { useRouter } from "next/navigation";
import { Court } from "@/lib/supabase/database.types";
import { getSuburbForCoordinate } from "@/lib/suburbs";

interface LeafletHeatMapPreviewProps {
  courts: Court[];
  className?: string;
}

// Heat layer component
function HeatLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    // Create heat layer
    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 12,
      max: 1.0,
      gradient: {
        0.2: "#3b82f6", // blue
        0.4: "#22c55e", // green
        0.6: "#eab308", // yellow
        0.8: "#f97316", // orange
        1.0: "#ef4444", // red
      },
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}

// Click handler component
function ClickHandler() {
  const router = useRouter();

  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      const suburb = getSuburbForCoordinate(lat, lng);

      if (suburb) {
        router.push(`/search?suburb=${encodeURIComponent(suburb)}`);
      } else {
        router.push("/search");
      }
    },
  });

  return null;
}

export function LeafletHeatMapPreview({
  courts,
  className = "",
}: LeafletHeatMapPreviewProps) {
  // Convert courts to heat points [lat, lng, intensity]
  const heatPoints: [number, number, number][] = courts
    .filter((court) => court.lat != null && court.lng != null)
    .map((court) => [court.lat!, court.lng!, 0.5]);

  return (
    <div className={`w-full h-full ${className}`}>
      <MapContainer
        center={[-37.8136, 144.9631]}
        zoom={10}
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={false}
        style={{ height: "100%", width: "100%", borderRadius: "inherit" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <HeatLayer points={heatPoints} />
        <ClickHandler />
      </MapContainer>
    </div>
  );
}
