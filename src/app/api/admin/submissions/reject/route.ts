import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { rejectSubmission } from "@/lib/supabase/queries";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { submissionId, reason } = await request.json();

  if (!submissionId) {
    return NextResponse.json({ error: "Missing submission ID" }, { status: 400 });
  }

  const result = await rejectSubmission(submissionId, reason);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
