import { createClient, createAdminClient } from "./server";
import { sanitizePostgrestValue } from "@/lib/utils";
import type {
  Court,
  CourtSubmission,
  CourtSubmissionInsert,
  CourtInsert,
  CourtFeedback,
  CourtFeedbackInsert,
  CourtPhoto,
  CourtPhotoInsert,
  Profile
} from "./database.types";

// Extended types with profile info
export type CourtFeedbackWithProfile = CourtFeedback & {
  profiles: Pick<Profile, "display_name" | "avatar_url"> | null;
};

export type CourtPhotoWithProfile = CourtPhoto & {
  profiles: Pick<Profile, "display_name" | "avatar_url"> | null;
};

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
  const sanitized = sanitizePostgrestValue(query);

  if (!sanitized.trim()) return [];

  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .or(`name.ilike.%${sanitized}%,suburb.ilike.%${sanitized}%,region.ilike.%${sanitized}%`)
    .order("name");

  if (error) {
    console.error("Error searching courts:", error);
    return [];
  }

  return data || [];
}

export async function getSimilarCourts(
  court: { id: string; suburb: string; region: string | null },
  limit = 3
): Promise<Court[]> {
  const supabase = await createClient();

  // Try same suburb first
  const { data: suburbCourts, error: suburbError } = await supabase
    .from("courts")
    .select("*")
    .eq("suburb", court.suburb)
    .neq("id", court.id)
    .order("google_rating", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (suburbError) {
    console.error("Error fetching similar courts:", suburbError);
    return [];
  }

  // If enough results from suburb, return them
  if (suburbCourts && suburbCourts.length >= limit) {
    return suburbCourts;
  }

  // Fall back to same region to fill remaining slots
  if (!court.region) return suburbCourts || [];

  const existingIds = new Set((suburbCourts || []).map((c) => c.id));
  existingIds.add(court.id);
  const remaining = limit - (suburbCourts?.length || 0);

  const { data: regionCourts, error: regionError } = await supabase
    .from("courts")
    .select("*")
    .eq("region", court.region)
    .neq("id", court.id)
    .order("google_rating", { ascending: false, nullsFirst: false })
    .limit(remaining + existingIds.size);

  if (regionError) {
    console.error("Error fetching region courts:", regionError);
    return suburbCourts || [];
  }

  const filtered = (regionCourts || []).filter((c) => !existingIds.has(c.id)).slice(0, remaining);
  return [...(suburbCourts || []), ...filtered];
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

// ============ Court Feedback ============

export async function getCourtFeedback(courtId: string): Promise<CourtFeedbackWithProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("court_feedback")
    .select(`
      *,
      profiles (display_name, avatar_url)
    `)
    .eq("court_id", courtId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching court feedback:", error);
    return [];
  }

  return (data || []) as CourtFeedbackWithProfile[];
}

export async function createFeedback(
  feedback: CourtFeedbackInsert
): Promise<{ success: boolean; data?: CourtFeedback; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("court_feedback")
    .insert(feedback)
    .select()
    .single();

  if (error) {
    console.error("Error creating feedback:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function updateFeedback(
  feedbackId: string,
  updates: Partial<CourtFeedbackInsert>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("court_feedback")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", feedbackId);

  if (error) {
    console.error("Error updating feedback:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteFeedback(
  feedbackId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Soft delete by setting status to hidden
  const { error } = await supabase
    .from("court_feedback")
    .update({ status: "hidden", updated_at: new Date().toISOString() })
    .eq("id", feedbackId);

  if (error) {
    console.error("Error deleting feedback:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============ Court Photos ============

export async function getCourtPhotos(courtId: string): Promise<CourtPhotoWithProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("court_photos")
    .select(`
      *,
      profiles (display_name, avatar_url)
    `)
    .eq("court_id", courtId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching court photos:", error);
    return [];
  }

  return (data || []) as CourtPhotoWithProfile[];
}

export async function createPhoto(
  photo: CourtPhotoInsert
): Promise<{ success: boolean; data?: CourtPhoto; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("court_photos")
    .insert(photo)
    .select()
    .single();

  if (error) {
    console.error("Error creating photo:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

// ============ Admin Feedback & Photos ============

export async function getAllFeedback(): Promise<CourtFeedbackWithProfile[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("court_feedback")
    .select(`
      *,
      profiles (display_name, avatar_url)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all feedback:", error);
    return [];
  }

  return (data || []) as CourtFeedbackWithProfile[];
}

export async function getAllPhotos(): Promise<CourtPhotoWithProfile[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("court_photos")
    .select(`
      *,
      profiles (display_name, avatar_url)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all photos:", error);
    return [];
  }

  return (data || []) as CourtPhotoWithProfile[];
}

export async function updateFeedbackStatus(
  feedbackId: string,
  status: "active" | "hidden" | "resolved"
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("court_feedback")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", feedbackId);

  if (error) {
    console.error("Error updating feedback status:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updatePhotoStatus(
  photoId: string,
  status: "active" | "hidden"
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("court_photos")
    .update({ status })
    .eq("id", photoId);

  if (error) {
    console.error("Error updating photo status:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
