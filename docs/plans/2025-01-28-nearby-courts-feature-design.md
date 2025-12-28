# Nearby Courts Feature Design

## Overview

Add a "Near Me" feature to the Hero section that allows users to quickly find pickleball courts near their location with an adjustable radius, reducing friction for location-based discovery.

## User Flow

1. User lands on homepage and sees the Hero with two CTA buttons: **"Find Courts"** (existing search) and **"Near Me"** (new)

2. User clicks **"Near Me"** → browser requests location permission

3. Once location is granted:
   - A **side drawer** slides in from the right
   - Shows a **radius slider** (default 10km, range 1-50km)
   - Displays **top 5 closest courts** within that radius, sorted by distance
   - Each court card shows: name, suburb, distance (e.g., "2.3 km"), rating
   - A **"See all on map"** button at the bottom

4. User drags slider → on release, list updates with courts in new radius

5. User can:
   - Click a court → navigates to `/search?court={id}` with map centered on it
   - Click "See all on map" → navigates to `/search?lat={lat}&lng={lng}&radius={radius}`
   - Close drawer → returns to normal Hero state

## Component Architecture

### New Components

**`NearbyDrawer`** (`src/components/home/NearbyDrawer.tsx`)
- Slide-in drawer from right
- Props: `isOpen`, `onClose`, `userLocation`, `courts`
- Contains the radius slider and court list
- Handles distance calculations client-side

**`RadiusSlider`** (`src/components/ui/RadiusSlider.tsx`)
- Range input styled to match design system
- Props: `value`, `onChange`, `min` (1), `max` (50)
- Shows current value label (e.g., "10 km")

**`NearbyCourtCard`** (`src/components/home/NearbyCourtCard.tsx`)
- Compact court card for the drawer
- Shows: name, suburb, distance badge, rating stars
- Clickable → navigates to search page with court selected

### Modified Components

**`Hero.tsx`**
- Add "Near Me" button next to existing search button
- Manage `userLocation` and `drawerOpen` state
- Handle geolocation request

### Utility Addition

- Add `calculateDistance(lat1, lng1, lat2, lng2)` to `src/lib/utils.ts` using Haversine formula

## Data Flow

### Location Acquisition

1. Hero calls `navigator.geolocation.getCurrentPosition()`
2. On success → stores `{ lat, lng }` in component state
3. On error → shows inline message below button

### Court Filtering (client-side)

1. `NearbyDrawer` receives all courts from `useCourts()` context
2. Filters to courts with valid `lat`/`lng` coordinates
3. Calculates distance from user to each court using Haversine
4. Filters courts within selected radius
5. Sorts by distance ascending
6. Takes top 5 for display

### Navigation URLs

- Single court: `/search?court={courtId}`
- All nearby: `/search?lat={lat}&lng={lng}&radius={radius}`

### Search Page Enhancement

The `/search` page will read `lat`, `lng`, `radius` URL params and:
- Center map on user location
- Filter/sort courts by distance

## Error Handling

| Scenario | User Feedback |
|----------|---------------|
| Permission denied | "Location access denied. Please enable it in your browser settings." |
| Position unavailable | "Unable to determine your location. Try again or search by suburb." |
| Timeout | "Location request timed out. Please try again." |
| Browser unsupported | "Your browser doesn't support location services." |
| No courts in radius | "No courts found within {X} km. Try increasing your radius." |

Display errors as inline message below the "Near Me" button.

### Loading States

- "Near Me" button shows spinner + "Locating..." while acquiring position
- Drawer shows skeleton cards while calculating (likely instant)

## Files to Change

### Create
- `src/components/home/NearbyDrawer.tsx`
- `src/components/home/NearbyCourtCard.tsx`
- `src/components/ui/RadiusSlider.tsx`

### Modify
- `src/components/home/Hero.tsx` — add "Near Me" button, geolocation logic, drawer state
- `src/lib/utils.ts` — add `calculateDistance()` Haversine function
- `src/app/search/page.tsx` — read `lat`/`lng`/`radius` params, filter by distance
- `src/components/search/SearchLayout.tsx` — support location-based filtering

## Dependencies

No new packages needed. Uses native browser geolocation API and standard React state.

## Out of Scope

- Radius circle visualization on map
- Saving user's last location/radius preference
- "Recenter on me" button in the drawer
