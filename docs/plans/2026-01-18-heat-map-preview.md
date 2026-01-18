# Heat Map Preview Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the placeholder Map CTA section with an interactive Canvas-based heat map showing court density across Melbourne.

**Architecture:** Client-side Canvas component renders gradient blobs over a simplified road network. Courts are aggregated into spatial grid cells, each cell rendered as a radial gradient blob with classic heat map colors. Mouse interactions provide tooltips and click-to-navigate functionality.

**Tech Stack:** React 19, Canvas API, Next.js App Router, TypeScript

---

## Task 1: Create Melbourne Roads GeoJSON

**Files:**
- Create: `public/melbourne-roads.json`

**Step 1: Create the GeoJSON file with simplified Melbourne road network**

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "M1 Monash Freeway", "type": "freeway" },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [145.0, -37.84], [145.05, -37.85], [145.1, -37.87], [145.15, -37.89],
          [145.2, -37.90], [145.25, -37.91], [145.3, -37.92]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "M2 Eastern Freeway", "type": "freeway" },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [144.98, -37.81], [145.0, -37.80], [145.05, -37.79], [145.1, -37.78],
          [145.15, -37.77], [145.2, -37.77]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "M80 Ring Road West", "type": "freeway" },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [144.88, -37.72], [144.87, -37.75], [144.86, -37.78], [144.85, -37.81],
          [144.84, -37.84], [144.83, -37.87]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "M80 Ring Road North", "type": "freeway" },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [144.88, -37.72], [144.92, -37.70], [144.96, -37.69], [145.0, -37.68],
          [145.05, -37.68], [145.1, -37.69]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Hoddle St / Punt Rd", "type": "arterial" },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [144.99, -37.80], [144.99, -37.82], [144.99, -37.84], [144.99, -37.86],
          [144.99, -37.88]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "St Kilda Rd", "type": "arterial" },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [144.97, -37.82], [144.97, -37.84], [144.97, -37.86], [144.97, -37.88],
          [144.97, -37.90]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Sydney Rd", "type": "arterial" },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [144.96, -37.80], [144.96, -37.78], [144.96, -37.76], [144.96, -37.74],
          [144.96, -37.72], [144.96, -37.70]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Nepean Hwy", "type": "arterial" },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [145.0, -37.88], [145.0, -37.90], [145.0, -37.92], [145.0, -37.95],
          [145.0, -37.98], [145.0, -38.0]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Dandenong Rd", "type": "arterial" },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [144.99, -37.86], [145.02, -37.87], [145.05, -37.88], [145.08, -37.89],
          [145.12, -37.90]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Flemington Rd", "type": "arterial" },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [144.95, -37.81], [144.93, -37.79], [144.91, -37.78], [144.89, -37.77]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Victoria St", "type": "arterial" },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [144.97, -37.81], [144.99, -37.81], [145.01, -37.81], [145.03, -37.81]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "High St", "type": "arterial" },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [145.0, -37.85], [145.02, -37.86], [145.04, -37.87], [145.06, -37.87],
          [145.08, -37.87]
        ]
      }
    }
  ]
}
```

**Step 2: Verify the file is valid JSON**

Run: `cat public/melbourne-roads.json | npx json-parse-better-errors`
Expected: No errors (silent success)

**Step 3: Commit**

```bash
git add public/melbourne-roads.json
git commit -m "feat: add simplified Melbourne road network GeoJSON"
```

---

## Task 2: Create Suburb Lookup Utility

**Files:**
- Create: `src/lib/suburbs.ts`

**Step 1: Create the suburb lookup with bounding boxes**

```typescript
export interface SuburbBounds {
  name: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

// Melbourne suburbs with approximate bounding boxes
export const MELBOURNE_SUBURBS: SuburbBounds[] = [
  { name: "Melbourne CBD", minLat: -37.825, maxLat: -37.805, minLng: 144.945, maxLng: 144.975 },
  { name: "Richmond", minLat: -37.83, maxLat: -37.815, minLng: 144.985, maxLng: 145.01 },
  { name: "South Yarra", minLat: -37.855, maxLat: -37.835, minLng: 144.98, maxLng: 145.01 },
  { name: "St Kilda", minLat: -37.875, maxLat: -37.855, minLng: 144.965, maxLng: 144.995 },
  { name: "Carlton", minLat: -37.805, maxLat: -37.79, minLng: 144.955, maxLng: 144.975 },
  { name: "Fitzroy", minLat: -37.795, maxLat: -37.78, minLng: 144.975, maxLng: 144.995 },
  { name: "Collingwood", minLat: -37.805, maxLat: -37.79, minLng: 144.985, maxLng: 145.005 },
  { name: "Brunswick", minLat: -37.775, maxLat: -37.755, minLng: 144.955, maxLng: 144.975 },
  { name: "Northcote", minLat: -37.775, maxLat: -37.755, minLng: 144.99, maxLng: 145.01 },
  { name: "Hawthorn", minLat: -37.835, maxLat: -37.815, minLng: 145.02, maxLng: 145.05 },
  { name: "Camberwell", minLat: -37.845, maxLat: -37.825, minLng: 145.055, maxLng: 145.085 },
  { name: "Prahran", minLat: -37.855, maxLat: -37.84, minLng: 144.99, maxLng: 145.015 },
  { name: "South Melbourne", minLat: -37.845, maxLat: -37.83, minLng: 144.95, maxLng: 144.975 },
  { name: "Port Melbourne", minLat: -37.845, maxLat: -37.83, minLng: 144.92, maxLng: 144.95 },
  { name: "Footscray", minLat: -37.805, maxLat: -37.785, minLng: 144.885, maxLng: 144.915 },
  { name: "Essendon", minLat: -37.765, maxLat: -37.745, minLng: 144.9, maxLng: 144.93 },
  { name: "Preston", minLat: -37.755, maxLat: -37.735, minLng: 144.99, maxLng: 145.02 },
  { name: "Heidelberg", minLat: -37.765, maxLat: -37.745, minLng: 145.05, maxLng: 145.08 },
  { name: "Box Hill", minLat: -37.825, maxLat: -37.805, minLng: 145.115, maxLng: 145.145 },
  { name: "Glen Waverley", minLat: -37.885, maxLat: -37.865, minLng: 145.155, maxLng: 145.185 },
  { name: "Dandenong", minLat: -37.995, maxLat: -37.975, minLng: 145.205, maxLng: 145.235 },
  { name: "Frankston", minLat: -38.155, maxLat: -38.135, minLng: 145.115, maxLng: 145.145 },
  { name: "Brighton", minLat: -37.925, maxLat: -37.905, minLng: 144.98, maxLng: 145.01 },
  { name: "Elsternwick", minLat: -37.895, maxLat: -37.88, minLng: 144.995, maxLng: 145.015 },
  { name: "Caulfield", minLat: -37.885, maxLat: -37.87, minLng: 145.02, maxLng: 145.045 },
  { name: "Malvern", minLat: -37.87, maxLat: -37.855, minLng: 145.025, maxLng: 145.055 },
  { name: "Kew", minLat: -37.815, maxLat: -37.795, minLng: 145.025, maxLng: 145.055 },
  { name: "Balwyn", minLat: -37.815, maxLat: -37.795, minLng: 145.075, maxLng: 145.105 },
  { name: "Doncaster", minLat: -37.795, maxLat: -37.775, minLng: 145.115, maxLng: 145.145 },
  { name: "Templestowe", minLat: -37.775, maxLat: -37.755, minLng: 145.13, maxLng: 145.16 },
];

/**
 * Find the suburb name for a given lat/lng coordinate
 */
export function getSuburbForCoordinate(lat: number, lng: number): string | null {
  for (const suburb of MELBOURNE_SUBURBS) {
    if (
      lat >= suburb.minLat &&
      lat <= suburb.maxLat &&
      lng >= suburb.minLng &&
      lng <= suburb.maxLng
    ) {
      return suburb.name;
    }
  }
  return null;
}

/**
 * Melbourne bounding box for the heat map
 */
export const MELBOURNE_BOUNDS = {
  minLat: -38.1,
  maxLat: -37.5,
  minLng: 144.5,
  maxLng: 145.5,
};
```

**Step 2: Commit**

```bash
git add src/lib/suburbs.ts
git commit -m "feat: add Melbourne suburb lookup utility"
```

---

## Task 3: Create HeatMapPreview Component - Base Structure

**Files:**
- Create: `src/components/home/HeatMapPreview.tsx`

**Step 1: Create the component with Canvas setup and coordinate mapping**

```tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Court } from "@/lib/supabase/database.types";
import { MELBOURNE_BOUNDS, getSuburbForCoordinate } from "@/lib/suburbs";

