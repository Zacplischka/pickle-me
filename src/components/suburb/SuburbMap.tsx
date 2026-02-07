"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import type { Court } from "@/lib/supabase/database.types";

// Fix default marker icon — Turbopack doesn't support importing PNGs from node_modules
// the same way Webpack does, so use CDN URLs instead
L.Marker.prototype.options.icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface SuburbMapProps {
  courts: Court[];
}

export function SuburbMap({ courts }: SuburbMapProps) {
  const courtsWithCoords = courts.filter(
    (c): c is Court & { lat: number; lng: number } =>
      c.lat !== null && c.lng !== null
  );

  if (courtsWithCoords.length === 0) return null;

  // Calculate bounds from all court positions
  const bounds = L.latLngBounds(
    courtsWithCoords.map((c) => [c.lat, c.lng] as [number, number])
  );

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [40, 40] }}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {courtsWithCoords.map((court) => (
        <Marker key={court.id} position={[court.lat, court.lng]}>
          <Popup>
            <div className="p-1 min-w-[180px] font-sans">
              <h3 className="font-bold text-sm mb-1">{court.name}</h3>
              {court.google_rating && (
                <p className="text-xs text-gray-500 mb-2">
                  <span className="text-amber-500">&#9733;</span>{" "}
                  {court.google_rating.toFixed(1)}
                </p>
              )}
              <Link
                href={`/court/${court.id}`}
                className="text-xs text-blue-600 hover:underline"
              >
                View details
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
