import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { updateFeedbackStatus } from "@/lib/supabase/queries";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { feedbackId } = await request.json();

  if (!feedbackId) {
    return NextResponse.json({ error: "Missing feedback ID" }, { status: 400 });
  }

  const result = await updateFeedbackStatus(feedbackId, "hidden");

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
