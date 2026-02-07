import { createClient } from "./server";
import type { ProfileWithStats, UserReview, UserPhoto } from "./profile";

export type { ProfileWithStats, UserReview, UserPhoto };

export async function getProfileWithStatsServer(userId: string): Promise<ProfileWithStats | null> {
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    console.error("Error fetching profile:", profileError);
    return null;
  }

  const [reviewResult, photoResult, favoriteResult] = await Promise.all([
    supabase
      .from("court_feedback")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("type", "review")
      .eq("status", "active"),
    supabase
      .from("court_photos")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "active"),
    supabase
      .from("court_favorites")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  return {
    ...profile,
    reviewCount: reviewResult.count || 0,
    photoCount: photoResult.count || 0,
    favoriteCount: favoriteResult.count || 0,
  };
}

export async function getUserReviewsServer(userId: string): Promise<UserReview[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("court_feedback")
    .select(`
      *,
      courts (id, name, suburb)
    `)
    .eq("user_id", userId)
    .eq("type", "review")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user reviews:", error);
    return [];
  }

  return (data || []) as UserReview[];
}

export async function getUserPhotosServer(userId: string): Promise<UserPhoto[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("court_photos")
    .select(`
      *,
      courts (id, name, suburb)
    `)
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user photos:", error);
    return [];
  }

  return (data || []) as UserPhoto[];
}
