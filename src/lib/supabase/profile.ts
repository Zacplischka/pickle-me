import { createClient } from "./client";
import type { Profile, ProfileUpdate, CourtFeedback, CourtPhoto, Court } from "./database.types";

export type ProfileWithStats = Profile & {
  reviewCount: number;
  photoCount: number;
  favoriteCount: number;
};

export type UserReview = CourtFeedback & {
  courts: Pick<Court, "id" | "name" | "suburb">;
};

export type UserPhoto = CourtPhoto & {
  courts: Pick<Court, "id" | "name" | "suburb">;
};

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

export async function getProfileWithStats(userId: string): Promise<ProfileWithStats | null> {
  const supabase = createClient();

  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    console.error("Error fetching profile:", profileError);
    return null;
  }

  // Get counts in parallel
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

export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getUserReviews(userId: string): Promise<UserReview[]> {
  const supabase = createClient();

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

export async function getUserPhotos(userId: string): Promise<UserPhoto[]> {
  const supabase = createClient();

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

export async function getUserComments(userId: string): Promise<UserReview[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("court_feedback")
    .select(`
      *,
      courts (id, name, suburb)
    `)
    .eq("user_id", userId)
    .eq("type", "comment")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user comments:", error);
    return [];
  }

  return (data || []) as UserReview[];
}

export async function deleteUserPhoto(
  photoId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // Soft delete - set status to hidden
  const { error } = await supabase
    .from("court_photos")
    .update({ status: "hidden" })
    .eq("id", photoId)
    .eq("user_id", userId); // Ensure user owns the photo

  if (error) {
    console.error("Error deleting photo:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteUserFeedback(
  feedbackId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // Soft delete - set status to hidden
  const { error } = await supabase
    .from("court_feedback")
    .update({ status: "hidden", updated_at: new Date().toISOString() })
    .eq("id", feedbackId)
    .eq("user_id", userId); // Ensure user owns the feedback

  if (error) {
    console.error("Error deleting feedback:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateUserFeedback(
  feedbackId: string,
  userId: string,
  updates: { content?: string; rating?: number }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("court_feedback")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", feedbackId)
    .eq("user_id", userId); // Ensure user owns the feedback

  if (error) {
    console.error("Error updating feedback:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
