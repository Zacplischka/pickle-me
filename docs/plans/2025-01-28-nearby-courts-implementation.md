# Nearby Courts Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a "Near Me" button to the Hero that opens a side drawer with radius slider and nearby courts.

**Architecture:** Geolocation in Hero component triggers a slide-in drawer. Drawer shows radius slider and top 5 courts sorted by distance using existing `calculateDistance` utility. "See all on map" navigates to search page with location params.

**Tech Stack:** React, Next.js App Router, Tailwind CSS, Browser Geolocation API

---

## Task 1: Create RadiusSlider Component

**Files:**
- Create: `src/components/ui/RadiusSlider.tsx`

**Step 1: Create the slider component**

```tsx
"use client";

import { cn } from "@/lib/utils";

interface RadiusSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function RadiusSlider({
  value,
  onChange,
  min = 1,
  max = 50,
  className,
}: RadiusSliderProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Search radius</span>
        <span className="text-sm font-semibold text-foreground">{value} km</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-secondary"
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-muted-foreground">{min} km</span>
        <span className="text-xs text-muted-foreground">{max} km</span>
      </div>
    </div>
  );
}
```

**Step 2: Verify**

Run: `npm run dev`
- No errors in terminal
- Component file exists at correct path

**Step 3: Commit**

```bash
git add src/components/ui/RadiusSlider.tsx
git commit -m "feat: add RadiusSlider component"
```

---

## Task 2: Create NearbyCourtCard Component

**Files:**
- Create: `src/components/home/NearbyCourtCard.tsx`

**Step 1: Create the compact court card**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { Star, MapPin } from "lucide-react";
import { Court } from "@/lib/supabase/database.types";
import { formatDistance } from "@/lib/utils";

interface NearbyCourtCardProps {
  court: Court;
  distance: number;
  onSelect: () => void;
}

export function NearbyCourtCard({ court, distance, onSelect }: NearbyCourtCardProps) {
  const router = useRouter();

  const handleClick = () => {
    onSelect();
    router.push(`/search?court=${court.id}`);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full p-4 bg-card hover:bg-muted/50 border border-border rounded-xl text-left transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{court.name}</h3>
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{court.suburb}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs font-medium rounded-full">
            {formatDistance(distance)}
          </span>
          {court.google_rating && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{court.google_rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
      {court.type && (
        <div className="mt-2">
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
            {court.type}
          </span>
        </div>
      )}
    </button>
  );
}
```

**Step 2: Verify**

Run: `npm run dev`
- No errors in terminal

**Step 3: Commit**

```bash
git add src/components/home/NearbyCourtCard.tsx
git commit -m "feat: add NearbyCourtCard component"
```

---

## Task 3: Create NearbyDrawer Component

**Files:**
- Create: `src/components/home/NearbyDrawer.tsx`

**Step 1: Create the drawer component**

```tsx
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
  const [displayRadius, setDisplayRadius] = useState(10);

  // Update display radius on slider release
  const handleRadiusChange = (value: number) => {
    setDisplayRadius(value);
  };

  const handleRadiusCommit = () => {
    setRadius(displayRadius);
  };

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
                    value={displayRadius}
                    onChange={handleRadiusChange}
                    onMouseUp={handleRadiusCommit}
                    onTouchEnd={handleRadiusCommit}
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
```

**Step 2: Update RadiusSlider to support onMouseUp/onTouchEnd**

Modify `src/components/ui/RadiusSlider.tsx`:

```tsx
"use client";

import { cn } from "@/lib/utils";

interface RadiusSliderProps {
  value: number;
  onChange: (value: number) => void;
  onMouseUp?: () => void;
  onTouchEnd?: () => void;
  min?: number;
  max?: number;
  className?: string;
}

export function RadiusSlider({
  value,
  onChange,
  onMouseUp,
  onTouchEnd,
  min = 1,
  max = 50,
  className,
}: RadiusSliderProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Search radius</span>
        <span className="text-sm font-semibold text-foreground">{value} km</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-secondary"
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-muted-foreground">{min} km</span>
        <span className="text-xs text-muted-foreground">{max} km</span>
      </div>
    </div>
  );
}
```

**Step 3: Verify**

Run: `npm run dev`
- No errors in terminal

**Step 4: Commit**

```bash
git add src/components/home/NearbyDrawer.tsx src/components/ui/RadiusSlider.tsx
git commit -m "feat: add NearbyDrawer component with radius filtering"
```

---

## Task 4: Update Hero Component

**Files:**
- Modify: `src/components/home/Hero.tsx`

**Step 1: Add "Near Me" button and drawer integration**

Replace the entire file:

```tsx
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Search, MapPin, Loader2 } from "lucide-react";
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
                <div className="relative flex-1 flex items-center">
                  <MapPin className="absolute left-4 w-5 h-5 text-muted-foreground" />
                  <SearchInput courts={courts} variant="hero" />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleNearMeClick}
                    disabled={isLocating}
                    className="h-12 flex-1 md:flex-none bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
