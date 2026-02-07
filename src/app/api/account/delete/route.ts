import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = user.id;
  const admin = createAdminClient();

  // 1. Delete favorites
  await admin.from("court_favorites").delete().eq("user_id", userId);

  // 2. Soft-delete feedback (keep content visible as "Deleted User")
  await admin.from("court_feedback")
    .update({ status: "hidden", updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  // 3. Soft-delete photos
  await admin.from("court_photos")
    .update({ status: "hidden" })
    .eq("user_id", userId);

  // 4. Anonymize profile
  await admin.from("profiles").update({
    display_name: "Deleted User",
    avatar_url: null,
    email_preferences: null,
  }).eq("id", userId);

  // 5. Delete the auth user (requires admin/service role)
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.error("Error deleting auth user:", deleteError);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
