"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Star, Plus } from "lucide-react";
import type { FavoriteWithCourt } from "@/lib/supabase/favorites";
import { FavoriteButton } from "@/components/court/FavoriteButton";
import { Button } from "@/components/ui/Button";

interface FavoritesListProps {
  favorites: FavoriteWithCourt[];
  onUnfavorite?: (courtId: string) => void;
}

export function FavoritesList({ favorites, onUnfavorite }: FavoritesListProps) {
  if (favorites.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
        <Heart className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No favorites yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Save courts you love to find them easily later!
        </p>
        <Link href="/search">
          <Button variant="default" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Find Courts
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {favorites.map((favorite) => {
        const court = favorite.courts;
        const typeColor = court.type === "Indoor"
          ? "bg-primary/90 text-primary-foreground"
          : court.type === "Outdoor"
            ? "bg-sky-500/90 text-white"
            : "bg-emerald-500/90 text-white";

        return (
          <div
            key={favorite.id}
            className="group relative flex flex-col rounded-xl border bg-card overflow-hidden transition-all hover:shadow-lg"
          >
            {/* Image */}
            <Link href={`/court/${court.id}`}>
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
                <Image
                  src={
                    (court.google_photos as { name?: string }[])?.[0]?.name
                      ? `https://places.googleapis.com/v1/${(court.google_photos as { name?: string }[])[0].name}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&maxHeightPx=800&maxWidthPx=800`
                      : court.image_url || "https://images.unsplash.com/photo-1626245353528-77402061e858?q=80&w=2664&auto=format&fit=crop"
                  }
                  alt={court.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2 flex items-center gap-2">
                  <FavoriteButton
                    courtId={court.id}
                    size="sm"
                    onAuthRequired={() => {}}
                  />
                  {court.type && (
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold shadow-sm backdrop-blur-md ${typeColor}`}>
                      {court.type}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Content */}
            <Link href={`/court/${court.id}`} className="flex flex-col p-4">
              <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {court.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs truncate">
                  {court.google_formatted_address || `${court.suburb}${court.region ? `, ${court.region}` : ""}`}
                </span>
              </div>

              {court.google_rating && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-sm text-foreground">
                      {court.google_rating.toFixed(1)}
                    </span>
                  </div>
                  {court.google_user_ratings_total && (
                    <span className="text-xs text-muted-foreground">
                      ({court.google_user_ratings_total.toLocaleString()} reviews)
                    </span>
                  )}
                </div>
              )}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
