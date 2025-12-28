"use client";

import { cn } from "@/lib/utils";

interface RadiusSliderProps {
  value: number;
  onChange: (value: number) => void;
  onMouseUp?: () => void;
  onTouchEnd?: () => void;
  min?: number;
  max?: number;
  className?: string;
}

export function RadiusSlider({
  value,
  onChange,
  onMouseUp,
  onTouchEnd,
  min = 1,
  max = 50,
  className,
}: RadiusSliderProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Search radius</span>
        <span className="text-sm font-semibold text-foreground">{value} km</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-secondary"
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-muted-foreground">{min} km</span>
        <span className="text-xs text-muted-foreground">{max} km</span>
      </div>
    </div>
  );
}
