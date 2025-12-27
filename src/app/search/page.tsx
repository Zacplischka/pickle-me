import { getCourts } from "@/lib/data";
import { CourtCard } from "@/components/CourtCard";
import { Button } from "@/components/ui/Button";
import { SlidersHorizontal, Map, ChevronDown } from "lucide-react";
import MapWrapper from "@/components/map/MapWrapper";

export default async function SearchPage() {
    const courts = await getCourts();

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
            {/* Filters Header (Mobile/Desktop simplified) */}
            <div className="sticky top-16 z-30 w-full bg-background border-b border-border/60 backdrop-blur-sm px-4 md:px-6 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    <Button variant="outline" size="sm" className="h-8 rounded-full border-dashed">
                        <SlidersHorizontal className="mr-2 h-3 w-3" /> Filters
                    </Button>
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
                </div>
                <div className="hidden md:flex items-center gap-2">
                    <span className="text-sm text-muted-foreground mr-2">{courts.length} courts found</span>
                    <Button variant="ghost" size="sm" className="h-8">
                        Sort by: Recommended <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                </div>
            </div>

            <div className="flex flex-1">
                {/* Main Content - List */}
                <div className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/10">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Mobile Result Count */}
                        <div className="md:hidden text-sm text-muted-foreground pb-2">
                            {courts.length} courts in Victoria
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {courts.map((court) => (
                                <CourtCard key={court.id} court={court} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Map Side Panel (Desktop Only for now) */}
                <div className="hidden lg:block w-[400px] xl:w-[500px] border-l border-border bg-muted/30 relative z-0">
                    <MapWrapper courts={courts} />
                </div>
            </div>
        </div>
    );
}
