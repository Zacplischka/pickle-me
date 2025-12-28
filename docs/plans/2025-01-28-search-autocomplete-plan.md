# Search Autocomplete Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement functional search bars with autocomplete in hero and navbar that help users find pickleball courts.

**Architecture:** Client-side filtering with a shared SearchInput component. Courts data provided via React context to avoid prop drilling. Autocomplete shows mixed courts/suburbs ranked by relevance.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, Lucide icons

---

## Task 1: Create CourtsProvider Context

**Files:**
- Create: `src/lib/contexts/CourtsContext.tsx`

**Step 1: Create the context file**

```tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import { Court } from "@/lib/supabase/database.types";

const CourtsContext = createContext<Court[]>([]);

interface CourtsProviderProps {
  children: ReactNode;
  courts: Court[];
}

export function CourtsProvider({ children, courts }: CourtsProviderProps) {
  return (
    <CourtsContext.Provider value={courts}>
      {children}
    </CourtsContext.Provider>
  );
}

export function useCourts(): Court[] {
  return useContext(CourtsContext);
}
```

**Step 2: Verify file created correctly**

Run: `cat src/lib/contexts/CourtsContext.tsx`
Expected: File contents match above

**Step 3: Commit**

```bash
git add src/lib/contexts/CourtsContext.tsx
git commit -m "feat: add CourtsProvider context for shared courts data"
```

---

## Task 2: Create Suggestion Types

**Files:**
- Create: `src/lib/types/search.ts`

**Step 1: Create the types file**

```tsx
import { Court } from "@/lib/supabase/database.types";

export type CourtSuggestion = {
  type: "court";
  court: Court;
  matchScore: number;
};

export type SuburbSuggestion = {
  type: "suburb";
  suburb: string;
  count: number;
  matchScore: number;
};

export type Suggestion = CourtSuggestion | SuburbSuggestion;

export interface SuburbData {
  suburb: string;
  count: number;
}
```

**Step 2: Verify file created correctly**

Run: `cat src/lib/types/search.ts`
Expected: File contents match above

**Step 3: Commit**

```bash
git add src/lib/types/search.ts
git commit -m "feat: add search suggestion types"
```

---

## Task 3: Create Search Utility Functions

**Files:**
- Create: `src/lib/search.ts`

**Step 1: Create the search utilities file**

```tsx
import { Court } from "@/lib/supabase/database.types";
import { Suggestion, SuburbData } from "@/lib/types/search";

/**
 * Extract unique suburbs with court counts from courts array
 */
export function extractSuburbs(courts: Court[]): SuburbData[] {
  const counts = courts.reduce((acc, court) => {
    const suburb = court.suburb;
    acc[suburb] = (acc[suburb] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts)
    .map(([suburb, count]) => ({ suburb, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculate match score: 0 = starts with (best), 1 = contains
 */
function getMatchScore(text: string, query: string): number | null {
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) return null;

  if (normalizedText.startsWith(normalizedQuery)) return 0;
  if (normalizedText.includes(normalizedQuery)) return 1;
  return null;
}

/**
 * Filter and rank courts and suburbs based on query
 */
export function searchSuggestions(
  courts: Court[],
  suburbs: SuburbData[],
  query: string,
  limit: number = 8
): Suggestion[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    // Return initial suggestions: top suburbs by court count
    const topSuburbs: Suggestion[] = suburbs.slice(0, 4).map((s) => ({
      type: "suburb",
      suburb: s.suburb,
      count: s.count,
      matchScore: 0,
    }));

    // Add top-rated courts if available
    const topCourts: Suggestion[] = courts
      .filter((c) => c.google_rating !== null)
      .sort((a, b) => (b.google_rating || 0) - (a.google_rating || 0))
      .slice(0, 4)
      .map((court) => ({
        type: "court",
        court,
        matchScore: 0,
      }));

    return [...topSuburbs, ...topCourts].slice(0, limit);
  }

  const suggestions: Suggestion[] = [];

  // Match courts by name or suburb
  for (const court of courts) {
    const nameScore = getMatchScore(court.name, normalizedQuery);
    const suburbScore = getMatchScore(court.suburb, normalizedQuery);
    const bestScore = nameScore !== null ? nameScore : suburbScore;

    if (bestScore !== null) {
      suggestions.push({
        type: "court",
        court,
        matchScore: bestScore,
      });
    }
  }

  // Match suburbs
  for (const { suburb, count } of suburbs) {
    const score = getMatchScore(suburb, normalizedQuery);
    if (score !== null) {
      suggestions.push({
        type: "suburb",
        suburb,
        count,
        matchScore: score,
      });
    }
  }

  // Sort by match score, then alphabetically
  return suggestions
    .sort((a, b) => {
      if (a.matchScore !== b.matchScore) return a.matchScore - b.matchScore;
      const aName = a.type === "court" ? a.court.name : a.suburb;
      const bName = b.type === "court" ? b.court.name : b.suburb;
      return aName.localeCompare(bName);
    })
    .slice(0, limit);
}
```

