export default function ListCourtLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-muted/50 border-b border-border/40">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="max-w-2xl">
            <div className="h-6 bg-muted rounded w-28 mb-4" />
            <div className="h-10 bg-muted rounded-lg w-72 mb-3" />
            <div className="h-6 bg-muted rounded w-full max-w-lg" />
          </div>
        </div>
      </div>

      {/* Form Skeleton */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-2xl space-y-8">
          {/* Basic Information Card */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="h-6 bg-muted rounded w-40" />
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded w-full" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
              </div>
              <div className="h-10 bg-muted rounded w-full" />
            </div>
          </div>

          {/* Court Details Card */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="h-6 bg-muted rounded w-32" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
            </div>
            <div className="h-10 bg-muted rounded w-full" />
          </div>

          {/* Additional Info Card */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="h-6 bg-muted rounded w-44" />
            <div className="h-10 bg-muted rounded w-full" />
            <div className="h-24 bg-muted rounded w-full" />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <div className="h-11 bg-muted rounded w-36" />
          </div>
        </div>
      </div>
    </div>
  );
}
