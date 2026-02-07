import { isAuthenticated } from "@/lib/admin-auth";
import { getPendingSubmissions, getAllSubmissions, getAllFeedback, getAllPhotos } from "@/lib/supabase/queries";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { SubmissionsList } from "@/components/admin/SubmissionsList";
import { FeedbackList } from "@/components/admin/FeedbackList";
import { PhotosList } from "@/components/admin/PhotosList";

export const metadata = {
  title: "Admin | mypickle.me",
  description: "Review and manage court submissions.",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; view?: string }>;
}) {
  const authenticated = await isAuthenticated();
  const params = await searchParams;

  if (!authenticated) {
    return <AdminLogin />;
  }

  const activeTab = params.tab || "submissions";
  const showAll = params.view === "all";

  // Fetch data based on active tab
  const submissions = activeTab === "submissions"
    ? showAll
      ? await getAllSubmissions()
      : await getPendingSubmissions()
    : [];
  const feedback = activeTab === "feedback" ? await getAllFeedback() : [];
  const photos = activeTab === "photos" ? await getAllPhotos() : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage court submissions, feedback, and photos.
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

        {/* Main Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-6">
          <a
            href="/admin?tab=submissions"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "submissions"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Submissions
          </a>
          <a
            href="/admin?tab=feedback"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "feedback"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Feedback
          </a>
          <a
            href="/admin?tab=photos"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "photos"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Photos
          </a>
        </div>

        {/* Tab Content */}
        {activeTab === "submissions" && (
          <>
            {/* Filter Tabs */}
            <div className="flex gap-4 mb-6 border-b border-border">
              <a
                href="/admin?tab=submissions"
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${!showAll
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                Pending ({submissions.filter((s) => s.status === "pending").length})
              </a>
              <a
                href="/admin?tab=submissions&view=all"
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${showAll
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                All Submissions
              </a>
            </div>
            <SubmissionsList submissions={submissions} />
          </>
        )}

        {activeTab === "feedback" && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Review and moderate user reviews, comments, and corrections.
            </p>
            <FeedbackList feedback={feedback} />
          </>
        )}

        {activeTab === "photos" && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Review and moderate user-uploaded photos.
            </p>
            <PhotosList photos={photos} />
          </>
        )}
      </div>
    </div>
  );
}