interface HeatMapPreviewProps {
  courts: Court[];
  className?: string;
}

interface GridCell {
  row: number;
  col: number;
  courts: Court[];
  centerLat: number;
  centerLng: number;
  suburb: string | null;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  suburb: string;
  count: number;
}

// Grid configuration
const GRID_SIZE = 20;

// Heat colors (classic: blue -> green -> yellow -> red)
const HEAT_COLORS = [
  { threshold: 1, color: [66, 133, 244] },   // Blue - low
  { threshold: 3, color: [52, 168, 83] },    // Green - moderate
  { threshold: 6, color: [251, 188, 4] },    // Yellow - high
  { threshold: 10, color: [234, 67, 53] },   // Red - hotspot
];

function getHeatColor(count: number): [number, number, number] {
  for (let i = HEAT_COLORS.length - 1; i >= 0; i--) {
    if (count >= HEAT_COLORS[i].threshold) {
      return HEAT_COLORS[i].color as [number, number, number];
    }
  }
  return [66, 133, 244]; // Default blue
}

export function HeatMapPreview({ courts, className = "" }: HeatMapPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    suburb: "",
    count: 0,
  });

  const [gridCells, setGridCells] = useState<GridCell[]>([]);
  const [roads, setRoads] = useState<GeoJSON.FeatureCollection | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Convert lat/lng to canvas coordinates
  const latLngToCanvas = useCallback(
    (lat: number, lng: number, width: number, height: number) => {
      const x =
        ((lng - MELBOURNE_BOUNDS.minLng) /
          (MELBOURNE_BOUNDS.maxLng - MELBOURNE_BOUNDS.minLng)) *
        width;
      const y =
        ((MELBOURNE_BOUNDS.maxLat - lat) /
          (MELBOURNE_BOUNDS.maxLat - MELBOURNE_BOUNDS.minLat)) *
        height;
      return { x, y };
    },
    []
  );

  // Convert canvas coordinates to lat/lng
  const canvasToLatLng = useCallback(
    (x: number, y: number, width: number, height: number) => {
      const lng =
        (x / width) * (MELBOURNE_BOUNDS.maxLng - MELBOURNE_BOUNDS.minLng) +
        MELBOURNE_BOUNDS.minLng;
      const lat =
        MELBOURNE_BOUNDS.maxLat -
        (y / height) * (MELBOURNE_BOUNDS.maxLat - MELBOURNE_BOUNDS.minLat);
      return { lat, lng };
    },
    []
  );

  // Aggregate courts into grid cells
  useEffect(() => {
    const cellWidth =
      (MELBOURNE_BOUNDS.maxLng - MELBOURNE_BOUNDS.minLng) / GRID_SIZE;
    const cellHeight =
      (MELBOURNE_BOUNDS.maxLat - MELBOURNE_BOUNDS.minLat) / GRID_SIZE;

    const cells: Map<string, GridCell> = new Map();

    courts.forEach((court) => {
      if (court.latitude == null || court.longitude == null) return;

      const col = Math.floor(
        (court.longitude - MELBOURNE_BOUNDS.minLng) / cellWidth
      );
      const row = Math.floor(
        (MELBOURNE_BOUNDS.maxLat - court.latitude) / cellHeight
      );

      if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return;

      const key = `${row}-${col}`;
      const existing = cells.get(key);

      if (existing) {
        existing.courts.push(court);
      } else {
        const centerLng =
          MELBOURNE_BOUNDS.minLng + (col + 0.5) * cellWidth;
        const centerLat =
          MELBOURNE_BOUNDS.maxLat - (row + 0.5) * cellHeight;

        cells.set(key, {
          row,
          col,
          courts: [court],
          centerLat,
          centerLng,
          suburb: court.suburb || getSuburbForCoordinate(centerLat, centerLng),
        });
      }
    });

    setGridCells(Array.from(cells.values()));
  }, [courts]);

  // Load road network
  useEffect(() => {
    fetch("/melbourne-roads.json")
      .then((res) => res.json())
      .then((data) => setRoads(data))
      .catch((err) => console.error("Failed to load roads:", err));
  }, []);

  // Handle resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    const { width, height } = dimensions;
    const isDark = resolvedTheme === "dark";

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = isDark ? "#1a1a2e" : "#f0f4f8";
    ctx.fillRect(0, 0, width, height);

    // Draw roads
    if (roads) {
      ctx.strokeStyle = isDark
        ? "rgba(200, 200, 200, 0.15)"
        : "rgba(150, 150, 150, 0.25)";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      roads.features.forEach((feature) => {
        if (feature.geometry.type !== "LineString") return;

        const isFreeway = feature.properties?.type === "freeway";
        ctx.lineWidth = isFreeway ? 2.5 : 1.5;

        ctx.beginPath();
        const coords = feature.geometry.coordinates as [number, number][];
        coords.forEach((coord, i) => {
          const { x, y } = latLngToCanvas(coord[1], coord[0], width, height);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      });
    }

    // Draw heat blobs
    ctx.globalCompositeOperation = "lighter";

    gridCells.forEach((cell) => {
      const count = cell.courts.length;
      if (count === 0) return;

      const { x, y } = latLngToCanvas(
        cell.centerLat,
        cell.centerLng,
        width,
        height
      );
      const [r, g, b] = getHeatColor(count);
      const radius = Math.min(width, height) * 0.08 * Math.min(1 + count * 0.1, 2);

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      const alpha = Math.min(0.3 + count * 0.05, 0.7);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = "source-over";
  }, [dimensions, gridCells, roads, resolvedTheme, latLngToCanvas]);

  // Mouse move handler for tooltips
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || dimensions.width === 0) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Find nearest cell within threshold
      const threshold = 30;
      let nearestCell: GridCell | null = null;
      let nearestDistance = Infinity;

      gridCells.forEach((cell) => {
        const cellPos = latLngToCanvas(
          cell.centerLat,
          cell.centerLng,
          dimensions.width,
          dimensions.height
        );
        const distance = Math.sqrt(
          Math.pow(cellPos.x - x, 2) + Math.pow(cellPos.y - y, 2)
        );
        if (distance < threshold && distance < nearestDistance) {
          nearestDistance = distance;
          nearestCell = cell;
        }
      });

      if (nearestCell) {
        setTooltip({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          suburb: nearestCell.suburb || "Unknown area",
          count: nearestCell.courts.length,
        });
      } else {
        setTooltip((prev) => ({ ...prev, visible: false }));
      }
    },
    [dimensions, gridCells, latLngToCanvas]
  );

  // Click handler for navigation
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || dimensions.width === 0) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Find clicked cell
      const threshold = 30;
      let clickedCell: GridCell | null = null;
      let nearestDistance = Infinity;

      gridCells.forEach((cell) => {
        const cellPos = latLngToCanvas(
          cell.centerLat,
          cell.centerLng,
          dimensions.width,
          dimensions.height
        );
        const distance = Math.sqrt(
          Math.pow(cellPos.x - x, 2) + Math.pow(cellPos.y - y, 2)
        );
        if (distance < threshold && distance < nearestDistance) {
          nearestDistance = distance;
          clickedCell = cell;
        }
      });

      if (clickedCell && clickedCell.suburb) {
        router.push(`/search?suburb=${encodeURIComponent(clickedCell.suburb)}`);
      }
    },
    [dimensions, gridCells, latLngToCanvas, router]
  );

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        style={{ width: "100%", height: "100%" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip((prev) => ({ ...prev, visible: false }))}
        onClick={handleClick}
      />

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed z-50 px-3 py-2 bg-card border border-border rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltip.x,
            top: tooltip.y - 10,
          }}
        >
          <div className="font-semibold text-foreground text-sm">
            {tooltip.suburb}
          </div>
          <div className="text-muted-foreground text-xs">
            {tooltip.count} court{tooltip.count !== 1 ? "s" : ""} nearby
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/home/HeatMapPreview.tsx
git commit -m "feat: add HeatMapPreview component with Canvas rendering"
```

---

## Task 4: Integrate HeatMapPreview into Homepage

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Import the HeatMapPreview component**

At the top of the file, add the import:

```typescript
import { HeatMapPreview } from "@/components/home/HeatMapPreview";
```

**Step 2: Replace the Map CTA section placeholder**

Replace lines 209-221 (the placeholder div) with the HeatMapPreview:

Before:
```tsx
<div className="flex-1 w-full relative aspect-video rounded-xl overflow-hidden bg-muted border border-border/60 shadow-inner group cursor-pointer">
  {/* Placeholder Map Image */}
  <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/144.9631, -37.8136,10,0/800x600?access_token=PLACEHOLDER')] bg-cover bg-center opacity-80 transition-opacity group-hover:opacity-100" />
  <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-transparent transition-colors">
    <span className="sr-only">Map Preview</span>
  </div>
  {/* Safe fallback if mapbox url fails (it needs token, so likely broken image or blank) - Using a generic map pattern/color */}
  <div className="absolute inset-0 bg-slate-200 -z-10" />
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div className="bg-background/80 backdrop-blur-sm p-4 rounded-full shadow-lg">
      <Map className="w-8 h-8 text-primary" />
    </div>
  </div>
