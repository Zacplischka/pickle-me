import { Suspense } from "react";
import { getCourtSummaries } from "@/lib/data";
import { SearchLayout } from "@/components/search/SearchLayout";
import { FilterBar } from "@/components/search/FilterBar";

export const revalidate = 300;

interface SearchPageProps {
    searchParams: Promise<{
        q?: string;
        suburb?: string;
        court?: string;
        lat?: string;
        lng?: string;
        radius?: string;
        location?: string;
        type?: string;
        facility?: string | string[];
    }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const allCourts = await getCourtSummaries();

    // Parse location params
    const userLocation =
        params.lat && params.lng
            ? { lat: parseFloat(params.lat), lng: parseFloat(params.lng) }
            : null;
    const radius = params.radius ? parseInt(params.radius, 10) : null;
    const locationName = params.location || null;

    // Parse filter params
    const typeFilter = params.type || null;
    const suburbFilter = params.suburb || null;
    const facilityFilters = params.facility
        ? Array.isArray(params.facility)
            ? params.facility
            : [params.facility]
        : [];

    // Get unique suburbs from all courts for the filter dropdown
    const availableSuburbs = [...new Set(allCourts.map(court => court.suburb))].sort();

    // Build active filter info for display (suburb is now handled by dropdown, not search chip)
    let searchFilter: { type: string; value: string } | null = null;
    if (params.q) {
        searchFilter = { type: "Search", value: params.q };
    } else if (userLocation && radius) {
        searchFilter = { type: "Near You", value: `${radius} km` };
    } else if (userLocation && locationName) {
        searchFilter = { type: "Near", value: locationName };
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
                    availableSuburbs={availableSuburbs}
                    activeFilters={{
                        type: typeFilter,
                        suburb: suburbFilter,
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
