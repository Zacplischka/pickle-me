import { createClient } from "./server";
import { fetchProfileWithStats, fetchUserReviews, fetchUserPhotos } from "./profile-queries";
import type { ProfileWithStats, UserReview, UserPhoto } from "./profile";

export type { ProfileWithStats, UserReview, UserPhoto };

export async function getProfileWithStatsServer(userId: string): Promise<ProfileWithStats | null> {
  const supabase = await createClient();
  return fetchProfileWithStats(supabase, userId);
}

export async function getUserReviewsServer(userId: string): Promise<UserReview[]> {
  const supabase = await createClient();
  return fetchUserReviews(supabase, userId);
}

export async function getUserPhotosServer(userId: string): Promise<UserPhoto[]> {
  const supabase = await createClient();
  return fetchUserPhotos(supabase, userId);
}
