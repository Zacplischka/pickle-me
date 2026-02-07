import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProfileWithStatsServer, getUserReviewsServer, getUserPhotosServer } from "@/lib/supabase/profile-server";
import { PublicProfileContent } from "@/components/profile/PublicProfileContent";

export async function generateMetadata({ params }: { params: Promise<{ userId: string }> }): Promise<Metadata> {
  const { userId } = await params;
  const profile = await getProfileWithStatsServer(userId);

  if (!profile) {
    return { title: "User Not Found" };
  }

  return {
    title: `${profile.display_name || "User"}'s Profile | Pickle Me`,
    description: `View ${profile.display_name || "User"}'s pickleball activity.`,
  };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  const [profile, reviews, photos] = await Promise.all([
    getProfileWithStatsServer(userId),
    getUserReviewsServer(userId),
    getUserPhotosServer(userId),
  ]);

  if (!profile) {
    notFound();
  }

  return (
    <PublicProfileContent
      profile={profile}
      reviews={reviews}
      photos={photos}
      userId={userId}
    />
  );
}
