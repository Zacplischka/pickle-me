import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { MapPin, Star, Activity, ChevronRight, Home, Building2, TreePine } from "lucide-react";
import { toSlug, fromSlug, calculateDistance } from "@/lib/utils";
import { getCourtsBySuburb, getDistinctSuburbs } from "@/lib/data";
import type { Court } from "@/lib/supabase/database.types";
import { CourtCard } from "@/components/CourtCard";
import { SuburbMapWrapper } from "@/components/suburb/SuburbMapWrapper";

export const revalidate = 600;

interface SuburbPageProps {
  params: Promise<{ suburb: string }>;
}

async function resolveSuburb(slug: string) {
  const suburbs = await getDistinctSuburbs();
  const allNames = suburbs.map((s) => s.suburb);
  const suburbName = fromSlug(slug, allNames);
  return { suburbName, suburbs };
}

export async function generateMetadata({
  params,
}: SuburbPageProps): Promise<Metadata> {
  const { suburb: slug } = await params;
  const { suburbName } = await resolveSuburb(slug);

  if (!suburbName) {
    return { title: "Suburb Not Found" };
  }

  const courts = await getCourtsBySuburb(suburbName);
  const count = courts.length;

  return {
    title: `Pickleball Courts in ${suburbName}, VIC`,
    description: `Find ${count} pickleball court${count !== 1 ? "s" : ""} in ${suburbName}, Victoria. View ratings, hours, and directions for all courts.`,
    openGraph: {
      title: `Pickleball Courts in ${suburbName}, VIC`,
      description: `Find ${count} pickleball court${count !== 1 ? "s" : ""} in ${suburbName}, Victoria. View ratings, hours, and directions.`,
    },
  };
}

function getCourtStats(courts: Court[]) {
  const indoor = courts.filter((c) => c.type === "Indoor").length;
  const outdoor = courts.filter((c) => c.type === "Outdoor").length;
  const hybrid = courts.filter((c) => c.type === "Hybrid").length;

  const rated = courts.filter((c) => c.google_rating !== null);
  const avgRating =
    rated.length > 0
      ? rated.reduce((sum, c) => sum + (c.google_rating || 0), 0) / rated.length
      : null;

  // Collect top features across all courts
  const featureCount = new Map<string, number>();
  for (const court of courts) {
    for (const f of court.features || []) {
      featureCount.set(f, (featureCount.get(f) || 0) + 1);
    }
  }
  const topFeatures = Array.from(featureCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([f]) => f);

  return { indoor, outdoor, hybrid, avgRating, topFeatures };
}

function getAvgLatLng(courts: Court[]) {
  const withCoords = courts.filter((c) => c.lat !== null && c.lng !== null);
  if (withCoords.length === 0) return null;
  const lat =
    withCoords.reduce((sum, c) => sum + c.lat!, 0) / withCoords.length;
  const lng =
    withCoords.reduce((sum, c) => sum + c.lng!, 0) / withCoords.length;
  return { lat, lng };
}

