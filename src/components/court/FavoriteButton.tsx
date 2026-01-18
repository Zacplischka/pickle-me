"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/contexts/AuthContext";
import { toggleFavorite, checkIsFavorited } from "@/lib/supabase/favorites";
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
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { user } = useAuth();

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

  useEffect(() => {
    async function checkFavorite() {
      if (user) {
        const favorited = await checkIsFavorited(user.id, courtId);
        setIsFavorited(favorited);
      }
    }
    checkFavorite();
  }, [user, courtId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      onAuthRequired?.();
      return;
    }

    setIsLoading(true);
    setIsAnimating(true);

    // Optimistic update
    const previousState = isFavorited;
    setIsFavorited(!isFavorited);

    const result = await toggleFavorite(user.id, courtId);

    if (result.error) {
      // Revert on error
      setIsFavorited(previousState);
    } else {
      setIsFavorited(result.isFavorited);
    }

    setIsLoading(false);
    setTimeout(() => setIsAnimating(false), 300);
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
          initial={isAnimating ? { scale: 0.5 } : false}
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
