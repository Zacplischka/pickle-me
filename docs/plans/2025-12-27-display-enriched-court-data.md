# Display Enriched Court Data Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the frontend components to display Google Places enriched data (ratings, reviews count, phone, website, opening hours, photos) that is already in the database.

**Architecture:** The database already contains enriched fields (`google_rating`, `google_user_ratings_total`, `google_phone`, `google_website`, `google_opening_hours`, `google_photos`). The queries already fetch all columns (`select("*")`). We need to update the UI components to render this data.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Leaflet, lucide-react icons

---

## Task 1: Update CourtCard to Display Google Rating

**Files:**
- Modify: `src/components/CourtCard.tsx:56-69`

**Step 1: Add rating display below the name/location section**

Replace the grid section (lines 56-69) to include rating before surface/courts info:

```tsx
{/* Rating Section */}
{court.google_rating && (
    <div className="flex items-center gap-2 mt-2">
        <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-sm">{court.google_rating.toFixed(1)}</span>
        </div>
        {court.google_user_ratings_total && (
            <span className="text-xs text-muted-foreground">
                ({court.google_user_ratings_total.toLocaleString()} reviews)
            </span>
        )}
    </div>
)}

<div className="grid grid-cols-2 gap-2 my-1">
    {court.surface && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1.5 rounded-md">
            <Trophy className="w-3.5 h-3.5 text-accent" />
            <span>{court.surface}</span>
        </div>
    )}
    {court.courts_count && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1.5 rounded-md">
            <Users className="w-3.5 h-3.5 text-secondary" />
            <span>{court.courts_count} Courts</span>
        </div>
    )}
</div>
```

**Step 2: Add Star import at the top of the file**

Add `Star` to the lucide-react imports:

```tsx
import { MapPin, Trophy, Users, Info, Star } from "lucide-react";
```

**Step 3: Verify the changes compile**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors

**Step 4: Commit**

```bash
git add src/components/CourtCard.tsx
git commit -m "feat: display Google rating and review count in CourtCard"
```

---

## Task 2: Add Phone and Website Links to CourtCard

**Files:**
- Modify: `src/components/CourtCard.tsx`

**Step 1: Add contact info section after features, before buttons**

Insert after the features section (around line 82) and before the button section:

```tsx
{/* Contact Links */}
{(court.google_phone || court.google_website || court.website) && (
    <div className="flex items-center gap-3 text-xs">
        {court.google_phone && (
            <a
                href={`tel:${court.google_phone}`}
                className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
            </a>
        )}
        {(court.google_website || court.website) && (
            <a
                href={court.google_website || court.website || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                <Globe className="w-3.5 h-3.5" />
                <span>Website</span>
            </a>
        )}
    </div>
)}
```

**Step 2: Add Phone and Globe imports**

Update the lucide-react import line:

```tsx
import { MapPin, Trophy, Users, Info, Star, Phone, Globe } from "lucide-react";
```

**Step 3: Verify the changes compile**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors

**Step 4: Commit**

```bash
git add src/components/CourtCard.tsx
git commit -m "feat: add phone and website links to CourtCard"
```

---

## Task 3: Update Map Popup to Show Rating

**Files:**
- Modify: `src/components/map/Map.tsx:88-99`

**Step 1: Update the Popup content to include rating**

Replace the Popup content (lines 88-99):

```tsx
<Popup className="font-sans">
    <div className="p-1 min-w-[200px]">
        <h3 className="font-bold text-sm mb-1">{court.name}</h3>
        <p className="text-xs text-muted-foreground mb-2">{court.suburb}</p>
        <div className="flex items-center gap-2 mb-2">
            {court.type && (
                <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full font-medium">
                    {court.type}
                </span>
            )}
            {court.google_rating && (
                <span className="text-xs flex items-center gap-1">
                    <span className="text-amber-500">★</span>
                    {court.google_rating.toFixed(1)}
                </span>
            )}
        </div>
        {court.google_phone && (
            <a
                href={`tel:${court.google_phone}`}
                className="text-xs text-primary hover:underline block"
            >
                {court.google_phone}
            </a>
        )}
    </div>
</Popup>
```

**Step 2: Verify the changes compile**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors

**Step 3: Commit**

```bash
git add src/components/map/Map.tsx
git commit -m "feat: display rating and phone in map popup"
```

---

## Task 4: Update getFeaturedCourts to Prioritize High-Rated Courts

**Files:**
- Modify: `src/lib/supabase/queries.ts:20-35`

**Step 1: Update the query to order by rating**

Replace the `getFeaturedCourts` function:

```typescript
export async function getFeaturedCourts(limit = 3): Promise<Court[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .not("image_url", "is", null)
    .not("google_rating", "is", null)
    .order("google_rating", { ascending: false })
    .order("google_user_ratings_total", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching featured courts:", error);
    return [];
  }

  return data || [];
}
```

**Step 2: Verify the changes compile**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors

**Step 3: Test the query manually (optional)**

Run: `npm run dev`
Visit: http://localhost:3000
Expected: Featured courts section shows highest-rated courts with ratings visible

**Step 4: Commit**

```bash
git add src/lib/supabase/queries.ts
git commit -m "feat: prioritize high-rated courts in featured section"
```

