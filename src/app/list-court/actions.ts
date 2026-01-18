"use server";

import { createCourtSubmission } from "@/lib/supabase/queries";
import type { CourtSubmissionInsert } from "@/lib/supabase/database.types";

export async function submitCourt(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const name = formData.get("name") as string;
  const suburb = formData.get("suburb") as string;

  // Validate required fields
  if (!name || !suburb) {
    return { success: false, error: "Name and suburb are required." };
  }

  const submission: CourtSubmissionInsert = {
    name: name.trim(),
    suburb: suburb.trim(),
    address: (formData.get("address") as string)?.trim() || null,
    region: (formData.get("region") as string) || null,
    type: (formData.get("type") as string) || null,
    surface: (formData.get("surface") as string) || null,
    courts_count: (formData.get("courts_count") as string)?.trim() || null,
    venue_type: (formData.get("venue_type") as string) || null,
    price: (formData.get("price") as string)?.trim() || null,
    website: (formData.get("website") as string)?.trim() || null,
    notes: (formData.get("notes") as string)?.trim() || null,
  };

  return await createCourtSubmission(submission);
}