function getNearbySuburbs(
  currentSuburb: string,
  currentCenter: { lat: number; lng: number },
  allCourts: Map<string, Court[]>,
  allSuburbs: { suburb: string; count: number }[],
  limit = 6
) {
  return allSuburbs
    .filter((s) => s.suburb !== currentSuburb)
    .map((s) => {
      const courts = allCourts.get(s.suburb) || [];
      const center = getAvgLatLng(courts);
      if (!center) return null;
      const distance = calculateDistance(currentCenter, center);
      return { suburb: s.suburb, count: s.count, distance };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

export default async function SuburbPage({ params }: SuburbPageProps) {
  const { suburb: slug } = await params;
  const { suburbName, suburbs } = await resolveSuburb(slug);

  if (!suburbName) {
    notFound();
  }

  const courts = await getCourtsBySuburb(suburbName);
  const stats = getCourtStats(courts);
  const center = getAvgLatLng(courts);

  // Build a map of suburb → courts for nearby suburb distance calculation
  // We reuse the same data from getDistinctSuburbs + individual suburb courts
  // For efficiency, approximate by getting all court summaries
  const { getCourtSummaries } = await import("@/lib/data");
  const allCourts = await getCourtSummaries();
  const courtsBySuburb = new Map<string, Court[]>();
  for (const court of allCourts) {
    const list = courtsBySuburb.get(court.suburb) || [];
    list.push(court);
    courtsBySuburb.set(court.suburb, list);
  }

  const nearbySuburbs = center
    ? getNearbySuburbs(suburbName, center, courtsBySuburb, suburbs)
    : [];

  // Type breakdown for subtitle
  const typeParts: string[] = [];
  if (stats.indoor > 0) typeParts.push(`${stats.indoor} indoor`);
  if (stats.outdoor > 0) typeParts.push(`${stats.outdoor} outdoor`);
  if (stats.hybrid > 0) typeParts.push(`${stats.hybrid} hybrid`);

  // JSON-LD: ItemList of SportsActivityLocation
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Pickleball Courts in ${suburbName}`,
    numberOfItems: courts.length,
    itemListElement: courts.map((court, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SportsActivityLocation",
        name: court.name,
        address: {
          "@type": "PostalAddress",
          streetAddress: court.address,
          addressLocality: suburbName,
          addressRegion: "VIC",
          addressCountry: "AU",
        },
        ...(court.lat && court.lng
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: court.lat,
                longitude: court.lng,
              },
            }
          : {}),
        url: `https://mypickle.me/court/${court.id}`,
        ...(court.google_rating
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: court.google_rating,
                reviewCount: court.google_user_ratings_total || 0,
              },
            }
          : {}),
      },
    })),
  };

  // JSON-LD: BreadcrumbList
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://mypickle.me",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Courts",
        item: "https://mypickle.me/search",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: suburbName,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link
                href="/"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li>
              <Link
                href="/search"
                className="hover:text-foreground transition-colors"
              >
                Courts
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li className="text-foreground font-medium">{suburbName}</li>
          </ol>
        </nav>

        {/* Hero / Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Pickleball Courts in {suburbName}
          </h1>
          <p className="text-muted-foreground">
            {courts.length} court{courts.length !== 1 ? "s" : ""} available
            {typeParts.length > 0 && ` — ${typeParts.join(", ")}`}
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {courts.length}
              </p>
              <p className="text-xs text-muted-foreground">Total Courts</p>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10">
              <TreePine className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.outdoor}
              </p>
              <p className="text-xs text-muted-foreground">Outdoor</p>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Building2 className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.indoor}
              </p>
              <p className="text-xs text-muted-foreground">Indoor</p>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-400/10">
              <Star className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.avgRating ? stats.avgRating.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </div>
          </div>
        </div>

        {/* Top Features */}
        {stats.topFeatures.length > 0 && (
          <div className="flex items-center gap-2 mb-8">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Top features:</span>
            {stats.topFeatures.map((feature) => (
              <span
                key={feature}
                className="px-2 py-0.5 rounded border border-border text-xs text-muted-foreground bg-background"
              >
                {feature}
              </span>
            ))}
          </div>
        )}

        {/* Map */}
        {courts.some((c) => c.lat !== null && c.lng !== null) && (
          <div className="bg-card rounded-xl border border-border overflow-hidden mb-8">
            <div className="h-[350px] md:h-[450px]">
              <SuburbMapWrapper courts={courts} />
            </div>
          </div>
        )}

        {/* Court Grid */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            All Courts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courts.map((court) => (
              <Link key={court.id} href={`/court/${court.id}`}>
                <CourtCard court={court} variant="compact" isLinked />
              </Link>
            ))}
          </div>
        </div>

        {/* Nearby Suburbs */}
        {nearbySuburbs.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Nearby Suburbs
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {nearbySuburbs.map((s) => (
                <Link
                  key={s.suburb}
                  href={`/courts/${toSlug(s.suburb)}`}
                  className="bg-card rounded-xl border border-border p-4 hover:border-primary/50 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {s.suburb}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.count} court{s.count !== 1 ? "s" : ""} &middot;{" "}
                        {s.distance < 1
                          ? `${Math.round(s.distance * 1000)}m away`
                          : `${s.distance.toFixed(1)}km away`}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
