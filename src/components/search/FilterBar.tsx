"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SlidersHorizontal, ChevronDown, X, MapPin, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const COURT_TYPES = ["Indoor", "Outdoor", "Hybrid"] as const;

const FACILITY_OPTIONS = [
  { value: "Wheelchair accessible entrance", label: "Wheelchair Access" },
  { value: "Restrooms", label: "Restrooms" },
  { value: "Free parking lot", label: "Free Parking" },
  { value: "Free street parking", label: "Street Parking" },
  { value: "Accepts credit cards", label: "Card Payment" },
  { value: "Accepts contactless payment", label: "Contactless Payment" },
] as const;

interface FilterBarProps {
  totalCourts: number;
  activeFilters: {
    type: string | null;
    facilities: string[];
    search: { type: string; value: string } | null;
  };
}

export function FilterBar({ totalCourts, activeFilters }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [typeOpen, setTypeOpen] = useState(false);
  const [facilitiesOpen, setFacilitiesOpen] = useState(false);

  const typeRef = useRef<HTMLDivElement>(null);
  const facilitiesRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setTypeOpen(false);
      }
      if (facilitiesRef.current && !facilitiesRef.current.contains(event.target as Node)) {
        setFacilitiesOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const updateFilters = (key: string, value: string | string[] | null) => {
    console.log("updateFilters called:", { key, value });
    const params = new URLSearchParams(searchParams.toString());
    console.log("Current searchParams:", searchParams.toString());

    if (value === null || (Array.isArray(value) && value.length === 0)) {
      params.delete(key);
    } else if (Array.isArray(value)) {
      params.delete(key);
      value.forEach(v => params.append(key, v));
    } else {
      params.set(key, value);
    }

    const newUrl = `/search?${params.toString()}`;
    console.log("Pushing to:", newUrl);
    router.push(newUrl);
    console.log("router.push called");
  };

  const clearAllFilters = () => {
    router.push("/search");
  };

  const toggleFacility = (facility: string) => {
    const current = activeFilters.facilities;
    const updated = current.includes(facility)
      ? current.filter(f => f !== facility)
      : [...current, facility];
    updateFilters("facility", updated);
  };

  const hasAnyFilter = activeFilters.type || activeFilters.facilities.length > 0 || activeFilters.search;

  return (
    <div className="sticky top-16 z-30 w-full bg-background border-b border-border/60 backdrop-blur-sm px-4 md:px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 py-1">
        {/* Filters button with clear all */}
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 rounded-full border-dashed",
            hasAnyFilter && "border-primary text-primary"
          )}
          onClick={hasAnyFilter ? clearAllFilters : undefined}
        >
          <SlidersHorizontal className="mr-2 h-3 w-3" />
          Filters
          {hasAnyFilter && <X className="ml-1 h-3 w-3" />}
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Search filter chip */}
        {activeFilters.search && (
          <Button
            variant="secondary"
            size="sm"
            className="h-8 rounded-full text-xs gap-1"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("q");
              params.delete("suburb");
              params.delete("lat");
              params.delete("lng");
              params.delete("radius");
              router.push(`/search?${params.toString()}`);
            }}
          >
            {activeFilters.search.type === "Near You" && <MapPin className="h-3 w-3" />}
            {activeFilters.search.type}: {activeFilters.search.value}
            <X className="h-3 w-3" />
          </Button>
        )}

        {/* Type filter dropdown */}
        <div ref={typeRef} className="relative">
          <Button
            variant={activeFilters.type ? "secondary" : "outline"}
            size="sm"
            className="h-8 rounded-full text-xs"
            onClick={() => setTypeOpen(!typeOpen)}
          >
            {activeFilters.type || "Any Type"}
            <ChevronDown className={cn("ml-1 h-3 w-3 transition-transform", typeOpen && "rotate-180")} />
          </Button>

          {typeOpen && (
            <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px] z-50">
              <button
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center justify-between text-foreground",
                  !activeFilters.type && "text-primary"
                )}
                onClick={() => {
                  updateFilters("type", null);
                  setTypeOpen(false);
                }}
              >
                Any Type
                {!activeFilters.type && <Check className="h-3 w-3" />}
              </button>
              {COURT_TYPES.map(type => (
                <button
                  type="button"
                  key={type}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center justify-between text-foreground",
                    activeFilters.type === type && "text-primary"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Button clicked:", type);
                    updateFilters("type", type);
                    setTypeOpen(false);
                  }}
                >
                  {type}
                  {activeFilters.type === type && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Facilities filter dropdown */}
        <div ref={facilitiesRef} className="relative">
          <Button
            variant={activeFilters.facilities.length > 0 ? "secondary" : "outline"}
            size="sm"
            className="h-8 rounded-full text-xs"
            onClick={() => setFacilitiesOpen(!facilitiesOpen)}
          >
            Facilities
            {activeFilters.facilities.length > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1.5 text-[10px]">
                {activeFilters.facilities.length}
              </span>
            )}
            <ChevronDown className={cn("ml-1 h-3 w-3 transition-transform", facilitiesOpen && "rotate-180")} />
          </Button>

          {facilitiesOpen && (
            <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[200px] z-50">
              {FACILITY_OPTIONS.map(({ value, label }) => (
                <button
                  type="button"
                  key={value}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center justify-between text-foreground",
                    activeFilters.facilities.includes(value) && "text-primary"
                  )}
                  onClick={() => toggleFacility(value)}
                >
                  {label}
                  {activeFilters.facilities.includes(value) && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Court count and sort */}
      <div className="hidden md:flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {totalCourts} court{totalCourts !== 1 ? "s" : ""} found
        </span>
      </div>
    </div>
  );
}
