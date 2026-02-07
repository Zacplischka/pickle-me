export default function SearchLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] animate-pulse">
      {/* Filter Bar Skeleton */}
      <div className="h-14 bg-background border-b border-border/60 px-4 flex items-center gap-4">
        <div className="h-8 w-32 bg-muted rounded-md" />
        <div className="h-8 w-24 bg-muted rounded-md" />
        <div className="h-8 w-28 bg-muted rounded-md" />
      </div>

      {/* Map + Panel Layout Skeleton */}
      <div className="flex-1 flex">
        {/* Map Skeleton */}
        <div className="flex-1 bg-muted" />

        {/* Side Panel Skeleton */}
        <div className="w-[400px] border-l border-border bg-background p-4 space-y-4 hidden lg:block">
          <div className="h-6 bg-muted rounded w-1/3" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-4 space-y-3">
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="flex gap-2">
                <div className="h-6 bg-muted rounded-full w-16" />
                <div className="h-6 bg-muted rounded-full w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