**Step 2: Verify file created correctly**

Run: `cat src/lib/search.ts`
Expected: File contents match above

**Step 3: Commit**

```bash
git add src/lib/search.ts
git commit -m "feat: add search utility functions for filtering suggestions"
```

---

## Task 4: Create SearchInput Component

**Files:**
- Create: `src/components/search/SearchInput.tsx`

**Step 1: Create the SearchInput component**

```tsx
"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, X } from "lucide-react";
import { Court } from "@/lib/supabase/database.types";
import { Suggestion } from "@/lib/types/search";
import { extractSuburbs, searchSuggestions } from "@/lib/search";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  courts: Court[];
  variant: "hero" | "navbar";
  placeholder?: string;
  onClose?: () => void;
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

  const suburbs = useMemo(() => extractSuburbs(courts), [courts]);

  const suggestions = useMemo(
    () => searchSuggestions(courts, suburbs, query),
    [courts, suburbs, query]
  );

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

  const handleSelect = useCallback(
    (suggestion: Suggestion) => {
      if (suggestion.type === "court") {
        // Navigate to search with court selected
        router.push(`/search?court=${suggestion.court.id}`);
      } else {
        // Navigate to search filtered by suburb
        router.push(`/search?suburb=${encodeURIComponent(suggestion.suburb)}`);
      }
      setIsOpen(false);
      setQuery("");
      onClose?.();
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
            ? "w-full max-w-2xl p-2 bg-card/80 backdrop-blur-md border border-border rounded-2xl shadow-2xl flex-col md:flex-row gap-2"
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
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {isHero && (
          <button
            onClick={handleSubmit}
            className="h-12 md:w-auto w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-lg px-8 rounded-xl shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
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
            "absolute z-50 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden",
            isHero ? "w-full max-w-2xl left-0" : "w-72 right-0"
          )}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={
                suggestion.type === "court"
                  ? `court-${suggestion.court.id}`
                  : `suburb-${suggestion.suburb}`
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
                  : "hover:bg-muted/50"
              )}
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
              ) : (
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
              )}
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && query.trim() && suggestions.length === 0 && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute z-50 mt-2 bg-card border border-border rounded-xl shadow-xl p-4 text-center text-muted-foreground",
            isHero ? "w-full max-w-2xl left-0" : "w-72 right-0"
          )}
        >
          No courts or suburbs match &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify file created correctly**

Run: `head -50 src/components/search/SearchInput.tsx`
Expected: Component structure matches above

**Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No type errors

**Step 4: Commit**

```bash
git add src/components/search/SearchInput.tsx
git commit -m "feat: add SearchInput component with autocomplete dropdown"
```

---

## Task 5: Update Root Layout with CourtsProvider

**Files:**
- Modify: `src/app/layout.tsx`

**Step 1: Update layout.tsx to wrap app with CourtsProvider**

Replace the entire file with:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CourtsProvider } from "@/lib/contexts/CourtsContext";
import { getCourts } from "@/lib/data";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pickle Me Victoria | Find Pickleball Courts in VIC",
  description: "The most comprehensive directory of pickleball courts in Victoria, Australia. Find indoor and outdoor courts near you.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const courts = await getCourts();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          "antialiased min-h-screen flex flex-col bg-background font-sans"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CourtsProvider courts={courts}>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </CourtsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Step 2: Run dev server to verify no errors**

Run: `npm run dev &`
Wait 5 seconds, then: `curl -s http://localhost:3000 | head -20`
Expected: HTML response (page loads)

**Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: wrap app with CourtsProvider for shared courts data"
```

---

## Task 6: Update Navbar to Use SearchInput

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

**Step 1: Update Navbar to use SearchInput**

Replace the entire file with:

```tsx
"use client";

import Link from "next/link";
import { Menu, MapPin } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SearchInput } from "@/components/search/SearchInput";
import { useCourts } from "@/lib/contexts/CourtsContext";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const courts = useCourts();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative w-8 h-8 flex items-center justify-center bg-secondary rounded-lg text-secondary-foreground font-bold shadow-sm group-hover:bg-secondary/90 transition-colors">
                        P
                    </div>
                    <span className="font-bold text-xl tracking-tight text-foreground">
                        Pickle Me <span className="text-secondary">Vic</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Find Courts
                    </Link>
                    <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Community
                    </Link>
                    <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Events
                    </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                        <SearchInput courts={courts} variant="navbar" />
                    </div>

                    <div className="hidden md:block">
                        <ThemeToggle />
                    </div>

                    <button className="hidden md:inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                        List a Court
                    </button>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-foreground/80 hover:text-foreground"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-border/40 bg-background"
                    >
                        <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                            <Link
                                href="/search"
                                className="flex items-center gap-2 text-sm font-medium py-2 text-foreground/80"
                                onClick={() => setIsOpen(false)}
                            >
                                <MapPin className="w-4 h-4" />
                                Find Courts
                            </Link>
                            <Link
                                href="#"
                                className="text-sm font-medium py-2 text-foreground/80"
                                onClick={() => setIsOpen(false)}
                            >
                                Community
                            </Link>
                            <Link
                                href="#"
                                className="text-sm font-medium py-2 text-foreground/80"
                                onClick={() => setIsOpen(false)}
                            >
                                Events
                            </Link>
                            <hr className="border-border/40" />
                            <ThemeToggle variant="mobile" />
                            <button className="w-full text-center bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium">
                                List a Court
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
```

**Step 2: Test in browser**

Open: `http://localhost:3000`
Expected: Navbar shows search input, clicking it shows autocomplete dropdown

**Step 3: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat: integrate SearchInput into Navbar"
```

---

## Task 7: Update Hero to Use SearchInput

**Files:**
- Modify: `src/components/home/Hero.tsx`

**Step 1: Update Hero to use SearchInput**

Replace the entire file with:

```tsx
"use client";

import Link from "next/link";
import { SearchInput } from "@/components/search/SearchInput";
import { useCourts } from "@/lib/contexts/CourtsContext";

export function Hero() {
    const courts = useCourts();

    return (
        <section className="relative w-full py-20 md:py-32 lg:py-40 bg-muted overflow-hidden">
            {/* Background Pattern/Image Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/95 to-muted/80 z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1629814407963-c35eb8567179?q=80&w=2670&auto=format')] bg-cover bg-center opacity-20 dark:opacity-40 mix-blend-overlay" />
            </div>

            <div className="container relative z-20 mx-auto px-4 md:px-6 flex flex-col items-center text-center gap-6">
                <div className="inline-flex items-center rounded-full border border-foreground/20 bg-foreground/10 px-3 py-1 text-sm text-foreground backdrop-blur-sm">
                    <span className="flex h-2 w-2 rounded-full bg-secondary mr-2 animate-pulse"></span>
                    Directory Live for 2025
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl">
                    Find Your Next <span className="text-secondary">Pickleball</span> Match in Victoria
                </h1>

                <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
                    The comprehensive directory for indoor & outdoor courts. Find clubs, book sessions, and join the fastest growing sport in Australia.
                </p>

                {/* Search Bar */}
                <div className="w-full max-w-2xl mt-8 flex justify-center">
                    <SearchInput courts={courts} variant="hero" />
                </div>

                <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
                    <span>Popular:</span>
                    <Link
                        href="/search?q=indoor"
                        className="underline decoration-secondary decoration-2 underline-offset-4 cursor-pointer hover:text-foreground"
                    >
                        Indoor Courts
                    </Link>
                    <Link
                        href="/search?suburb=Melbourne"
                        className="underline decoration-secondary decoration-2 underline-offset-4 cursor-pointer hover:text-foreground"
                    >
                        Melbourne
                    </Link>
                    <Link
                        href="/search?q=free"
                        className="underline decoration-secondary decoration-2 underline-offset-4 cursor-pointer hover:text-foreground"
                    >
                        Free to Play
                    </Link>
                </div>
            </div>
        </section>
    );
}
```

**Step 2: Test in browser**

Open: `http://localhost:3000`
Expected: Hero search bar works with autocomplete, popular links navigate correctly

