"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker, Circle } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import L from "leaflet";
import { Court } from "@/lib/data";
import { Button } from "../ui/Button";
import { Navigation, Loader2, Trophy, Users } from "lucide-react";
import { LatLng } from "@/lib/utils";

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

// Highlighted marker icon (larger, different color effect via CSS filter)
const highlightedIcon = new L.Icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [30, 49],
    iconAnchor: [15, 49],
    popupAnchor: [1, -40],
    shadowSize: [49, 49],
    className: "highlighted-marker",
});

// Custom cluster icon
const createClusterCustomIcon = (cluster: L.MarkerCluster) => {
    const count = cluster.getChildCount();
    let size = "small";
    let dimensions = 36;

    if (count >= 10 && count < 30) {
        size = "medium";
        dimensions = 44;
    } else if (count >= 30) {
        size = "large";
        dimensions = 52;
    }

    return L.divIcon({
        html: `<div class="cluster-icon cluster-${size}"><span>${count}</span></div>`,
        className: "custom-cluster-icon",
        iconSize: L.point(dimensions, dimensions),
    });
};

interface MapProps {
    courts: Court[];
    onLocationFound?: (location: LatLng) => void;
    selectedCourtId?: string | null;
    onCourtSelected?: (courtId: string | null) => void;
    initialCenter?: LatLng | null;
}

interface LocationMarkerProps {
    onLocationFound?: (location: LatLng) => void;
}

function LocationMarker({ onLocationFound }: LocationMarkerProps) {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const map = useMap();

    const handleLocate = useCallback(() => {
        setIsLocating(true);
        map.locate({ setView: false, maxZoom: 14 })
            .on("locationfound", function (e) {
                setPosition(e.latlng);
                map.flyTo(e.latlng, 13);
                setIsLocating(false);
                if (onLocationFound) {
                    onLocationFound({ lat: e.latlng.lat, lng: e.latlng.lng });
                }
            })
            .on("locationerror", function () {
                setIsLocating(false);
            });
    }, [map, onLocationFound]);

    return (
        <>
            {/* User location marker - blue pulsing dot */}
            {position !== null && (
                <>
                    {/* Outer pulsing circle for visibility */}
                    <Circle
                        center={position}
                        radius={100}
                        pathOptions={{
                            color: "#3b82f6",
                            fillColor: "#3b82f6",
                            fillOpacity: 0.15,
                            weight: 1,
                        }}
                    />
                    {/* Inner solid dot */}
                    <CircleMarker
                        center={position}
                        radius={10}
                        pathOptions={{
                            color: "#ffffff",
                            fillColor: "#3b82f6",
                            fillOpacity: 1,
                            weight: 3,
                        }}
                    >
                        <Popup>You are here</Popup>
                    </CircleMarker>
                </>
            )}
            {/* Location button */}
            <div className="absolute bottom-6 right-6 z-10">
                <Button
                    onClick={handleLocate}
                    disabled={isLocating}
                    className="bg-white text-slate-800 hover:bg-slate-100 shadow-lg font-semibold border border-slate-200"
                >
                    {isLocating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-500" />
                    ) : (
                        <Navigation className="w-4 h-4 mr-2 text-blue-500" />
                    )}
                    {isLocating ? "Locating..." : "Use my location"}
                </Button>
            </div>
        </>
    );
}

interface CourtMarkerProps {
    court: Court & { lat: number; lng: number };
    isSelected: boolean;
    onSelect: () => void;
}

function CourtMarker({ court, isSelected, onSelect }: CourtMarkerProps) {
    const markerRef = useRef<L.Marker>(null);
    const map = useMap();

    useEffect(() => {
        if (isSelected && markerRef.current) {
            map.flyTo([court.lat, court.lng], 15, { duration: 0.5 });
            // Small delay to ensure map has moved before opening popup
            setTimeout(() => {
                markerRef.current?.openPopup();
            }, 600);
        }
    }, [isSelected, court.lat, court.lng, map]);

    // Type badge color matching CourtCard
    const typeColor = court.type === "Indoor"
        ? "bg-orange-500 text-white"
        : court.type === "Outdoor"
            ? "bg-sky-500 text-white"
            : "bg-emerald-500 text-white"; // Hybrid

    return (
        <Marker
            ref={markerRef}
            position={[court.lat, court.lng]}
            icon={isSelected ? highlightedIcon : customIcon}
            eventHandlers={{
                click: onSelect,
            }}
        >
            <Popup className="font-sans">
                <div className="p-1 min-w-[220px]">
                    <h3 className="font-bold text-sm mb-1">{court.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{court.suburb}</p>

                    {/* Type badge and rating row */}
                    <div className="flex items-center gap-2 mb-2">
                        {court.type && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor}`}>
                                {court.type}
                            </span>
                        )}
                        {court.google_rating && (
                            <span className="text-xs flex items-center gap-1">
                                <span className="text-amber-500">★</span>
                                <span className="font-medium">{court.google_rating.toFixed(1)}</span>
                                {court.google_user_ratings_total && (
                                    <span className="text-gray-400">
                                        ({court.google_user_ratings_total.toLocaleString()})
                                    </span>
                                )}
                            </span>
                        )}
                    </div>

                    {/* Surface and courts count */}
                    {(court.surface || court.courts_count) && (
                        <div className="flex items-center gap-3 mb-2 text-xs text-gray-600">
                            {court.surface && (
                                <span className="flex items-center gap-1">
                                    <Trophy className="w-3 h-3 text-orange-400" />
                                    {court.surface}
                                </span>
                            )}
                            {court.courts_count && (
                                <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3 text-blue-400" />
                                    {court.courts_count} Courts
                                </span>
                            )}
                        </div>
                    )}

                    {court.google_phone && (
                        <a
                            href={`tel:${court.google_phone}`}
                            className="text-xs text-blue-600 hover:underline block"
                        >
                            {court.google_phone}
                        </a>
                    )}
                </div>
            </Popup>
        </Marker>
    );
}

export default function Map({ courts, onLocationFound, selectedCourtId, onCourtSelected, initialCenter }: MapProps) {
    // Default center (Melbourne CBD) or use initialCenter if provided
    const center: [number, number] = initialCenter
        ? [initialCenter.lat, initialCenter.lng]
        : [-37.8136, 144.9631];

    // Filter courts that have valid coordinates
    const courtsWithCoords = courts.filter(
        (court): court is Court & { lat: number; lng: number } =>
            court.lat !== null && court.lng !== null
    );

    return (
        <div className="w-full h-full relative" aria-label="Interactive map showing pickleball court locations in Victoria" role="application">
            <MapContainer
                center={center}
                zoom={11}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={createClusterCustomIcon}
                    maxClusterRadius={60}
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                    zoomToBoundsOnClick={true}
                >
                    {courtsWithCoords.map((court) => (
                        <CourtMarker
                            key={court.id}
                            court={court}
                            isSelected={selectedCourtId === court.id}
                            onSelect={() => onCourtSelected?.(court.id)}
                        />
                    ))}
                </MarkerClusterGroup>

                <LocationMarker onLocationFound={onLocationFound} />
            </MapContainer>
        </div>
    );
}
