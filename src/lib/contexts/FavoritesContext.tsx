"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { getUserFavoriteCourtIds } from "@/lib/supabase/favorites";

interface FavoritesContextType {
  favoriteCourtIds: Set<string>;
  isLoaded: boolean;
  toggleLocal: (courtId: string) => void;
  refresh: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favoriteCourtIds, setFavoriteCourtIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteCourtIds(new Set());
      setIsLoaded(true);
      return;
    }
    const ids = await getUserFavoriteCourtIds(user.id);
    setFavoriteCourtIds(new Set(ids));
    setIsLoaded(true);
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleLocal = useCallback((courtId: string) => {
    setFavoriteCourtIds(prev => {
      const next = new Set(prev);
      if (next.has(courtId)) next.delete(courtId);
      else next.add(courtId);
      return next;
    });
  }, []);

  return (
    <FavoritesContext.Provider value={{ favoriteCourtIds, isLoaded, toggleLocal, refresh: fetchFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
