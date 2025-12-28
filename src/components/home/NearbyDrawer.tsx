"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, MapPin, Loader2 } from "lucide-react";
import { Court } from "@/lib/supabase/database.types";
import { LatLng, calculateDistance } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { RadiusSlider } from "@/components/ui/RadiusSlider";
import { NearbyCourtCard } from "./NearbyCourtCard";
import { cn } from "@/lib/utils";

interface NearbyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: LatLng | null;
  courts: Court[];
  isLocating?: boolean;
  locationError?: string | null;
}

interface CourtWithDistance extends Court {
  distance: number;
}

export function NearbyDrawer({
  isOpen,
  onClose,
  userLocation,
  courts,
  isLocating = false,
  locationError = null,
}: NearbyDrawerProps) {
  const router = useRouter();
  const [radius, setRadius] = useState(10);

  // Filter and sort courts by distance
  const nearbyCourts = useMemo((): CourtWithDistance[] => {
    if (!userLocation) return [];

    return courts
      .filter((court): court is Court & { lat: number; lng: number } =>
        court.lat !== null && court.lng !== null
      )
      .map((court) => ({
        ...court,
        distance: calculateDistance(userLocation, { lat: court.lat, lng: court.lng }),
      }))
      .filter((court) => court.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
  }, [courts, userLocation, radius]);

  const handleSeeAllOnMap = () => {
    if (userLocation) {
      router.push(
        `/search?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${radius}`
      );
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl z-50 transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-secondary" />
              <h2 className="text-lg font-semibold">Courts Near You</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLocating && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-secondary" />
                <p>Getting your location...</p>
              </div>
            )}

            {locationError && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {locationError}
              </div>
            )}

            {userLocation && !isLocating && (
              <>
                {/* Radius Slider */}
                <div className="mb-6">
                  <RadiusSlider
                    value={radius}
                    onChange={setRadius}
                  />
                </div>

                {/* Courts List */}
                {nearbyCourts.length > 0 ? (
                  <div className="space-y-3">
                    {nearbyCourts.map((court) => (
                      <NearbyCourtCard
                        key={court.id}
                        court={court}
                        distance={court.distance}
                        onSelect={onClose}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No courts found within {radius} km.</p>
                    <p className="text-sm mt-1">Try increasing your search radius.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {userLocation && nearbyCourts.length > 0 && (
            <div className="p-4 border-t border-border">
              <Button
                onClick={handleSeeAllOnMap}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                See all on map
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
