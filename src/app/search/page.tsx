import { getCourts } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { SearchLayout } from "@/components/search/SearchLayout";
import Link from "next/link";

interface SearchPageProps {
    searchParams: Promise<{
        q?: string;
        suburb?: string;
        court?: string;
    }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const allCourts = await getCourts();

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
            />
        </div>
    );
}