```

**Step 2: Verify**

Run: `npm run dev`
- Open http://localhost:3000
- See two buttons in Hero: search input area and "Near Me" button
- Click "Near Me" → browser prompts for location
- Drawer slides in from right
- If location granted, see radius slider and nearby courts

**Step 3: Commit**

```bash
git add src/components/home/Hero.tsx
git commit -m "feat: integrate Near Me button and drawer into Hero"
```

---

## Task 5: Update Search Page to Handle Location Params

**Files:**
- Modify: `src/app/search/page.tsx`
- Modify: `src/components/search/SearchLayout.tsx`

**Step 1: Update search page to read location params**

Replace `src/app/search/page.tsx`:

```tsx
import { getCourts } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { SlidersHorizontal, ChevronDown, X, MapPin } from "lucide-react";
import { SearchLayout } from "@/components/search/SearchLayout";
import Link from "next/link";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    suburb?: string;
    court?: string;
    lat?: string;
    lng?: string;
    radius?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const allCourts = await getCourts();

  // Parse location params
  const userLocation =
    params.lat && params.lng
      ? { lat: parseFloat(params.lat), lng: parseFloat(params.lng) }
      : null;
  const radius = params.radius ? parseInt(params.radius, 10) : null;

  // Filter courts based on search params
  let filteredCourts = allCourts;
  let activeFilter: { type: string; value: string } | null = null;

  if (params.suburb) {
    filteredCourts = allCourts.filter(
      (court) => court.suburb.toLowerCase() === params.suburb!.toLowerCase()
    );
    activeFilter = { type: "Suburb", value: params.suburb };
  } else if (params.q) {
    const query = params.q.toLowerCase();
    filteredCourts = allCourts.filter(
      (court) =>
        court.name.toLowerCase().includes(query) ||
        court.suburb.toLowerCase().includes(query) ||
        (court.region && court.region.toLowerCase().includes(query))
    );
    activeFilter = { type: "Search", value: params.q };
  } else if (userLocation && radius) {
    activeFilter = { type: "Near You", value: `${radius} km` };
  }

  // Pre-select court if specified
  const selectedCourtId = params.court || null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Filters Header */}
      <div className="sticky top-16 z-30 w-full bg-background border-b border-border/60 backdrop-blur-sm px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <Button variant="outline" size="sm" className="h-8 rounded-full border-dashed">
            <SlidersHorizontal className="mr-2 h-3 w-3" /> Filters
          </Button>

          {activeFilter && (
            <>
              <div className="h-6 w-px bg-border mx-1" />
              <Link href="/search">
                <Button variant="secondary" size="sm" className="h-8 rounded-full text-xs gap-1">
                  {activeFilter.type === "Near You" && <MapPin className="h-3 w-3" />}
                  {activeFilter.type}: {activeFilter.value}
                  <X className="h-3 w-3" />
                </Button>
              </Link>
            </>
          )}

          {!activeFilter && (
            <>
              <div className="h-6 w-px bg-border mx-1" />
              <Button variant="secondary" size="sm" className="h-8 rounded-full text-xs">
                Any Type <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 rounded-full text-xs bg-background">
                Price <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 rounded-full text-xs bg-background">
                Facilities <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </>
          )}
        </div>
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredCourts.length} court{filteredCourts.length !== 1 ? "s" : ""} found
          </span>
          <Button variant="ghost" size="sm" className="h-8">
            Sort by: Recommended <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Map + Panel Layout */}
      <SearchLayout
        courts={filteredCourts}
        initialSelectedCourtId={selectedCourtId}
        initialUserLocation={userLocation}
        initialRadius={radius}
      />
    </div>
  );
}
```

**Step 2: Update SearchLayout to accept initial location**

Modify `src/components/search/SearchLayout.tsx`:

```tsx
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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

  // Update location when initialUserLocation changes
  useEffect(() => {
    if (initialUserLocation) {
      setUserLocation(initialUserLocation);
    }
  }, [initialUserLocation]);

  // Update selection when initialSelectedCourtId changes
  useEffect(() => {
    if (initialSelectedCourtId) {
      setSelectedCourtId(initialSelectedCourtId);
    }
  }, [initialSelectedCourtId]);

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
      {/* Full-width Map */}
      <div className="absolute inset-0">
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
```

**Step 3: Update MapWrapper to accept initialCenter**

Modify `src/components/map/MapWrapper.tsx` to pass `initialCenter` prop:

First read the current file to see its structure.

**Step 4: Verify**

Run: `npm run dev`
- Navigate to `/search?lat=-37.8136&lng=144.9631&radius=10`
- Map should center on Melbourne
- Courts should be filtered to 10km radius
- "Near You: 10 km" filter chip should appear

**Step 5: Commit**

```bash
git add src/app/search/page.tsx src/components/search/SearchLayout.tsx
git commit -m "feat: add location-based filtering to search page"
```

---

## Task 6: Update MapWrapper to Support Initial Center

**Files:**
- Modify: `src/components/map/MapWrapper.tsx`
- Modify: `src/components/map/Map.tsx`

**Step 1: Read current MapWrapper**

Check the current implementation.

**Step 2: Update MapWrapper**

Add `initialCenter` prop and pass to Map.

**Step 3: Update Map to use initialCenter**

If `initialCenter` is provided, use it instead of default Melbourne center.

**Step 4: Verify**

- Visit `/search?lat=-37.8136&lng=144.9631&radius=10`
- Map centers on provided coordinates

**Step 5: Commit**

```bash
git add src/components/map/MapWrapper.tsx src/components/map/Map.tsx
git commit -m "feat: support initial center for map from URL params"
```

---

## Task 7: Fix SearchInput Integration in Hero

**Files:**
- Modify: `src/components/home/Hero.tsx`

**Step 1: Adjust layout**

The current Hero modification places SearchInput inside a wrapper that conflicts with its own wrapper. Simplify to use SearchInput directly with the "Near Me" button beside it.

**Step 2: Verify layout**

- Both "Find Courts" button (from SearchInput) and "Near Me" button visible
- Mobile responsive
- Clicking "Find Courts" performs search
- Clicking "Near Me" opens drawer

**Step 3: Commit**

```bash
git add src/components/home/Hero.tsx
git commit -m "fix: adjust Hero layout for SearchInput and Near Me button"
```

---

## Summary

After completing all tasks:

1. **RadiusSlider** - Reusable slider component
2. **NearbyCourtCard** - Compact card for drawer
3. **NearbyDrawer** - Slide-in drawer with radius filter and courts
4. **Hero** - "Near Me" button triggers geolocation and opens drawer
5. **Search Page** - Reads `lat`, `lng`, `radius` params for location-based filtering
6. **Map** - Centers on user location when params provided

**Manual Testing Checklist:**
- [ ] Click "Near Me" on homepage → location permission prompt
- [ ] Grant permission → drawer opens with courts
- [ ] Adjust slider → courts update on release
- [ ] Click court card → navigates to search with court selected
- [ ] Click "See all on map" → navigates to search with location params
- [ ] Search page shows "Near You" filter chip
- [ ] Courts sorted by distance
- [ ] Deny location → error message displays
- [ ] Mobile responsive drawer
