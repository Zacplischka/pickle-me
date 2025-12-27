# Search Page Map Layout Redesign - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Find Courts (`/search`) page layout so the map takes up significantly more screen real estate instead of being confined to a narrow side panel.

**Architecture:** Switch from a 2-column layout (list + narrow map sidebar) to a map-primary layout with an overlay or collapsible court list panel. The map will fill the viewport height minus the header and filter bar, while the court list becomes a scrollable overlay panel that can be expanded/collapsed.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, Leaflet (via existing MapWrapper)

---

## Current State Analysis

The current layout in `src/app/search/page.tsx`:
- **List**: `flex-1` taking most horizontal space with a grid of CourtCards
- **Map**: Fixed width `w-[400px] xl:w-[500px]` on the right, hidden below `lg` breakpoint
- **Problem**: Map is squeezed into 400-500px, making it hard to explore court locations

## Proposed Layout

**New Design:**
1. Map fills the entire content area (below filters header)
2. Court list becomes an overlay panel on the left side
3. Panel is collapsible with a toggle button
4. Mobile: Full map with a bottom sheet for courts

---

### Task 1: Create Court List Panel Component

**Files:**
- Create: `src/components/search/CourtListPanel.tsx`

**Step 1: Create the panel component**

```tsx
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Court } from "@/lib/data";
import { CourtCard } from "@/components/CourtCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface CourtListPanelProps {
    courts: Court[];
    isOpen: boolean;
    onToggle: () => void;
}

export function CourtListPanel({ courts, isOpen, onToggle }: CourtListPanelProps) {
    return (
        <>
            {/* Panel */}
            <div
                className={cn(
                    "absolute top-0 left-0 h-full bg-background border-r border-border shadow-lg transition-transform duration-300 z-20",
                    "w-[380px] lg:w-[420px]",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Panel Header */}
                <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between z-10">
                    <div>
                        <h2 className="font-semibold text-foreground">Courts</h2>
                        <p className="text-sm text-muted-foreground">{courts.length} results</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onToggle}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Scrollable Court List */}
                <div className="h-[calc(100%-73px)] overflow-y-auto p-4 space-y-4">
                    {courts.map((court) => (
                        <CourtCard key={court.id} court={court} />
                    ))}
                </div>
            </div>

            {/* Toggle Button (visible when panel is closed) */}
            {!isOpen && (
                <button
                    onClick={onToggle}
                    className="absolute top-4 left-4 z-20 bg-background border border-border rounded-lg shadow-lg px-3 py-2 flex items-center gap-2 hover:bg-muted transition-colors"
                >
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-sm font-medium">Show {courts.length} courts</span>
                </button>
            )}
        </>
    );
}
```

**Step 2: Verify file created correctly**

Run: `cat src/components/search/CourtListPanel.tsx | head -20`
Expected: First 20 lines of the component

**Step 3: Commit**

```bash
git add src/components/search/CourtListPanel.tsx
git commit -m "feat: add CourtListPanel component for overlay court list"
```

---

### Task 2: Create Search Page Layout Wrapper

**Files:**
- Create: `src/components/search/SearchLayout.tsx`

**Step 1: Create the layout wrapper component**

```tsx
"use client";

import { useState } from "react";
import { Court } from "@/lib/data";
import { CourtListPanel } from "./CourtListPanel";
import MapWrapper from "@/components/map/MapWrapper";

interface SearchLayoutProps {
    courts: Court[];
}

export function SearchLayout({ courts }: SearchLayoutProps) {
    const [isPanelOpen, setIsPanelOpen] = useState(true);

    return (
        <div className="relative flex-1 w-full h-full">
            {/* Full-width Map */}
            <div className="absolute inset-0">
                <MapWrapper courts={courts} />
            </div>

            {/* Overlay Court List Panel */}
            <CourtListPanel
                courts={courts}
                isOpen={isPanelOpen}
                onToggle={() => setIsPanelOpen(!isPanelOpen)}
            />
        </div>
    );
}
```

**Step 2: Verify file created correctly**

Run: `cat src/components/search/SearchLayout.tsx`
Expected: Full component code

**Step 3: Commit**

```bash
git add src/components/search/SearchLayout.tsx
git commit -m "feat: add SearchLayout wrapper for map-primary design"
```

---

### Task 3: Update Search Page to Use New Layout

**Files:**
- Modify: `src/app/search/page.tsx`

**Step 1: Update the search page**

Replace the entire content section (lines 37-58) with the new layout. The updated file should be:

```tsx
import { getCourts } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { SearchLayout } from "@/components/search/SearchLayout";

export default async function SearchPage() {
    const courts = await getCourts();

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Filters Header */}
            <div className="sticky top-16 z-30 w-full bg-background border-b border-border/60 backdrop-blur-sm px-4 md:px-6 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    <Button variant="outline" size="sm" className="h-8 rounded-full border-dashed">
                        <SlidersHorizontal className="mr-2 h-3 w-3" /> Filters
                    </Button>
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
                </div>
                <div className="hidden md:flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{courts.length} courts found</span>
                    <Button variant="ghost" size="sm" className="h-8">
                        Sort by: Recommended <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Map + Panel Layout */}
            <SearchLayout courts={courts} />
        </div>
    );
}
```

**Step 2: Run dev server to test**

Run: `npm run dev`
Expected: Server starts without errors

**Step 3: Commit**

```bash
git add src/app/search/page.tsx
git commit -m "feat: update search page to use map-primary layout"
```

---

### Task 4: Create Compact Court Card Variant

