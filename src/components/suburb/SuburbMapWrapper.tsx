"use client";

import dynamic from "next/dynamic";
import { Map as MapIcon } from "lucide-react";
import type { Court } from "@/lib/supabase/database.types";

const SuburbMap = dynamic(
  () => import("./SuburbMap").then((mod) => mod.SuburbMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
        <MapIcon className="w-10 h-10 animate-pulse opacity-20" />
      </div>
    ),
  }
);

interface SuburbMapWrapperProps {
  courts: Court[];
}

export function SuburbMapWrapper({ courts }: SuburbMapWrapperProps) {
  return <SuburbMap courts={courts} />;
}
