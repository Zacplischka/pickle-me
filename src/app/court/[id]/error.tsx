"use client";

import Link from "next/link";

export default function CourtError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t load this court. Please try again or go back to search.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
          >
            Try again
          </button>
          <Link
            href="/search"
            className="px-4 py-2 border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted"
          >
            Back to search
          </Link>
        </div>
      </div>
    </div>
  );
}
