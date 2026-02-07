"use client";

import { MapPin, Star, Trophy, Users, Clock, DollarSign } from "lucide-react";
import type { Court } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "./FavoriteButton";
import { useModals } from "@/lib/contexts/ModalContext";

interface CourtDetailHeaderProps {
  court: Court;
  communityRating: number | null;
  reviewCount: number;
}

export function CourtDetailHeader({ court, communityRating, reviewCount }: CourtDetailHeaderProps) {
  const { openAuthModal } = useModals();

  const typeColor = court.type === "Indoor"
    ? "bg-primary/90 text-primary-foreground"
    : court.type === "Outdoor"
      ? "bg-sky-500/90 text-white"
      : "bg-emerald-500/90 text-white";

  return (
    <div className="space-y-4">
      {/* Title & Location */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{court.name}</h1>
          <FavoriteButton
            courtId={court.id}
            size="lg"
            onAuthRequired={() => openAuthModal()}
          />
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">
            {court.google_formatted_address || `${court.address || court.suburb}${court.region ? `, ${court.region}` : ""}`}
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {court.type && (
          <span className={cn("px-3 py-1 rounded-full text-sm font-medium", typeColor)}>
            {court.type}
          </span>
        )}
        {court.venue_type && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
            {court.venue_type}
          </span>
        )}
        {court.price && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            {court.price}
          </span>
        )}
      </div>

      {/* Ratings */}
      <div className="flex flex-wrap items-center gap-6">
        {/* Google Rating */}
        {court.google_rating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-lg text-foreground">{court.google_rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Google ({court.google_user_ratings_total?.toLocaleString() || 0} reviews)
            </span>
          </div>
        )}

        {/* Community Rating */}
        {communityRating !== null && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-secondary text-secondary" />
              <span className="font-bold text-lg text-foreground">{communityRating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Community ({reviewCount} reviews)
            </span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {court.courts_count && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Users className="w-5 h-5 text-secondary" />
            <div>
              <p className="text-sm font-medium text-foreground">{court.courts_count}</p>
              <p className="text-xs text-muted-foreground">Courts</p>
            </div>
          </div>
        )}
        {court.surface && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Trophy className="w-5 h-5 text-accent" />
            <div>
              <p className="text-sm font-medium text-foreground">{court.surface}</p>
              <p className="text-xs text-muted-foreground">Surface</p>
            </div>
          </div>
        )}
        {court.line_marking && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <div className="w-5 h-5 flex items-center justify-center text-primary font-bold text-xs">
              PB
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{court.line_marking}</p>
              <p className="text-xs text-muted-foreground">Lines</p>
            </div>
          </div>
        )}
        {court.google_opening_hours && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Hours</p>
              <p className="text-xs text-muted-foreground">See below</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
