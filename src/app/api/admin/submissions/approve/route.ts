import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { approveSubmission } from "@/lib/supabase/queries";

async function isAuthenticated() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");
  return adminToken?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { submissionId } = await request.json();

  if (!submissionId) {
    return NextResponse.json({ error: "Missing submission ID" }, { status: 400 });
  }

  const result = await approveSubmission(submissionId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, courtId: result.courtId });
}