</div>
```

After:
```tsx
<div className="flex-1 w-full relative aspect-video rounded-xl overflow-hidden bg-muted border border-border/60 shadow-inner">
  <HeatMapPreview courts={allCourts} />
</div>
```

**Step 3: Verify the build passes**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: integrate HeatMapPreview into homepage Map CTA section"
```

---

## Task 5: Manual Testing Checklist

**Step 1: Start the development server**

Run: `npm run dev`

**Step 2: Verify in browser**

Open: `http://localhost:3000`

Check the following:
- [ ] Heat map renders in the "Explore Courts Near You" section
- [ ] Road network lines are visible as faint gray lines
- [ ] Heat blobs appear where courts are clustered
- [ ] Colors follow the gradient (blue → green → yellow → red)
- [ ] Hovering over a heat blob shows tooltip with suburb name and court count
- [ ] Clicking a heat blob navigates to `/search?suburb=...`
- [ ] Dark mode: road lines and background adjust appropriately
- [ ] Responsive: heat map scales with container size

**Step 3: Test edge cases**

- [ ] No courts in an area: no blob rendered
- [ ] Single court: blue blob
- [ ] Dense cluster (10+): red blob
- [ ] Tooltip stays on screen (doesn't overflow viewport)

**Step 4: Commit any fixes if needed**

---

## Task 6: Final Cleanup

**Step 1: Run lint and fix any issues**

Run: `npm run lint`

Fix any new lint errors introduced by the heat map code.

**Step 2: Final build verification**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address lint issues in heat map implementation"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Create Melbourne roads GeoJSON | `public/melbourne-roads.json` |
| 2 | Create suburb lookup utility | `src/lib/suburbs.ts` |
| 3 | Create HeatMapPreview component | `src/components/home/HeatMapPreview.tsx` |
| 4 | Integrate into homepage | `src/app/page.tsx` |
| 5 | Manual testing | N/A |
| 6 | Final cleanup | Various |
