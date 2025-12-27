"use client";

import { useState } from "react";
import { Court } from "@/lib/data";
import { CourtListPanel } from "./CourtListPanel";
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

            {/* Overlay Court List Panel */}
            <CourtListPanel
                courts={courts}
                isOpen={isPanelOpen}
                onToggle={() => setIsPanelOpen(!isPanelOpen)}
            />
        </div>
    );
}
