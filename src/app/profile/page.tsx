"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getProfileWithStats, getUserReviews, getUserPhotos, type ProfileWithStats, type UserReview, type UserPhoto } from "@/lib/supabase/profile";
import { getUserFavorites, type FavoriteWithCourt } from "@/lib/supabase/favorites";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs, type ProfileTab } from "@/components/profile/ProfileTabs";
import { ReviewsList } from "@/components/profile/ReviewsList";
import { PhotosGrid } from "@/components/profile/PhotosGrid";
import { FavoritesList } from "@/components/profile/FavoritesList";
import { ReviewForm } from "@/components/court/ReviewForm";
import { Spinner } from "@/components/ui/Spinner";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<ProfileWithStats | null>(null);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [favorites, setFavorites] = useState<FavoriteWithCourt[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>("reviews");
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<UserReview | null>(null);

  useEffect(() => {
    // Redirect to home if not logged in
    if (!authLoading && !user) {
      router.push("/");
      return;
    }

    if (user) {
      loadProfileData(user.id);
    }
  }, [user, authLoading, router]);

  const loadProfileData = async (userId: string) => {
    setLoading(true);

    const [profileData, reviewsData, photosData, favoritesData] = await Promise.all([
      getProfileWithStats(userId),
      getUserReviews(userId),
      getUserPhotos(userId),
      getUserFavorites(userId),
    ]);

    setProfile(profileData);
    setReviews(reviewsData);
    setPhotos(photosData);
    setFavorites(favoritesData);
    setLoading(false);
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    if (profile) {
      setProfile({ ...profile, reviewCount: profile.reviewCount - 1 });
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    if (profile) {
      setProfile({ ...profile, photoCount: profile.photoCount - 1 });
    }
  };

  const handleUnfavorite = (courtId: string) => {
    setFavorites((prev) => prev.filter((f) => f.court_id !== courtId));
    if (profile) {
      setProfile({ ...profile, favoriteCount: profile.favoriteCount - 1 });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <ProfileHeader profile={profile} isOwnProfile={true} />

        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          reviewCount={profile.reviewCount}
          photoCount={profile.photoCount}
          favoriteCount={profile.favoriteCount}
          showFavorites={true}
        />

        <div className="min-h-[300px]">
          {activeTab === "reviews" && (
            <ReviewsList
              reviews={reviews}
              isOwnProfile={true}
              onEdit={setEditingReview}
              onDelete={handleDeleteReview}
            />
          )}

          {activeTab === "photos" && (
            <PhotosGrid
              photos={photos}
              isOwnProfile={true}
              userId={user?.id || ""}
              onDelete={handleDeletePhoto}
            />
          )}

          {activeTab === "favorites" && (
            <FavoritesList favorites={favorites} onUnfavorite={handleUnfavorite} />
          )}
        </div>

        {/* Edit Review Modal */}
        {editingReview && (
          <ReviewForm
            isOpen={true}
            onClose={() => {
              setEditingReview(null);
              // Reload reviews after edit
              if (user) {
                getUserReviews(user.id).then(setReviews);
              }
            }}
            courtId={editingReview.court_id}
            editReview={editingReview}
          />
        )}
      </div>
    </main>
  );
}
