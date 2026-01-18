"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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

  // Aggregate courts into grid cells (derived state)
  const gridCells = useMemo(() => {
    const cellWidth =
      (MELBOURNE_BOUNDS.maxLng - MELBOURNE_BOUNDS.minLng) / GRID_SIZE;
    const cellHeight =
      (MELBOURNE_BOUNDS.maxLat - MELBOURNE_BOUNDS.minLat) / GRID_SIZE;

    const cells: Map<string, GridCell> = new Map();

    courts.forEach((court) => {
      if (court.lat == null || court.lng == null) return;

      const col = Math.floor(
        (court.lng - MELBOURNE_BOUNDS.minLng) / cellWidth
      );
      const row = Math.floor(
        (MELBOURNE_BOUNDS.maxLat - court.lat) / cellHeight
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

    return Array.from(cells.values());
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

  // Find nearest cell within threshold
  const findNearestCell = useCallback(
    (x: number, y: number, threshold: number): GridCell | null => {
      let nearestCell: GridCell | null = null;
      let nearestDistance = Infinity;

      for (const cell of gridCells) {
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
      }

      return nearestCell;
    },
    [gridCells, dimensions, latLngToCanvas]
  );

  // Mouse move handler for tooltips
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || dimensions.width === 0) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const nearestCell = findNearestCell(x, y, 30);

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
    [dimensions, findNearestCell]
  );

  // Click handler for navigation
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || dimensions.width === 0) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const clickedCell = findNearestCell(x, y, 30);

      if (clickedCell && clickedCell.suburb) {
        router.push(`/search?suburb=${encodeURIComponent(clickedCell.suburb)}`);
      }
    },
    [dimensions, findNearestCell, router]
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
