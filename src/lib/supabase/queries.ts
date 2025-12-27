import { createClient } from "./server";
import type { Court } from "./database.types";

export async function getCourts(): Promise<Court[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching courts:", error);
    return [];
  }

  return data || [];
}

export async function getFeaturedCourts(limit = 3): Promise<Court[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .not("image_url", "is", null)
    .limit(limit);

  if (error) {
    console.error("Error fetching featured courts:", error);
    return [];
  }

  return data || [];
}

export async function getCourtById(id: string): Promise<Court | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching court:", error);
    return null;
  }

  return data;
}

export async function getCourtsByRegion(region: string): Promise<Court[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .eq("region", region)
    .order("name");

  if (error) {
    console.error("Error fetching courts by region:", error);
    return [];
  }

  return data || [];
}

export async function searchCourts(query: string): Promise<Court[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .or(`name.ilike.%${query}%,suburb.ilike.%${query}%,region.ilike.%${query}%`)
    .order("name");

  if (error) {
    console.error("Error searching courts:", error);
    return [];
  }

  return data || [];
}
