"use client";

import dynamic from "next/dynamic";
import { Map as MapIcon } from "lucide-react";
import { Court } from "@/lib/supabase/database.types";

const LeafletHeatMapPreview = dynamic(
  () =>
    import("./LeafletHeatMapPreview").then((mod) => mod.LeafletHeatMapPreview),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
        <MapIcon className="w-10 h-10 animate-pulse opacity-20" />
      </div>
    ),
  }
);

interface HeatMapPreviewWrapperProps {
  courts: Court[];
  className?: string;
}

export function HeatMapPreviewWrapper({
  courts,
  className,
}: HeatMapPreviewWrapperProps) {
  return <LeafletHeatMapPreview courts={courts} className={className} />;
}
