"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useFavorites } from "@/lib/contexts/FavoritesContext";
import { toggleFavorite } from "@/lib/supabase/favorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  courtId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  onAuthRequired?: () => void;
}

export function FavoriteButton({
  courtId,
  size = "md",
  className,
  onAuthRequired,
}: FavoriteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { favoriteCourtIds, toggleLocal } = useFavorites();
  const isFavorited = favoriteCourtIds.has(courtId);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      onAuthRequired?.();
      return;
    }
    setIsLoading(true);
    toggleLocal(courtId); // Optimistic update via context
    const result = await toggleFavorite(user.id, courtId);
    if (result.error) {
      toggleLocal(courtId); // Revert on error
    }
    setIsLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "flex items-center justify-center rounded-full transition-all",
        "bg-background/80 backdrop-blur-sm border border-border",
        "hover:bg-background hover:scale-105",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        sizeClasses[size],
        className
      )}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isFavorited ? "filled" : "outline"}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.5 }}
          transition={{ duration: 0.15 }}
        >
          <Heart
            className={cn(
              iconSizes[size],
              "transition-colors",
              isFavorited
                ? "fill-red-500 text-red-500"
                : "text-muted-foreground hover:text-red-500"
            )}
          />
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
