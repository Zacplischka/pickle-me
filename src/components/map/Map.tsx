"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Court } from "@/lib/data";
import { Button } from "../ui/Button";
import { Navigation } from "lucide-react";

// Fix for default marker icons in Next.js
const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png";

const customIcon = new L.Icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface MapProps {
    courts: Court[];
}

function LocationMarker() {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const map = useMap();

    const handleLocate = () => {
        map.locate().on("locationfound", function (e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        });
    };

    return (
        <div className="absolute bottom-6 right-6 z-[1000]">
            <Button
                onClick={handleLocate}
                className="bg-white text-primary hover:bg-slate-100 shadow-lg font-semibold"
            >
                <Navigation className="w-4 h-4 mr-2" />
                Use My Location
            </Button>
            {position === null ? null : (
                <Marker position={position} icon={customIcon}>
                    <Popup>You are here</Popup>
                </Marker>
            )}
        </div>
    );
}

export default function Map({ courts }: MapProps) {
    // Default center (Melbourne CBD)
    const center: [number, number] = [-37.8136, 144.9631];

    // Filter courts that have valid coordinates
    const courtsWithCoords = courts.filter(
        (court): court is Court & { lat: number; lng: number } =>
            court.lat !== null && court.lng !== null
    );

    return (
        <div className="w-full h-full relative">
            <MapContainer
                center={center}
                zoom={11}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {courtsWithCoords.map((court) => (
                    <Marker
                        key={court.id}
                        position={[court.lat, court.lng]}
                        icon={customIcon}
                    >
                        <Popup className="font-sans">
                            <div className="p-1 min-w-[200px]">
                                <h3 className="font-bold text-sm mb-1">{court.name}</h3>
                                <p className="text-xs text-muted-foreground mb-2">{court.suburb}</p>
                                {court.type && (
                                    <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full font-medium">
                                        {court.type}
                                    </span>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <LocationMarker />
            </MapContainer>
        </div>
    );
}
