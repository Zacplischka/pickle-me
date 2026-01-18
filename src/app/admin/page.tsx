import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPendingSubmissions, getAllSubmissions } from "@/lib/supabase/queries";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { SubmissionsList } from "@/components/admin/SubmissionsList";

export const metadata = {
  title: "Admin | mypickle.me",
  description: "Review and manage court submissions.",
};

async function isAuthenticated() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");
  return adminToken?.value === process.env.ADMIN_PASSWORD;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const authenticated = await isAuthenticated();
  const params = await searchParams;

  if (!authenticated) {
    return <AdminLogin />;
  }

  const showAll = params.view === "all";
  const submissions = showAll
    ? await getAllSubmissions()
    : await getPendingSubmissions();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Court Submissions</h1>
            <p className="text-muted-foreground mt-1">
              Review and manage court submissions from users.
            </p>
          </div>
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Logout
            </button>
          </form>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border">
          <a
            href="/admin"
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${!showAll
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            Pending ({submissions.filter((s) => s.status === "pending").length})
          </a>
          <a
            href="/admin?view=all"
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${showAll
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            All Submissions
          </a>
        </div>

        <SubmissionsList submissions={submissions} />
      </div>
    </div>
  );
}
