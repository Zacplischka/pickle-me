"use client";

import { useState } from "react";
import { Court } from "@/lib/data";
import { CourtListPanel } from "./CourtListPanel";
import { MobileCourtSheet } from "./MobileCourtSheet";
import MapWrapper from "@/components/map/MapWrapper";

interface SearchLayoutProps {
    courts: Court[];
}

export function SearchLayout({ courts }: SearchLayoutProps) {
    const [isPanelOpen, setIsPanelOpen] = useState(true);

    return (
        <div className="relative flex-1 w-full h-full">
            {/* Full-width Map */}
            <div className="absolute inset-0">
                <MapWrapper courts={courts} />
            </div>

            {/* Desktop: Overlay Court List Panel */}
            <div className="hidden md:block">
                <CourtListPanel
                    courts={courts}
                    isOpen={isPanelOpen}
                    onToggle={() => setIsPanelOpen(!isPanelOpen)}
                />
            </div>

            {/* Mobile: Bottom Sheet */}
            <div className="md:hidden">
                <MobileCourtSheet courts={courts} />
            </div>
        </div>
    );
}
