"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronUp, ChevronDown, GripHorizontal, Navigation } from "lucide-react";
import { CourtCard } from "@/components/CourtCard";
import { Button } from "@/components/ui/Button";
import { cn, LatLng } from "@/lib/utils";
import { CourtWithDistance } from "./SearchLayout";

const COURTS_PER_PAGE = 10;

interface MobileCourtSheetProps {
    courts: CourtWithDistance[];
    userLocation: LatLng | null;
    onCourtSelect: (courtId: string) => void;
    selectedCourtId: string | null;
}

export function MobileCourtSheet({ courts, userLocation, onCourtSelect, selectedCourtId }: MobileCourtSheetProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [page, setPage] = useState(1);

    const totalPages = Math.ceil(courts.length / COURTS_PER_PAGE);
    const displayedCourts = useMemo(
        () => courts.slice(0, page * COURTS_PER_PAGE),
        [courts, page]
    );

    const hasMore = page < totalPages;

    const loadMore = useCallback(() => {
        if (hasMore) {
            setPage((p) => p + 1);
        }
    }, [hasMore]);

    // Infinite scroll handler
    const handleScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            const target = e.currentTarget;
            const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
            if (scrollBottom < 200 && hasMore) {
                loadMore();
            }
        },
        [hasMore, loadMore]
    );

    return (
        <div
            className={cn(
                "absolute bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-2xl shadow-lg transition-all duration-300 z-20",
                isExpanded ? "h-[70vh]" : "h-[120px]"
            )}
        >
            {/* Handle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex flex-col items-center py-3 border-b border-border/60"
                aria-label={isExpanded ? "Collapse court list" : "Expand court list"}
                aria-expanded={isExpanded}
            >
                <GripHorizontal className="h-5 w-5 text-muted-foreground mb-1" />
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{courts.length} courts</span>
                    {userLocation && (
                        <span className="inline-flex items-center gap-1 text-xs text-primary">
                            <Navigation className="w-3 h-3" />
                        </span>
                    )}
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
            </button>

            {/* Scrollable Content */}
            <div
                onScroll={handleScroll}
                className={cn(
                    "overflow-y-auto p-4 space-y-3",
                    isExpanded ? "h-[calc(70vh-60px)]" : "h-[60px]"
                )}
            >
                {(isExpanded ? displayedCourts : courts.slice(0, 2)).map((court) => (
                    <CourtCard
                        key={court.id}
                        court={court}
                        variant="compact"
                        onClick={() => onCourtSelect(court.id)}
                        isSelected={selectedCourtId === court.id}
                    />
                ))}
                {isExpanded && hasMore && (
                    <div className="py-4 text-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadMore}
                            className="w-full"
                        >
                            Load more ({courts.length - displayedCourts.length} remaining)
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
