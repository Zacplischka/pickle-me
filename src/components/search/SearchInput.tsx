"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, X, Loader2 } from "lucide-react";
import { Court } from "@/lib/supabase/database.types";
import { Suggestion, PlaceSuggestion } from "@/lib/types/search";
import { extractSuburbs, searchSuggestions } from "@/lib/search";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  courts: Court[];
  variant: "hero" | "navbar";
  placeholder?: string;
  onClose?: () => void;
}

interface AutocompletePrediction {
  placeId: string;
  text: string;
  mainText: string;
  secondaryText: string;
  types: string[];
}

export function SearchInput({
  courts,
  variant,
  placeholder = "Suburb, postcode, or court name...",
  onClose,
}: SearchInputProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const suburbs = useMemo(() => extractSuburbs(courts), [courts]);

  // Local court/suburb suggestions
  const localSuggestions = useMemo(
    () => searchSuggestions(courts, suburbs, query, 4),
    [courts, suburbs, query]
  );

  // Fetch place suggestions from Google Places API
  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setPlaceSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setIsLoadingPlaces(true);
      try {
        const response = await fetch(
          `/api/places/autocomplete?input=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal }
        );
        const data = await response.json();

        const places: PlaceSuggestion[] = (data.predictions || [])
          .slice(0, 4)
          .map((p: AutocompletePrediction) => ({
            type: "place" as const,
            placeId: p.placeId,
            mainText: p.mainText,
            secondaryText: p.secondaryText,
            matchScore: 2, // Lower priority than local matches
          }));

        setPlaceSuggestions(places);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Failed to fetch place suggestions:", error);
        }
      } finally {
        setIsLoadingPlaces(false);
      }
    }, 300); // Debounce

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  // Combine local and place suggestions
  const suggestions: Suggestion[] = useMemo(() => {
    if (!query.trim()) {
      return localSuggestions;
    }

    // Filter out place suggestions that match existing suburb names (avoid duplicates)
    const existingSuburbs = new Set(
      localSuggestions
        .filter((s): s is Suggestion & { type: "suburb" } => s.type === "suburb")
        .map((s) => s.suburb.toLowerCase())
    );

    const filteredPlaces = placeSuggestions.filter(
      (p) => !existingSuburbs.has(p.mainText.toLowerCase())
    );

    return [...localSuggestions, ...filteredPlaces].slice(0, 8);
  }, [localSuggestions, placeSuggestions, query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll active suggestion into view
  useEffect(() => {
    if (activeIndex >= 0) {
      const activeElement = document.getElementById(`suggestion-${activeIndex}`);
      activeElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeIndex]);

  const handleSelect = useCallback(
    async (suggestion: Suggestion) => {
      if (suggestion.type === "court") {
        router.push(`/search?court=${suggestion.court.id}`);
        setIsOpen(false);
        setQuery("");
        onClose?.();
      } else if (suggestion.type === "suburb") {
        router.push(`/search?suburb=${encodeURIComponent(suggestion.suburb)}`);
        setIsOpen(false);
        setQuery("");
        onClose?.();
      } else if (suggestion.type === "place") {
        // Fetch coordinates for the place and navigate with lat/lng
        setIsNavigating(true);
        try {
          const response = await fetch(
            `/api/places/details?placeId=${suggestion.placeId}`
          );
          const data = await response.json();

          if (data.place) {
            router.push(
              `/search?lat=${data.place.lat}&lng=${data.place.lng}&location=${encodeURIComponent(suggestion.mainText)}`
            );
          } else {
            // Fallback to text search
            router.push(`/search?q=${encodeURIComponent(suggestion.mainText)}`);
          }
        } catch (error) {
          console.error("Failed to fetch place details:", error);
          router.push(`/search?q=${encodeURIComponent(suggestion.mainText)}`);
        } finally {
          setIsNavigating(false);
          setIsOpen(false);
          setQuery("");
          onClose?.();
        }
      }
    },
    [router, onClose]
  );

  const handleSubmit = useCallback(() => {
    if (activeIndex >= 0 && activeIndex < suggestions.length) {
      handleSelect(suggestions[activeIndex]);
    } else if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
      onClose?.();
    }
  }, [activeIndex, suggestions, query, router, handleSelect, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          setIsOpen(true);
          return;
        }
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          handleSubmit();
          break;
        case "Escape":
          setIsOpen(false);
          setActiveIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, suggestions.length, handleSubmit]
  );

  const isHero = variant === "hero";

  return (
    <div className={cn("relative", isHero ? "w-full" : "")}>
      <div
        className={cn(
          "flex items-center",
          isHero
            ? "w-full flex-col md:flex-row gap-2"
            : "px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-full transition-colors"
        )}
      >
        <div
          className={cn(
            "relative flex items-center",
            isHero ? "flex-1 w-full" : ""
          )}
        >
          <MapPin
            className={cn(
              "absolute text-muted-foreground",
              isHero ? "left-4 w-5 h-5" : "left-2 w-4 h-4"
            )}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
              if (e.target.value.trim()) {
                setIsOpen(true);
              }
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={isHero ? placeholder : "Search courts..."}
            className={cn(
              "bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0",
              isHero
                ? "w-full h-12 pl-12 pr-4 text-lg"
                : "w-48 h-8 pl-8 pr-2 text-sm"
            )}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls="search-suggestions"
            aria-activedescendant={
              activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
            }
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className={cn(
                "absolute text-muted-foreground hover:text-foreground",
                isHero ? "right-4" : "right-2"
              )}
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {isHero && (
          <button
            onClick={handleSubmit}
            className="h-12 md:w-auto w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-lg px-8 rounded-xl shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
            aria-label="Search for courts"
          >
            <Search className="w-5 h-5" />
            Find Courts
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          id="search-suggestions"
          role="listbox"
          className={cn(
            "absolute z-[100] mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden",
            isHero ? "w-full max-w-2xl left-0" : "w-72 right-0"
          )}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={
                suggestion.type === "court"
                  ? `court-${suggestion.court.id}`
                  : suggestion.type === "suburb"
                    ? `suburb-${suggestion.suburb}`
                    : `place-${suggestion.placeId}`
              }
              id={`suggestion-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                "w-full px-4 py-3 flex items-center gap-3 text-left transition-colors",
                index === activeIndex
                  ? "bg-muted"
                  : "hover:bg-muted/50",
                isNavigating && "opacity-50 pointer-events-none"
              )}
              disabled={isNavigating}
            >
              {suggestion.type === "court" ? (
                <>
                  <span className="text-lg">🏸</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {suggestion.court.name}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {suggestion.court.suburb}
                    </div>
                  </div>
                </>
              ) : suggestion.type === "suburb" ? (
                <>
                  <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">
                      {suggestion.suburb}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {suggestion.count} court{suggestion.count !== 1 ? "s" : ""}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5 text-secondary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">
                      {suggestion.mainText}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {suggestion.secondaryText}
                    </div>
                  </div>
                </>
              )}
            </button>
          ))}
          {isLoadingPlaces && query.trim().length >= 2 && (
            <div className="px-4 py-3 flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Searching locations...</span>
            </div>
          )}
        </div>
      )}

      {/* No results message */}
      {isOpen && query.trim() && suggestions.length === 0 && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute z-[100] mt-2 bg-card border border-border rounded-xl shadow-xl p-4 text-center text-muted-foreground",
            isHero ? "w-full max-w-2xl left-0" : "w-72 right-0"
          )}
        >
          No courts or suburbs match &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
