import { getCourts } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { SearchLayout } from "@/components/search/SearchLayout";

export default async function SearchPage() {
    const courts = await getCourts();

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
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
                    <span className="text-sm text-muted-foreground">{courts.length} courts found</span>
                    <Button variant="ghost" size="sm" className="h-8">
                        Sort by: Recommended <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Map + Panel Layout */}
            <SearchLayout courts={courts} />
        </div>
    );
}
