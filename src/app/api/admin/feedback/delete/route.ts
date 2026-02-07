import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { feedbackId } = await request.json();

  if (!feedbackId) {
    return NextResponse.json({ error: "Missing feedback ID" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Hard delete for admin
  const { error } = await supabase
    .from("court_feedback")
    .delete()
    .eq("id", feedbackId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
