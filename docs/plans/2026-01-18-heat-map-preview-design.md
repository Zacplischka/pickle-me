# Heat Map Preview Design

## Overview

Replace the placeholder Map CTA section on the homepage with an interactive heat map visualization showing court density across Melbourne. The component renders gradient blobs over a stylized road network, with tooltips and clickable regions for navigation.

## Visual Design

**Heat Visualization:**
- Gradient blobs using classic heat map colors (red → yellow → green → blue)
- Red/yellow for dense court clusters, green/blue for sparse areas
- Blobs overlap and blend for smooth gradients

**Base Map:**
- Melbourne's major road network as faint gray lines
- Freeways (M1, M2, M80) and arterials (Hoddle St, St Kilda Rd, etc.)
- No labels or clutter—just geographic context

**Interactivity:**
- Hover shows tooltip with suburb name and court count
- Click navigates to `/search?suburb={suburb}`

## Technical Implementation

### Component: `HeatMapPreview.tsx`

Location: `src/components/home/HeatMapPreview.tsx`

```tsx
interface HeatMapPreviewProps {
  courts: Court[];
  className?: string;
}
```

Client-side component using Canvas API. No external dependencies.

### Court Aggregation

Courts grouped into ~20x20 spatial grid (~2.5km cells) covering Melbourne's bounding box:
- Longitude: 144.5 to 145.5
- Latitude: -38.1 to -37.5

Heat values by court count per cell:
- 0 courts: no blob
- 1-2 courts: blue
- 3-5 courts: green
- 6-10 courts: yellow
- 11+ courts: red

### Canvas Rendering Pipeline

1. Clear canvas
2. Draw road network (faint gray strokes)
3. For each cell with courts:
   - Map lat/lng to canvas coordinates (simple mercator)
   - Draw radial gradient blob (hot color center, transparent edge)
   - Use `globalCompositeOperation: 'lighter'` for blending
4. Apply gaussian blur for smoothness

### Road Network Data

File: `public/melbourne-roads.json`

Simplified GeoJSON with ~50-100 line segments:
- Major freeways: M1/Monash, M2/Eastern, M80 Ring Road
- Key arterials: Hoddle St, Punt Rd, St Kilda Rd, Sydney Rd, Nepean Hwy

Rendering style:
- Light mode: `rgba(150, 150, 150, 0.3)`
- Dark mode: `rgba(200, 200, 200, 0.2)`
- Stroke width: 1-2px arterials, 2-3px freeways

### Hit Detection & Tooltips

Parallel data structure maps screen regions to suburb metadata.

On mouse move:
1. Get coordinates relative to canvas
2. Find nearest cell with courts (within 30px threshold)
3. Show/hide tooltip accordingly

Tooltip displays:
```
Richmond
8 courts nearby
```

Styled with bg-card, border, shadow. Repositions to stay on-screen.

### Click Navigation

On click:
1. Determine suburb from cell metadata
2. Navigate to `/search?suburb={suburb}` via Next.js router
3. Brief pulse animation before navigation

Suburb mapping: cells tagged with suburb name based on center coordinates, or aggregated from court `suburb` field.

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/home/HeatMapPreview.tsx` | Canvas heat map component |
| `public/melbourne-roads.json` | Simplified road network GeoJSON |

## Files to Modify

| File | Change |
|------|--------|
| `src/app/page.tsx` | Replace Map CTA placeholder (lines 191-225) with HeatMapPreview |

## Integration

Replace the current Map CTA right-side content:

```tsx
<div className="flex-1 w-full relative aspect-video rounded-xl overflow-hidden">
  <HeatMapPreview courts={allCourts} />
</div>
```

## Performance Considerations

- Render once on mount, re-render only on court data change
- Use `devicePixelRatio` for crisp display on retina screens
- Road network paths cached after first render
- No external dependencies—native Canvas APIs only
