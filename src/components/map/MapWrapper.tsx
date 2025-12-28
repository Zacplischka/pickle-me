"use client";

import dynamic from "next/dynamic";
import { Map as MapIcon } from "lucide-react";
import { Court } from "@/lib/data";
import { LatLng } from "@/lib/utils";

const MapWithNoSSR = dynamic(() => import("./Map"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
            <MapIcon className="w-10 h-10 animate-pulse opacity-20" />
        </div>
    )
});

interface MapWrapperProps {
    courts: Court[];
    onLocationFound?: (location: LatLng) => void;
    selectedCourtId?: string | null;
    onCourtSelected?: (courtId: string | null) => void;
    initialCenter?: LatLng | null;
}

export default function MapWrapper({
    courts,
    onLocationFound,
    selectedCourtId,
    onCourtSelected,
    initialCenter,
}: MapWrapperProps) {
    return (
        <MapWithNoSSR
            courts={courts}
            onLocationFound={onLocationFound}
            selectedCourtId={selectedCourtId}
            onCourtSelected={onCourtSelected}
            initialCenter={initialCenter}
        />
    );
}
