# Leaflet Heat Map Preview Design

## Overview

Replace the Canvas-based HeatMapPreview with a Leaflet-based component that renders a real map of Melbourne with a heat layer overlay showing court density.

## Visual Design

**Map Base:**
- Real Melbourne map using CARTO Voyager tiles (consistent with main /search map)
- Centered on Melbourne CBD at zoom level 10 (shows greater Melbourne area)

**Heat Layer:**
- Heat overlay using `leaflet.heat` plugin
- Each court location is a heat point
- Plugin automatically blends nearby points into gradient (red = dense, blue = sparse)

**Interactivity:**
- Pan and zoom within the preview
- Click on map → determines nearest suburb → navigates to `/search?suburb={suburb}`

## Technical Implementation

### Dependencies

New package required:
```bash
npm install leaflet.heat
npm install -D @types/leaflet.heat
```

### Component: `LeafletHeatMapPreview.tsx`

Location: `src/components/home/LeafletHeatMapPreview.tsx`

```tsx
interface LeafletHeatMapPreviewProps {
  courts: Court[];
  className?: string;
}
```

### Heat Layer Data

Courts converted to heat points:
```typescript
const heatData = courts
  .filter(c => c.lat && c.lng)
  .map(c => [c.lat, c.lng, 0.5] as [number, number, number]);
```

### Map Configuration

- Center: `[-37.8136, 144.9631]` (Melbourne CBD)
- Zoom: 10
- Tiles: CARTO Voyager
- Scroll wheel zoom: enabled
- Zoom control: hidden (cleaner preview)

### Click Handling

1. Get clicked coordinates from map click event
2. Look up suburb using `getSuburbForCoordinate()` from `src/lib/suburbs.ts`
3. Navigate to `/search?suburb={suburb}` or `/search` if no suburb matched

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/home/LeafletHeatMapPreview.tsx` | New Leaflet-based heat map component |

## Files to Modify

| File | Change |
|------|--------|
| `src/app/page.tsx` | Update import to use LeafletHeatMapPreview |

## Files to Delete

| File | Reason |
|------|--------|
| `src/components/home/HeatMapPreview.tsx` | Replaced by Leaflet version |
| `public/melbourne-roads.json` | No longer needed (using real map tiles) |

## Files to Keep

| File | Reason |
|------|--------|
| `src/lib/suburbs.ts` | Still used for click-to-suburb lookup |
