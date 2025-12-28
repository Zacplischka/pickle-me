"use client";

import { useState, useMemo, useCallback } from "react";
import { Court } from "@/lib/data";
import { CourtListPanel } from "./CourtListPanel";
import { MobileCourtSheet } from "./MobileCourtSheet";
import MapWrapper from "@/components/map/MapWrapper";
import { LatLng, calculateDistance } from "@/lib/utils";

interface SearchLayoutProps {
    courts: Court[];
    initialSelectedCourtId?: string | null;
    initialUserLocation?: LatLng | null;
    initialRadius?: number | null;
}

export interface CourtWithDistance extends Court {
    distance?: number;
}

export function SearchLayout({
    courts,
    initialSelectedCourtId,
    initialUserLocation = null,
    initialRadius = null,
}: SearchLayoutProps) {
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [userLocation, setUserLocation] = useState<LatLng | null>(initialUserLocation);
    const [selectedCourtId, setSelectedCourtId] = useState<string | null>(
        initialSelectedCourtId || null
    );

    const handleLocationFound = useCallback((location: LatLng) => {
        setUserLocation(location);
    }, []);

    const handleCourtSelect = useCallback((courtId: string) => {
        setSelectedCourtId(courtId);
    }, []);

    const courtsWithDistance = useMemo((): CourtWithDistance[] => {
        if (!userLocation) return courts;

        let result = courts
            .map((court): CourtWithDistance => {
                if (court.lat !== null && court.lng !== null) {
                    const distance = calculateDistance(userLocation, {
                        lat: court.lat,
                        lng: court.lng,
                    });
                    return { ...court, distance };
                }
                return { ...court, distance: undefined };
            })
            .sort((a, b) => {
                if (a.distance === undefined && b.distance === undefined) return 0;
                if (a.distance === undefined) return 1;
                if (b.distance === undefined) return -1;
                return a.distance - b.distance;
            });

        // Filter by radius if provided
        if (initialRadius) {
            result = result.filter(
                (court) => court.distance !== undefined && court.distance <= initialRadius
            );
        }

        return result;
    }, [courts, userLocation, initialRadius]);

    return (
        <div className="relative flex-1 w-full overflow-hidden">
            {/* Full-width Map - z-0 creates stacking context to contain Leaflet's internal z-indexes */}
            <div className="absolute inset-0 z-0">
                <MapWrapper
                    courts={courts}
                    onLocationFound={handleLocationFound}
                    selectedCourtId={selectedCourtId}
                    onCourtSelected={setSelectedCourtId}
                    initialCenter={initialUserLocation}
                />
            </div>

            {/* Desktop: Overlay Court List Panel */}
            <div className="hidden md:block">
                <CourtListPanel
                    key={userLocation ? `${userLocation.lat}-${userLocation.lng}` : "no-location"}
                    courts={courtsWithDistance}
                    isOpen={isPanelOpen}
                    onToggle={() => setIsPanelOpen(!isPanelOpen)}
                    userLocation={userLocation}
                    onCourtSelect={handleCourtSelect}
                    selectedCourtId={selectedCourtId}
                />
            </div>

            {/* Mobile: Bottom Sheet */}
            <div className="md:hidden">
                <MobileCourtSheet
                    key={userLocation ? `mobile-${userLocation.lat}-${userLocation.lng}` : "mobile-no-location"}
                    courts={courtsWithDistance}
                    userLocation={userLocation}
                    onCourtSelect={handleCourtSelect}
                    selectedCourtId={selectedCourtId}
                />
            </div>
        </div>
    );
}
