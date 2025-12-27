import { Hero } from "@/components/home/Hero";
import { CourtCard } from "@/components/CourtCard";
import { getFeaturedCourts, getCourts } from "@/lib/data";
import { ArrowRight, Map } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function Home() {
  const [featuredCourts, allCourts] = await Promise.all([
    getFeaturedCourts(3),
    getCourts(),
  ]);

  // Take a few recently added courts (last 4 by name for now)
  const recentCourts = allCourts.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      {/* Featured Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Featured Courts</h2>
              <p className="text-muted-foreground mt-2 text-lg">Top-rated venues chosen by the community.</p>
            </div>
            <Link href="/search" className="hidden md:flex items-center text-primary font-semibold hover:underline">
              View all courts <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredCourts.map((court) => (
              <CourtCard key={court.id} court={court} />
            ))}
          </div>

          <div className="mt-8 md:hidden">
            <Button variant="outline" className="w-full">
              View all courts
            </Button>
          </div>
        </div>
      </section>

      {/* Map CTA Section */}
      <section className="py-16 bg-muted/50 border-y border-border/40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center gap-8 bg-card rounded-2xl p-8 md:p-12 shadow-sm border border-border/60">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center rounded-md bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary ring-1 ring-inset ring-secondary/20">
                <Map className="mr-1.5 h-4 w-4" /> Interactive Map
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Explore Courts Near You</h2>
              <p className="text-muted-foreground text-lg">
                Visually explore court locations across Melbourne and regional Victoria. Find clubs, public courts, and indoor centres with our interactive map.
              </p>
              <div className="pt-4">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Open Map View
                </Button>
              </div>
            </div>
            <div className="flex-1 w-full relative aspect-video rounded-xl overflow-hidden bg-muted border border-border/60 shadow-inner group cursor-pointer">
              {/* Placeholder Map Image */}
              <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/144.9631, -37.8136,10,0/800x600?access_token=PLACEHOLDER')] bg-cover bg-center opacity-80 transition-opacity group-hover:opacity-100" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-transparent transition-colors">
                <span className="sr-only">Map Preview</span>
              </div>
              {/* Safe fallback if mapbox url fails (it needs token, so likely broken image or blank) - Using a generic map pattern/color */}
              <div className="absolute inset-0 bg-slate-200 -z-10" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-background/80 backdrop-blur-sm p-4 rounded-full shadow-lg">
                  <Map className="w-8 h-8 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Additions */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">Recently Added</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentCourts.map((court) => (
              <CourtCard key={court.id} court={court} />
            ))}
            {/* Placeholder for "Add your court" card? */}
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center hover:border-secondary hover:bg-secondary/5 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-secondary/20 flex items-center justify-center mb-4 transition-colors">
                <span className="text-2xl text-muted-foreground group-hover:text-secondary">+</span>
              </div>
              <h3 className="font-semibold text-lg text-foreground">Own a Court?</h3>
              <p className="text-sm text-muted-foreground mt-2">List your venue on Victoria&apos;s #1 Pickleball directory.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
