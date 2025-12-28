"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { MapPin, Loader2 } from "lucide-react";
import { SearchInput } from "@/components/search/SearchInput";
import { useCourts } from "@/lib/contexts/CourtsContext";
import { NearbyDrawer } from "./NearbyDrawer";
import { LatLng } from "@/lib/utils";

export function Hero() {
  const courts = useCourts();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleNearMeClick = useCallback(() => {
    setLocationError(null);
    setDrawerOpen(true);

    if (userLocation) {
      // Already have location, just open drawer
      return;
    }

    if (!navigator.geolocation) {
      setLocationError("Your browser doesn't support location services.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "Location access denied. Please enable it in your browser settings."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError(
              "Unable to determine your location. Try again or search by suburb."
            );
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError("An error occurred while getting your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  }, [userLocation]);

  return (
    <>
      <section className="relative w-full py-20 md:py-32 lg:py-40 bg-muted overflow-hidden">
        {/* Background Pattern/Image Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/95 to-muted/80 z-10" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1629814407963-c35eb8567179?q=80&w=2670&auto=format')] bg-cover bg-center opacity-20 dark:opacity-40 mix-blend-overlay" />
        </div>

        <div className="container relative z-20 mx-auto px-4 md:px-6 flex flex-col items-center text-center gap-6">
          <div className="inline-flex items-center rounded-full border border-foreground/20 bg-foreground/10 px-3 py-1 text-sm text-foreground backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-secondary mr-2 animate-pulse"></span>
            Directory Live for 2025
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl">
            Find Your Next <span className="text-secondary">Pickleball</span> Match in
            Victoria
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            The comprehensive directory for indoor & outdoor courts. Find clubs, book
            sessions, and join the fastest growing sport in Australia.
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-2xl mt-8">
            <div className="w-full p-2 bg-card/80 backdrop-blur-md border border-border rounded-2xl shadow-2xl">
              <div className="flex flex-col md:flex-row gap-2">
                {/* Search Input */}
                <div className="flex-1">
                  <SearchInput courts={courts} variant="hero" />
                </div>

                {/* Near Me Button */}
                <button
                  onClick={handleNearMeClick}
                  disabled={isLocating}
                  className="h-12 flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="hidden sm:inline">Locating...</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5" />
                      <span>Near Me</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
            <span>Popular:</span>
            <Link
              href="/search?q=indoor"
              className="underline decoration-secondary decoration-2 underline-offset-4 cursor-pointer hover:text-foreground"
            >
              Indoor Courts
            </Link>
            <Link
              href="/search?suburb=Melbourne"
              className="underline decoration-secondary decoration-2 underline-offset-4 cursor-pointer hover:text-foreground"
            >
              Melbourne
            </Link>
            <Link
              href="/search?q=free"
              className="underline decoration-secondary decoration-2 underline-offset-4 cursor-pointer hover:text-foreground"
            >
              Free to Play
            </Link>
          </div>
        </div>
      </section>

      {/* Nearby Courts Drawer */}
      <NearbyDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userLocation={userLocation}
        courts={courts}
        isLocating={isLocating}
        locationError={locationError}
      />
    </>
  );
}
