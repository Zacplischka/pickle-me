import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { photoId } = await request.json();

  if (!photoId) {
    return NextResponse.json({ error: "Missing photo ID" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Get photo URL to delete from storage
  const { data: photo } = await supabase
    .from("court_photos")
    .select("url")
    .eq("id", photoId)
    .single();

  // Delete from database
  const { error } = await supabase
    .from("court_photos")
    .delete()
    .eq("id", photoId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Try to delete from storage (extract path from URL)
  if (photo?.url) {
    try {
      const url = new URL(photo.url);
      const path = url.pathname.split("/court-photos/")[1];
      if (path) {
        await supabase.storage.from("court-photos").remove([path]);
      }
    } catch {
      // Ignore storage deletion errors
    }
  }

  return NextResponse.json({ success: true });
}
