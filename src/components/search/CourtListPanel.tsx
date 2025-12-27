"use client";

import { ChevronRight, X } from "lucide-react";
import { Court } from "@/lib/data";
import { CourtCard } from "@/components/CourtCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface CourtListPanelProps {
    courts: Court[];
    isOpen: boolean;
    onToggle: () => void;
}

export function CourtListPanel({ courts, isOpen, onToggle }: CourtListPanelProps) {
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
                        <p className="text-sm text-muted-foreground">{courts.length} results</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onToggle}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Scrollable Court List */}
                <div className="h-[calc(100%-73px)] overflow-y-auto p-4 space-y-4">
                    {courts.map((court) => (
                        <CourtCard key={court.id} court={court} variant="compact" />
                    ))}
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
