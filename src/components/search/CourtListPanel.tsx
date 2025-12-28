"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronRight, X, Navigation } from "lucide-react";
import { CourtCard } from "@/components/CourtCard";
import { Button } from "@/components/ui/Button";
import { cn, LatLng } from "@/lib/utils";
import { CourtWithDistance } from "./SearchLayout";

const COURTS_PER_PAGE = 10;

interface CourtListPanelProps {
    courts: CourtWithDistance[];
    isOpen: boolean;
    onToggle: () => void;
    userLocation: LatLng | null;
    onCourtSelect: (courtId: string) => void;
    selectedCourtId: string | null;
}

export function CourtListPanel({ courts, isOpen, onToggle, userLocation, onCourtSelect, selectedCourtId }: CourtListPanelProps) {
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
        <>
            {/* Panel */}
            <div
                className={cn(
                    "absolute top-0 left-0 h-full bg-background border-r border-border shadow-lg transition-transform duration-300 z-20",
                    "w-[380px] lg:w-[420px]",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Panel Header */}
                <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between z-10">
                    <div>
                        <h2 className="font-semibold text-foreground">Courts</h2>
                        <p className="text-sm text-muted-foreground">
                            {courts.length} results
                            {userLocation && (
                                <span className="inline-flex items-center gap-1 ml-2 text-primary">
                                    <Navigation className="w-3 h-3" />
                                    sorted by distance
                                </span>
                            )}
                        </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onToggle}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Scrollable Court List */}
                <div
                    onScroll={handleScroll}
                    className="h-[calc(100%-73px)] overflow-y-auto p-4 space-y-4"
                >
                    {displayedCourts.map((court) => (
                        <CourtCard
                            key={court.id}
                            court={court}
                            variant="compact"
                            onClick={() => onCourtSelect(court.id)}
                            isSelected={selectedCourtId === court.id}
                        />
                    ))}
                    {hasMore && (
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

            {/* Toggle Button (visible when panel is closed) */}
            {!isOpen && (
                <button
                    onClick={onToggle}
                    className="absolute top-4 left-4 z-20 bg-background border border-border rounded-lg shadow-lg px-3 py-2 flex items-center gap-2 hover:bg-muted transition-colors"
                >
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-sm font-medium">Show {courts.length} courts</span>
                </button>
            )}
        </>
    );
}
