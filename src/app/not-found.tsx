import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-foreground mb-2">Page not found</h2>
        <p className="text-muted-foreground mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
