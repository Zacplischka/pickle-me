export default function CourtLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Photo Carousel Skeleton */}
      <div className="w-full h-64 md:h-96 bg-muted" />

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded-lg w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="flex gap-2">
                <div className="h-6 bg-muted rounded-full w-20" />
                <div className="h-6 bg-muted rounded-full w-24" />
              </div>
            </div>

            {/* Info Skeleton */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="h-6 bg-muted rounded w-1/4" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-16 bg-muted rounded-lg" />
                <div className="h-16 bg-muted rounded-lg" />
                <div className="h-16 bg-muted rounded-lg" />
                <div className="h-16 bg-muted rounded-lg" />
              </div>
            </div>

            {/* Community Section Skeleton */}
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="space-y-3">
                <div className="h-24 bg-muted rounded-lg" />
                <div className="h-24 bg-muted rounded-lg" />
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="aspect-video bg-muted" />
              <div className="p-4">
                <div className="h-10 bg-muted rounded-lg" />
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="h-5 bg-muted rounded w-1/2" />
              <div className="h-10 bg-muted rounded-lg" />
              <div className="h-10 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
