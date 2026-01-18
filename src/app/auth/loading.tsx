export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center animate-pulse">
      <div className="w-full max-w-md p-8">
        <div className="bg-card rounded-xl border border-border p-8 space-y-6">
          {/* Logo/Title Skeleton */}
          <div className="text-center space-y-2">
            <div className="h-8 bg-muted rounded w-32 mx-auto" />
            <div className="h-5 bg-muted rounded w-48 mx-auto" />
          </div>

          {/* Form Fields Skeleton */}
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded w-full" />
            <div className="h-10 bg-muted rounded w-full" />
          </div>

          {/* Button Skeleton */}
          <div className="h-11 bg-muted rounded w-full" />

          {/* Links Skeleton */}
          <div className="flex justify-center gap-4">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-4 bg-muted rounded w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