**Files:**
- Modify: `src/components/CourtCard.tsx`

**Step 1: Add compact variant prop**

Update CourtCard to accept a `variant` prop for a compact display in the panel. Add to the interface:

```tsx
interface CourtCardProps {
    court: Court;
    variant?: "default" | "compact";
}
```

**Step 2: Implement compact styling**

Wrap the existing card in a conditional. For compact variant:
- Reduce image aspect ratio to `aspect-[3/2]`
- Reduce padding from `p-5` to `p-3`
- Hide features section
- Make buttons smaller

Add at the start of the component function:

```tsx
const isCompact = variant === "compact";
```

Then conditionally apply classes throughout:
- Image: `className={cn("w-full overflow-hidden bg-muted relative", isCompact ? "aspect-[3/2]" : "aspect-[4/3]")}`
- Content padding: `className={cn("flex flex-1 flex-col gap-3", isCompact ? "p-3" : "p-5")}`
- Hide features in compact: `{!isCompact && <div className="flex flex-wrap...">...</div>}`

**Step 3: Update CourtListPanel to use compact variant**

In `src/components/search/CourtListPanel.tsx`, update the CourtCard usage:

```tsx
<CourtCard key={court.id} court={court} variant="compact" />
```

**Step 4: Test the compact cards**

Run: `npm run dev`
Navigate to `/search` and verify compact cards render correctly in the panel.

**Step 5: Commit**

```bash
git add src/components/CourtCard.tsx src/components/search/CourtListPanel.tsx
git commit -m "feat: add compact variant to CourtCard for panel display"
```

---

### Task 5: Add Mobile Bottom Sheet

**Files:**
- Create: `src/components/search/MobileCourtSheet.tsx`
- Modify: `src/components/search/SearchLayout.tsx`

**Step 1: Create mobile bottom sheet component**

```tsx
"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, GripHorizontal } from "lucide-react";
import { Court } from "@/lib/data";
import { CourtCard } from "@/components/CourtCard";
import { cn } from "@/lib/utils";

interface MobileCourtSheetProps {
    courts: Court[];
}

export function MobileCourtSheet({ courts }: MobileCourtSheetProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className={cn(
                "absolute bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-2xl shadow-lg transition-all duration-300 z-20",
                isExpanded ? "h-[70vh]" : "h-[120px]"
            )}
        >
            {/* Handle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex flex-col items-center py-3 border-b border-border/60"
            >
                <GripHorizontal className="h-5 w-5 text-muted-foreground mb-1" />
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{courts.length} courts</span>
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
            </button>

            {/* Scrollable Content */}
            <div className={cn(
                "overflow-y-auto p-4 space-y-3",
                isExpanded ? "h-[calc(70vh-60px)]" : "h-[60px]"
            )}>
                {courts.slice(0, isExpanded ? undefined : 2).map((court) => (
                    <CourtCard key={court.id} court={court} variant="compact" />
                ))}
            </div>
        </div>
    );
}
```

**Step 2: Update SearchLayout to include mobile sheet**

Update `src/components/search/SearchLayout.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Court } from "@/lib/data";
import { CourtListPanel } from "./CourtListPanel";
import { MobileCourtSheet } from "./MobileCourtSheet";
import MapWrapper from "@/components/map/MapWrapper";

interface SearchLayoutProps {
    courts: Court[];
}

export function SearchLayout({ courts }: SearchLayoutProps) {
    const [isPanelOpen, setIsPanelOpen] = useState(true);

    return (
        <div className="relative flex-1 w-full h-full">
            {/* Full-width Map */}
            <div className="absolute inset-0">
                <MapWrapper courts={courts} />
            </div>

            {/* Desktop: Overlay Court List Panel */}
            <div className="hidden md:block">
                <CourtListPanel
                    courts={courts}
                    isOpen={isPanelOpen}
                    onToggle={() => setIsPanelOpen(!isPanelOpen)}
                />
            </div>

            {/* Mobile: Bottom Sheet */}
            <div className="md:hidden">
                <MobileCourtSheet courts={courts} />
            </div>
        </div>
    );
}
```

**Step 3: Test on mobile viewport**

Run: `npm run dev`
Open DevTools, toggle to mobile viewport, verify bottom sheet works.

**Step 4: Commit**

```bash
git add src/components/search/MobileCourtSheet.tsx src/components/search/SearchLayout.tsx
git commit -m "feat: add mobile bottom sheet for court list"
```

---

### Task 6: Final Testing and Polish

**Files:**
- May modify: Any files from previous tasks

**Step 1: Run linting**

Run: `npm run lint`
Expected: No errors (fix any that appear)

**Step 2: Test all viewport sizes**

- Desktop (1920px+): Map fills space, panel overlay on left
- Tablet (768px-1024px): Same as desktop
- Mobile (<768px): Full map with bottom sheet

**Step 3: Verify map interactions**

- Scroll/zoom works on map
- Panel/sheet doesn't block map interactions
- Court markers are clickable
- "Use My Location" button still works

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: polish search page map layout"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Create CourtListPanel component | `src/components/search/CourtListPanel.tsx` |
| 2 | Create SearchLayout wrapper | `src/components/search/SearchLayout.tsx` |
| 3 | Update search page | `src/app/search/page.tsx` |
| 4 | Add compact CourtCard variant | `src/components/CourtCard.tsx` |
| 5 | Add mobile bottom sheet | `src/components/search/MobileCourtSheet.tsx` |
| 6 | Final testing and polish | Various |

**Total commits:** 6
**Estimated complexity:** Medium