**Step 3: Commit**

```bash
git add src/components/home/Hero.tsx
git commit -m "feat: integrate SearchInput into Hero section"
```

---

## Task 8: Update Search Page to Handle URL Parameters

**Files:**
- Modify: `src/app/search/page.tsx`

**Step 1: Update search page to read and apply URL params**

Replace the entire file with:

```tsx
import { getCourts } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { SearchLayout } from "@/components/search/SearchLayout";
import Link from "next/link";

interface SearchPageProps {
    searchParams: Promise<{
        q?: string;
        suburb?: string;
        court?: string;
    }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const allCourts = await getCourts();

    // Filter courts based on search params
    let filteredCourts = allCourts;
    let activeFilter: { type: string; value: string } | null = null;

    if (params.suburb) {
        filteredCourts = allCourts.filter(
            (court) => court.suburb.toLowerCase() === params.suburb!.toLowerCase()
        );
        activeFilter = { type: "Suburb", value: params.suburb };
    } else if (params.q) {
        const query = params.q.toLowerCase();
        filteredCourts = allCourts.filter(
            (court) =>
                court.name.toLowerCase().includes(query) ||
                court.suburb.toLowerCase().includes(query) ||
                (court.region && court.region.toLowerCase().includes(query))
        );
        activeFilter = { type: "Search", value: params.q };
    }

    // Pre-select court if specified
    const selectedCourtId = params.court || null;

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Filters Header */}
            <div className="sticky top-16 z-30 w-full bg-background border-b border-border/60 backdrop-blur-sm px-4 md:px-6 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    <Button variant="outline" size="sm" className="h-8 rounded-full border-dashed">
                        <SlidersHorizontal className="mr-2 h-3 w-3" /> Filters
                    </Button>

                    {activeFilter && (
                        <>
                            <div className="h-6 w-px bg-border mx-1" />
                            <Link href="/search">
                                <Button variant="secondary" size="sm" className="h-8 rounded-full text-xs gap-1">
                                    {activeFilter.type}: {activeFilter.value}
                                    <X className="h-3 w-3" />
                                </Button>
                            </Link>
                        </>
                    )}

                    {!activeFilter && (
                        <>
                            <div className="h-6 w-px bg-border mx-1" />
                            <Button variant="secondary" size="sm" className="h-8 rounded-full text-xs">
                                Any Type <ChevronDown className="ml-1 h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 rounded-full text-xs bg-background">
                                Price <ChevronDown className="ml-1 h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 rounded-full text-xs bg-background">
                                Facilities <ChevronDown className="ml-1 h-3 w-3" />
                            </Button>
                        </>
                    )}
                </div>
                <div className="hidden md:flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        {filteredCourts.length} court{filteredCourts.length !== 1 ? "s" : ""} found
                    </span>
                    <Button variant="ghost" size="sm" className="h-8">
                        Sort by: Recommended <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Map + Panel Layout */}
            <SearchLayout
                courts={filteredCourts}
                initialSelectedCourtId={selectedCourtId}
            />
        </div>
    );
}
```

**Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: No type errors (may need to update SearchLayout props)

**Step 3: Commit**

```bash
git add src/app/search/page.tsx
git commit -m "feat: add URL param handling for search filtering"
```

---

## Task 9: Update SearchLayout to Accept Initial Selection

**Files:**
- Modify: `src/components/search/SearchLayout.tsx`

**Step 1: Update SearchLayout to accept initialSelectedCourtId prop**

Add the new prop to interface and use it:

