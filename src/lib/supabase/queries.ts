import { createClient, createAdminClient } from "./server";
import type { Court, CourtSubmission, CourtSubmissionInsert, CourtInsert } from "./database.types";

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
    .not("google_rating", "is", null)
    .order("google_rating", { ascending: false })
    .order("google_user_ratings_total", { ascending: false })
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

// ============ Court Submissions ============

export async function createCourtSubmission(
  submission: CourtSubmissionInsert
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("court_submissions").insert(submission);

  if (error) {
    console.error("Error creating court submission:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Admin functions - require service role key

export async function getPendingSubmissions(): Promise<CourtSubmission[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("court_submissions")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending submissions:", error);
    return [];
  }

  return data || [];
}

export async function getAllSubmissions(): Promise<CourtSubmission[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("court_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all submissions:", error);
    return [];
  }

  return data || [];
}

export async function approveSubmission(
  submissionId: string
): Promise<{ success: boolean; courtId?: string; error?: string }> {
  const supabase = createAdminClient();

  // Get the submission
  const { data: submission, error: fetchError } = await supabase
    .from("court_submissions")
    .select("*")
    .eq("id", submissionId)
    .single();

  if (fetchError || !submission) {
    console.error("Error fetching submission:", fetchError);
    return { success: false, error: "Submission not found" };
  }

  // Create the court from submission data
  const courtData: CourtInsert = {
    name: submission.name,
    suburb: submission.suburb,
    address: submission.address,
    region: submission.region,
    type: submission.type,
    surface: submission.surface,
    courts_count: submission.courts_count,
    venue_type: submission.venue_type,
    price: submission.price,
    website: submission.website,
    notes: submission.notes,
    enrichment_status: "pending", // Will need enrichment
  };

  const { data: court, error: courtError } = await supabase
    .from("courts")
    .insert(courtData)
    .select()
    .single();

  if (courtError) {
    console.error("Error creating court:", courtError);
    return { success: false, error: courtError.message };
  }

  // Update submission status
  const { error: updateError } = await supabase
    .from("court_submissions")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      approved_court_id: court.id,
    })
    .eq("id", submissionId);

  if (updateError) {
    console.error("Error updating submission:", updateError);
    return { success: false, error: updateError.message };
  }

  return { success: true, courtId: court.id };
}

export async function rejectSubmission(
  submissionId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("court_submissions")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason || null,
    })
    .eq("id", submissionId);

  if (error) {
    console.error("Error rejecting submission:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
