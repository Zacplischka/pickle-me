import { createClient } from "./client";
import type { CourtFavorite, Court } from "./database.types";

export type FavoriteWithCourt = CourtFavorite & {
  courts: Court;
};

export async function toggleFavorite(
  userId: string,
  courtId: string
): Promise<{ isFavorited: boolean; error?: string }> {
  const supabase = createClient();

  // Check if already favorited
  const { data: existing, error: checkError } = await supabase
    .from("court_favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("court_id", courtId)
    .maybeSingle();

  if (checkError) {
    console.error("Error checking favorite:", checkError);
    return { isFavorited: false, error: checkError.message };
  }

  if (existing) {
    // Remove favorite
    const { error: deleteError } = await supabase
      .from("court_favorites")
      .delete()
      .eq("id", existing.id);

    if (deleteError) {
      console.error("Error removing favorite:", deleteError);
      return { isFavorited: true, error: deleteError.message };
    }

    return { isFavorited: false };
  } else {
    // Add favorite
    const { error: insertError } = await supabase
      .from("court_favorites")
      .insert({ user_id: userId, court_id: courtId });

    if (insertError) {
      console.error("Error adding favorite:", insertError);
      return { isFavorited: false, error: insertError.message };
    }

    return { isFavorited: true };
  }
}

export async function checkIsFavorited(
  userId: string,
  courtId: string
): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("court_favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("court_id", courtId)
    .maybeSingle();

  if (error) {
    console.error("Error checking favorite:", error);
    return false;
  }

  return !!data;
}

export async function getUserFavorites(userId: string): Promise<FavoriteWithCourt[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("court_favorites")
    .select(`
      *,
      courts (id, name, suburb, image_url, google_rating, type)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }

  return (data || []) as FavoriteWithCourt[];
}

export async function getUserFavoriteCourtIds(userId: string): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("court_favorites")
    .select("court_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching favorite IDs:", error);
    return [];
  }

  return (data || []).map((f) => f.court_id);
}
