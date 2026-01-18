"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { useRouter } from "next/navigation";
import { Court } from "@/lib/supabase/database.types";
import { getSuburbForCoordinate } from "@/lib/suburbs";
import { Search } from "lucide-react";

interface LeafletHeatMapPreviewProps {
  courts: Court[];
  className?: string;
}

// Heat layer component
function HeatLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    // Create heat layer with adjusted settings for better color distribution
    const heat = L.heatLayer(points, {
      radius: 30,
      blur: 20,
      maxZoom: 13,
      max: 0.6, // Lower max so colors saturate more easily
      minOpacity: 0.3,
      gradient: {
        0.0: "#3b82f6", // blue - few courts
        0.25: "#22c55e", // green
        0.5: "#eab308", // yellow
        0.75: "#f97316", // orange
        1.0: "#ef4444", // red - many courts
      },
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}

// Legend component
function Legend() {
  return (
    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[1000] pointer-events-none">
      <div className="text-xs font-semibold text-gray-700 mb-2">Court Density</div>
      <div className="flex items-center gap-2">
        <div
          className="h-3 w-24 rounded"
          style={{
            background: "linear-gradient(to right, #3b82f6, #22c55e, #eab308, #f97316, #ef4444)",
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-500 mt-1">
        <span>Few</span>
        <span>Many</span>
      </div>
    </div>
  );
}

// Hover overlay component
function HoverOverlay({ isHovered }: { isHovered: boolean }) {
  return (
    <div
      className={`absolute inset-0 z-[999] pointer-events-none flex items-center justify-center transition-all duration-300 ${
        isHovered ? "bg-black/20" : "bg-transparent"
      }`}
    >
      <div
        className={`flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-5 py-3 shadow-lg transition-all duration-300 ${
          isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <Search className="w-5 h-5 text-primary" />
        <span className="font-semibold text-gray-800">Click to explore courts</span>
      </div>
    </div>
  );
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
  const [isHovered, setIsHovered] = useState(false);

  // Convert courts to heat points [lat, lng, intensity]
  // Higher intensity (1.0) means each point contributes more to the heat
  const heatPoints: [number, number, number][] = courts
    .filter((court) => court.lat != null && court.lng != null)
    .map((court) => [court.lat!, court.lng!, 1.0]);

  return (
    <div
      className={`w-full h-full relative cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
      <HoverOverlay isHovered={isHovered} />
      <Legend />
    </div>
  );
}
