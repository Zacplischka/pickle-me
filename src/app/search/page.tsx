import { Suspense } from "react";
import { getCourts } from "@/lib/data";
import { SearchLayout } from "@/components/search/SearchLayout";
import { FilterBar } from "@/components/search/FilterBar";

interface SearchPageProps {
    searchParams: Promise<{
        q?: string;
        suburb?: string;
        court?: string;
        lat?: string;
        lng?: string;
        radius?: string;
        type?: string;
        facility?: string | string[];
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

    // Parse filter params
    const typeFilter = params.type || null;
    const facilityFilters = params.facility
        ? Array.isArray(params.facility)
            ? params.facility
            : [params.facility]
        : [];

    // Build active filter info for display
    let searchFilter: { type: string; value: string } | null = null;
    if (params.suburb) {
        searchFilter = { type: "Suburb", value: params.suburb };
    } else if (params.q) {
        searchFilter = { type: "Search", value: params.q };
    } else if (userLocation && radius) {
        searchFilter = { type: "Near You", value: `${radius} km` };
    }

    // Filter courts based on all params
    let filteredCourts = allCourts;

    // Text/location search filters
    if (params.suburb) {
        filteredCourts = filteredCourts.filter(
            (court) => court.suburb.toLowerCase() === params.suburb!.toLowerCase()
        );
    } else if (params.q) {
        const query = params.q.toLowerCase();
        filteredCourts = filteredCourts.filter(
            (court) =>
                court.name.toLowerCase().includes(query) ||
                court.suburb.toLowerCase().includes(query) ||
                (court.region && court.region.toLowerCase().includes(query))
        );
    }

    // Type filter (Indoor/Outdoor/Hybrid)
    if (typeFilter) {
        filteredCourts = filteredCourts.filter(
            (court) => court.type?.toLowerCase() === typeFilter.toLowerCase()
        );
    }

    // Facilities filter (must have ALL selected facilities)
    if (facilityFilters.length > 0) {
        filteredCourts = filteredCourts.filter((court) => {
            if (!court.features) return false;
            return facilityFilters.every((facility) =>
                court.features!.includes(facility)
            );
        });
    }

    // Pre-select court if specified
    const selectedCourtId = params.court || null;

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Filters Header */}
            <Suspense fallback={<div className="h-14 bg-background border-b border-border/60" />}>
                <FilterBar
                    totalCourts={filteredCourts.length}
                    activeFilters={{
                        type: typeFilter,
                        facilities: facilityFilters,
                        search: searchFilter,
                    }}
                />
            </Suspense>

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
