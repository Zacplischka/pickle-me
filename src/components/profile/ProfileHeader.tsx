"use client";

import Link from "next/link";
import { Calendar, MapPin, Star, Camera, Heart, Settings } from "lucide-react";
import type { ProfileWithStats } from "@/lib/supabase/profile";

interface ProfileHeaderProps {
  profile: ProfileWithStats;
  isOwnProfile: boolean;
}

export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const displayName = profile.display_name || "Anonymous User";
  const initials = displayName.slice(0, 2).toUpperCase();

  const memberSince = new Date(profile.created_at).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex flex-col sm:flex-row items-start gap-6">
        {/* Avatar */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl sm:text-3xl font-bold flex-shrink-0">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <Calendar className="w-4 h-4" />
                Member since {memberSince}
              </p>
            </div>
            {isOwnProfile && (
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                Edit Profile
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-foreground">{profile.reviewCount}</span>
              <span className="text-sm text-muted-foreground">reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-secondary" />
              <span className="font-semibold text-foreground">{profile.photoCount}</span>
              <span className="text-sm text-muted-foreground">photos</span>
            </div>
            {isOwnProfile && (
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-semibold text-foreground">{profile.favoriteCount}</span>
                <span className="text-sm text-muted-foreground">favorites</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
