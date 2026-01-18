"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getProfileWithStats, getUserReviews, getUserPhotos, type ProfileWithStats, type UserReview, type UserPhoto } from "@/lib/supabase/profile";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs, type ProfileTab } from "@/components/profile/ProfileTabs";
import { ReviewsList } from "@/components/profile/ReviewsList";
import { PhotosGrid } from "@/components/profile/PhotosGrid";
import { Spinner } from "@/components/ui/Spinner";

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { user } = useAuth();

  const [profile, setProfile] = useState<ProfileWithStats | null>(null);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>("reviews");
  const [loading, setLoading] = useState(true);

  // Check if viewing own profile
  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (userId) {
      loadProfileData(userId);
    }
  }, [userId]);

  const loadProfileData = async (userId: string) => {
    setLoading(true);

    const [profileData, reviewsData, photosData] = await Promise.all([
      getProfileWithStats(userId),
      getUserReviews(userId),
      getUserPhotos(userId),
    ]);

    setProfile(profileData);
    setReviews(reviewsData);
    setPhotos(photosData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Profile not found</h1>
        <p className="text-muted-foreground">This user doesn't exist or their profile is private.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4">
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
    </main>
  );
}
