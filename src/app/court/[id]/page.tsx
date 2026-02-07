import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getCourtById } from "@/lib/supabase/queries";
import { getCourtFeedback, getCourtPhotos, getSimilarCourts } from "@/lib/supabase/queries";
import { CourtDetailHeader } from "@/components/court/CourtDetailHeader";
import { CourtPhotoCarousel } from "@/components/court/CourtPhotoCarousel";
import { CourtInfo } from "@/components/court/CourtInfo";
import { CommunitySection } from "@/components/court/CommunitySection";
import { SimilarCourts } from "@/components/court/SimilarCourts";

export const revalidate = 600;

interface CourtPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CourtPageProps): Promise<Metadata> {
  const { id } = await params;
  const court = await getCourtById(id);

  if (!court) {
    return {
      title: "Court Not Found | mypickle.me",
    };
  }

  // Get first image for OG
  let imageUrl = "/court-placeholder.jpg";
  const googlePhoto = (court.google_photos as { name?: string }[])?.[0]?.name;
  if (googlePhoto) {
    imageUrl = `https://places.googleapis.com/v1/${googlePhoto}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY?.trim()}&maxHeightPx=630&maxWidthPx=1200`;
  } else if (court.image_url) {
    imageUrl = court.image_url;
  }

  return {
    title: `${court.name} | mypickle.me`,
    description: `Find pickleball at ${court.name} in ${court.suburb}. ${court.type || ""} courts with ${court.surface || "various"} surface. View photos, ratings, and opening hours.`,
    openGraph: {
      title: `${court.name} | Pickleball Courts in ${court.suburb}`,
      description: `Play pickleball at ${court.name}. View court details, photos, and community reviews.`,
      images: [imageUrl],
    },
  };
}

export default async function CourtPage({ params }: CourtPageProps) {
  const { id } = await params;
  const court = await getCourtById(id);

  if (!court) {
    notFound();
  }

  const [feedback, photos, similarCourts] = await Promise.all([
    getCourtFeedback(id),
    getCourtPhotos(id),
    getSimilarCourts({ id, suburb: court.suburb, region: court.region }),
  ]);

  // Separate reviews from other feedback types
  const reviews = feedback.filter((f) => f.type === "review");
  const comments = feedback.filter((f) => f.type === "comment");
  const corrections = feedback.filter((f) => f.type === "correction");

  // Calculate community average rating
  const reviewsWithRating = reviews.filter((r) => r.rating !== null);
  const communityRating = reviewsWithRating.length > 0
    ? reviewsWithRating.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsWithRating.length
    : null;

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "name": court.name,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": court.address,
      "addressLocality": court.suburb,
      "addressRegion": court.region || "VIC",
      "addressCountry": "AU"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": court.lat,
      "longitude": court.lng
    },
    "image": [
      court.image_url || "/court-placeholder.jpg"
    ],
    "description": `Pickleball courts at ${court.name}. ${court.courts_count || 'Multiple'} ${court.type || ''} courts available.`,
    "url": `https://mypickle.me/court/${court.id}`,
    "telephone": court.google_phone,
    "aggregateRating": (court.google_rating || communityRating) ? {
      "@type": "AggregateRating",
      "ratingValue": court.google_rating || communityRating,
      "reviewCount": (court.google_user_ratings_total || 0) + reviews.length
    } : undefined
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Photo Carousel */}
      <CourtPhotoCarousel court={court} userPhotos={photos} />

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <CourtDetailHeader
              court={court}
              communityRating={communityRating}
              reviewCount={reviews.length}
            />

            <CourtInfo court={court} />

            <CommunitySection
              courtId={id}
              reviews={reviews}
              comments={comments}
              corrections={corrections}
            />

            <SimilarCourts courts={similarCourts} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Map Preview */}
            {court.lat && court.lng && (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <iframe
                    title={`Map showing location of ${court.name}`}
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY?.trim()}&q=${court.lat},${court.lng}&zoom=15`}
                    className="w-full h-full"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="p-4">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${court.lat},${court.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h3 className="font-semibold text-foreground">Quick Actions</h3>
              {(court.google_website || court.website) && (
                <a
                  href={court.google_website || court.website || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-secondary/90 transition-colors"
                >
                  Book Now
                </a>
              )}
              {court.google_phone && (
                <a
                  href={`tel:${court.google_phone}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  Call Venue
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