```tsx
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Court } from "@/lib/data";
import { CourtListPanel } from "./CourtListPanel";
import { MobileCourtSheet } from "./MobileCourtSheet";
import MapWrapper from "@/components/map/MapWrapper";
import { LatLng, calculateDistance } from "@/lib/utils";

interface SearchLayoutProps {
    courts: Court[];
    initialSelectedCourtId?: string | null;
}

export interface CourtWithDistance extends Court {
    distance?: number;
}

export function SearchLayout({ courts, initialSelectedCourtId }: SearchLayoutProps) {
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [userLocation, setUserLocation] = useState<LatLng | null>(null);
    const [selectedCourtId, setSelectedCourtId] = useState<string | null>(
        initialSelectedCourtId || null
    );

    // Update selection when initialSelectedCourtId changes
    useEffect(() => {
        if (initialSelectedCourtId) {
            setSelectedCourtId(initialSelectedCourtId);
        }
    }, [initialSelectedCourtId]);

    const handleLocationFound = useCallback((location: LatLng) => {
        setUserLocation(location);
    }, []);

    const handleCourtSelect = useCallback((courtId: string) => {
        setSelectedCourtId(courtId);
    }, []);

    const courtsWithDistance = useMemo((): CourtWithDistance[] => {
        if (!userLocation) return courts;

        return courts
            .map((court): CourtWithDistance => {
                if (court.lat !== null && court.lng !== null) {
                    const distance = calculateDistance(userLocation, {
                        lat: court.lat,
                        lng: court.lng,
                    });
                    return { ...court, distance };
                }
                return { ...court, distance: undefined };
            })
            .sort((a, b) => {
                if (a.distance === undefined && b.distance === undefined) return 0;
                if (a.distance === undefined) return 1;
                if (b.distance === undefined) return -1;
                return a.distance - b.distance;
            });
    }, [courts, userLocation]);

    return (
        <div className="relative flex-1 w-full overflow-hidden">
            {/* Full-width Map */}
            <div className="absolute inset-0">
                <MapWrapper
                    courts={courts}
                    onLocationFound={handleLocationFound}
                    selectedCourtId={selectedCourtId}
                    onCourtSelected={setSelectedCourtId}
                />
            </div>

            {/* Desktop: Overlay Court List Panel */}
            <div className="hidden md:block">
                <CourtListPanel
                    key={userLocation ? `${userLocation.lat}-${userLocation.lng}` : "no-location"}
                    courts={courtsWithDistance}
                    isOpen={isPanelOpen}
                    onToggle={() => setIsPanelOpen(!isPanelOpen)}
                    userLocation={userLocation}
                    onCourtSelect={handleCourtSelect}
                    selectedCourtId={selectedCourtId}
                />
            </div>

            {/* Mobile: Bottom Sheet */}
            <div className="md:hidden">
                <MobileCourtSheet
                    key={userLocation ? `mobile-${userLocation.lat}-${userLocation.lng}` : "mobile-no-location"}
                    courts={courtsWithDistance}
                    userLocation={userLocation}
                    onCourtSelect={handleCourtSelect}
                    selectedCourtId={selectedCourtId}
                />
            </div>
        </div>
    );
}
```

**Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: No type errors

**Step 3: Commit**

```bash
git add src/components/search/SearchLayout.tsx
git commit -m "feat: add initialSelectedCourtId prop to SearchLayout"
```

---

## Task 10: Final Testing and Cleanup

**Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: Test all search flows manually**

Test cases:
1. Home page → click hero search → type "mel" → see autocomplete
2. Click suburb in autocomplete → navigate to /search?suburb=X
3. Click court in autocomplete → navigate to /search?court=X
4. Press Enter with text → navigate to /search?q=X
5. Navbar search → same behaviors
6. Popular links in hero → navigate correctly
7. Search page → active filter shows with X to clear

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete search autocomplete implementation

- Add SearchInput component with autocomplete dropdown
- Add CourtsProvider context for shared data
- Integrate search into Hero and Navbar
- Add URL param handling on search page
- Support court/suburb/query filtering"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Create CourtsProvider context | `src/lib/contexts/CourtsContext.tsx` |
| 2 | Create suggestion types | `src/lib/types/search.ts` |
| 3 | Create search utilities | `src/lib/search.ts` |
| 4 | Create SearchInput component | `src/components/search/SearchInput.tsx` |
| 5 | Update root layout | `src/app/layout.tsx` |
| 6 | Update Navbar | `src/components/layout/Navbar.tsx` |
| 7 | Update Hero | `src/components/home/Hero.tsx` |
| 8 | Update search page | `src/app/search/page.tsx` |
| 9 | Update SearchLayout | `src/components/search/SearchLayout.tsx` |
| 10 | Final testing | - |
