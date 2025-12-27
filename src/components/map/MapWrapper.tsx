"use client";

import dynamic from "next/dynamic";
import { Map as MapIcon } from "lucide-react";
import { Court } from "@/lib/data";

const MapWithNoSSR = dynamic(() => import("./Map"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
            <MapIcon className="w-10 h-10 animate-pulse opacity-20" />
        </div>
    )
});

export default function MapWrapper({ courts }: { courts: Court[] }) {
    return <MapWithNoSSR courts={courts} />;
}
