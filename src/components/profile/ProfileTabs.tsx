"use client";

import { Star, Camera, Heart } from "lucide-react";

export type ProfileTab = "reviews" | "photos" | "favorites";

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  reviewCount: number;
  photoCount: number;
  favoriteCount: number;
  showFavorites: boolean;
}

export function ProfileTabs({
  activeTab,
  onTabChange,
  reviewCount,
  photoCount,
  favoriteCount,
  showFavorites,
}: ProfileTabsProps) {
  const tabs: { id: ProfileTab; label: string; icon: React.ReactNode; count: number; show: boolean }[] = [
    { id: "reviews", label: "Reviews", icon: <Star className="w-4 h-4" />, count: reviewCount, show: true },
    { id: "photos", label: "Photos", icon: <Camera className="w-4 h-4" />, count: photoCount, show: true },
    { id: "favorites", label: "Favorites", icon: <Heart className="w-4 h-4" />, count: favoriteCount, show: showFavorites },
  ];

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      {tabs
        .filter((tab) => tab.show)
        .map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "bg-muted-foreground/20 text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
    </div>
  );
}
