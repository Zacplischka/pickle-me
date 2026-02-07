"use client";

import { useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import type { ProfileWithStats, UserReview, UserPhoto } from "@/lib/supabase/profile";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs, type ProfileTab } from "@/components/profile/ProfileTabs";
import { ReviewsList } from "@/components/profile/ReviewsList";
import { PhotosGrid } from "@/components/profile/PhotosGrid";

interface PublicProfileContentProps {
  profile: ProfileWithStats;
  reviews: UserReview[];
  photos: UserPhoto[];
  userId: string;
}

export function PublicProfileContent({ profile, reviews, photos, userId }: PublicProfileContentProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("reviews");

  const isOwnProfile = user?.id === userId;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />

        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          reviewCount={profile.reviewCount}
          photoCount={profile.photoCount}
          favoriteCount={0}
          showFavorites={false}
        />

        <div className="min-h-[300px]">
          {activeTab === "reviews" && (
            <ReviewsList
              reviews={reviews}
              isOwnProfile={false}
            />
          )}

          {activeTab === "photos" && (
            <PhotosGrid
              photos={photos}
              isOwnProfile={false}
              userId={userId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