---

## Task 5: Create Opening Hours Display Component

**Files:**
- Create: `src/components/OpeningHours.tsx`

**Step 1: Create the component file**

```tsx
"use client";

import { Clock } from "lucide-react";
import { useState } from "react";

interface OpeningHoursProps {
    hours: {
        weekday_text?: string[];
    } | null;
}

export function OpeningHours({ hours }: OpeningHoursProps) {
    const [expanded, setExpanded] = useState(false);

    if (!hours?.weekday_text?.length) {
        return null;
    }

    const today = new Date().getDay();
    // Google returns Sunday as first (0), but weekday_text starts with Monday
    const todayIndex = today === 0 ? 6 : today - 1;
    const todayHours = hours.weekday_text[todayIndex];

    return (
        <div className="text-xs">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
                <Clock className="w-3.5 h-3.5" />
                <span className="font-medium">
                    {todayHours?.replace(/^\w+:\s*/, "") || "Hours unavailable"}
                </span>
                <span className="text-[10px]">{expanded ? "▲" : "▼"}</span>
            </button>
            {expanded && (
                <div className="mt-2 pl-5 space-y-0.5 text-muted-foreground">
                    {hours.weekday_text.map((day, i) => (
                        <div
                            key={i}
                            className={i === todayIndex ? "font-semibold text-foreground" : ""}
                        >
                            {day}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
```

**Step 2: Verify the changes compile**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors

**Step 3: Commit**

```bash
git add src/components/OpeningHours.tsx
git commit -m "feat: create OpeningHours component"
```

---

## Task 6: Add Opening Hours to CourtCard

**Files:**
- Modify: `src/components/CourtCard.tsx`

**Step 1: Import the OpeningHours component**

Add import at the top:

```tsx
import { OpeningHours } from "@/components/OpeningHours";
```

**Step 2: Add opening hours after contact links section**

Insert after the contact links section, before the buttons:

```tsx
{/* Opening Hours */}
{court.google_opening_hours && (
    <div className="mt-2">
        <OpeningHours hours={court.google_opening_hours as { weekday_text?: string[] }} />
    </div>
)}
```

**Step 3: Verify the changes compile**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors

**Step 4: Commit**

```bash
git add src/components/CourtCard.tsx
git commit -m "feat: add opening hours to CourtCard"
```

---

## Task 7: Use Google Photos When Available

**Files:**
- Modify: `src/components/CourtCard.tsx:21-24`

**Step 1: Update image source logic to prefer Google photos**

Replace the image src logic (around line 23):

```tsx
{/* Image Section */}
<div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
    <img
        src={
            (court.google_photos as { photo_reference?: string }[])?.[0]?.photo_reference
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${(court.google_photos as { photo_reference?: string }[])[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`
                : court.image_url || "https://images.unsplash.com/photo-1626245353528-77402061e858?q=80&w=2664&auto=format&fit=crop"
        }
        alt={court.name}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
    />
```

**NOTE:** This requires `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` environment variable. If not available, fall back to simpler approach in Step 1b.

**Step 1b (Alternative): Simple fallback without Google Photos API**

If the API key is not available client-side, skip this task or just use the existing `image_url` which may already contain a processed URL.

**Step 2: Verify the changes compile**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors

**Step 3: Commit (if changes made)**

```bash
git add src/components/CourtCard.tsx
git commit -m "feat: prefer Google photos when available"
```

---

## Task 8: Add Formatted Address Display

**Files:**
- Modify: `src/components/CourtCard.tsx:47-54`

**Step 1: Update address display to use Google formatted address when available**

Update the address section:

```tsx
<div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
    <span className="text-xs font-medium truncate">
        {court.google_formatted_address || `${court.suburb}${court.region ? `, ${court.region}` : ""}`}
    </span>
</div>
```

**Step 2: Verify the changes compile**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors

**Step 3: Commit**

```bash
git add src/components/CourtCard.tsx
git commit -m "feat: use Google formatted address when available"
```

---

## Task 9: Final Integration Test

**Files:**
- None (testing only)

**Step 1: Start development server**

Run: `npm run dev`
Expected: Server starts at http://localhost:3000

**Step 2: Verify home page**

Visit: http://localhost:3000
Expected:
- Featured courts show ratings with stars
- Recent courts show ratings
- All cards show phone/website links where available
- Opening hours expandable

**Step 3: Verify search page**

Visit: http://localhost:3000/search
Expected:
- All court cards display enriched data
- Map popups show ratings and phone numbers

**Step 4: Verify build**

Run: `npm run build`
Expected: Production build succeeds with no errors

**Step 5: Final commit (if any cleanup needed)**

```bash
git add .
git commit -m "chore: final cleanup for enriched court data display"
```

---

## Summary of Changes

| File | Changes |
|------|---------|
| `src/components/CourtCard.tsx` | Added rating, phone, website, opening hours, Google address |
| `src/components/map/Map.tsx` | Added rating and phone to popup |
| `src/lib/supabase/queries.ts` | Updated featured courts to prioritize by rating |
| `src/components/OpeningHours.tsx` | New component for expandable hours display |

## Environment Variables Required

Ensure `.env.local` contains:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Optional (for Google Photos):
```
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=...
```
