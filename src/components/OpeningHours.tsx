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
