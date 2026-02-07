"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import { Court } from "@/lib/supabase/database.types";

const CourtsContext = createContext<Court[] | undefined>(undefined);

interface CourtsProviderProps {
  children: ReactNode;
  courts: Court[];
}

export function CourtsProvider({ children, courts }: CourtsProviderProps) {
  const value = useMemo(() => courts, [courts]);
  return (
    <CourtsContext.Provider value={value}>
      {children}
    </CourtsContext.Provider>
  );
}

export function useCourts(): Court[] {
  const context = useContext(CourtsContext);
  return context ?? [];
}
