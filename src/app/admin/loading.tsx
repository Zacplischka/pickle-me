export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-9 bg-muted rounded-lg w-64 mb-2" />
            <div className="h-5 bg-muted rounded w-80" />
          </div>
          <div className="h-5 bg-muted rounded w-16" />
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-6">
          <div className="h-9 w-28 bg-background rounded-md" />
          <div className="h-9 w-24 bg-muted/50 rounded-md" />
          <div className="h-9 w-20 bg-muted/50 rounded-md" />
        </div>

        {/* Filter Tabs Skeleton */}
        <div className="flex gap-4 mb-6 border-b border-border pb-2">
          <div className="h-5 bg-muted rounded w-24" />
          <div className="h-5 bg-muted rounded w-32" />
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-6 bg-muted rounded w-48" />
                  <div className="h-4 bg-muted rounded w-32" />
                </div>
                <div className="h-6 bg-muted rounded-full w-20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-full" />
              </div>
              <div className="flex gap-2">
                <div className="h-9 bg-muted rounded w-24" />
                <div className="h-9 bg-muted rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
