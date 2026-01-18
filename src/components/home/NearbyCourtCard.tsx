"use client";

import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Court } from "@/lib/supabase/database.types";
import { formatDistance } from "@/lib/utils";

interface NearbyCourtCardProps {
  court: Court;
  distance: number;
  onSelect: () => void;
}

export function NearbyCourtCard({ court, distance, onSelect }: NearbyCourtCardProps) {
  const handleClick = () => {
    onSelect();
  };

  return (
    <Link
      href={`/court/${court.id}`}
      onClick={handleClick}
      className="block w-full p-4 bg-card hover:bg-muted/50 border border-border rounded-xl text-left transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{court.name}</h3>
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{court.suburb}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs font-medium rounded-full">
            {formatDistance(distance)}
          </span>
          {court.google_rating && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{court.google_rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
      {court.type && (
        <div className="mt-2">
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
            {court.type}
          </span>
        </div>
      )}
    </Link>
  );
}
