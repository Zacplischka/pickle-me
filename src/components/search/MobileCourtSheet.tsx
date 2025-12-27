"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, GripHorizontal } from "lucide-react";
import { Court } from "@/lib/data";
import { CourtCard } from "@/components/CourtCard";
import { cn } from "@/lib/utils";

interface MobileCourtSheetProps {
    courts: Court[];
}

export function MobileCourtSheet({ courts }: MobileCourtSheetProps) {
    const [isExpanded, setIsExpanded] = useState(false);

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
            >
                <GripHorizontal className="h-5 w-5 text-muted-foreground mb-1" />
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{courts.length} courts</span>
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
            </button>

            {/* Scrollable Content */}
            <div className={cn(
                "overflow-y-auto p-4 space-y-3",
                isExpanded ? "h-[calc(70vh-60px)]" : "h-[60px]"
            )}>
                {courts.slice(0, isExpanded ? undefined : 2).map((court) => (
                    <CourtCard key={court.id} court={court} variant="compact" />
                ))}
            </div>
        </div>
    );
}
