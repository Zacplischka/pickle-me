import { Hero } from "@/components/home/Hero";
import { CourtCard } from "@/components/CourtCard";
import { getFeaturedCourts, getCourts } from "@/lib/data";
import { ArrowRight, Map, Users, Activity, Heart, Check } from "lucide-react";
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

      {/* Why Play Section */}
      <section className="py-16 bg-muted/30 border-y border-border/40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Why Pickleball?</h2>
            <p className="text-lg text-muted-foreground">
              Discover why it's the fastest-growing sport in Australia. Accessible, social, and seriously fun.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-xl border border-border/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Meet New People</h3>
              <p className="text-muted-foreground">
                The most social sport you'll ever play. Courts are smaller, games are quick, and the community is incredibly welcoming.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-6 text-secondary">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fun Cardio</h3>
              <p className="text-muted-foreground">
                Get your heart rate up without realizing it. It's fast-paced but low-impact, perfect for all ages and fitness levels.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-6 text-accent">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy to Learn</h3>
              <p className="text-muted-foreground">
                Pick up a paddle and you'll be playing points in 15 minutes. Difficult to master, but incredibly easy to start.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Court of the Month */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden shadow-xl">
              {/* Placeholder until we have real images */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300" />
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <span className="sr-only">Court Image</span>
                <Map className="w-16 h-16 opacity-20" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
                <div className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-white mb-2 shadow-sm">
                  Court of the Month
                </div>
                <p className="text-sm font-medium opacity-90">Royal Park Tennis Club</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Royal Park Tennis Club
              </h2>
              <p className="text-lg text-muted-foreground">
                Located in the heart of Parkville, Royal Park has embraced the pickleball revolution with 4 dedicated outdoor courts and improved lighting for evening play.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-green-100 dark:bg-green-900/30 p-1 rounded-full text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Dedicated Courts</h4>
                    <p className="text-sm text-muted-foreground">Permanent lines and nets, no setup required.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-green-100 dark:bg-green-900/30 p-1 rounded-full text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Social Sessions</h4>
                    <p className="text-sm text-muted-foreground">Hosted social play every Tuesday and Thursday evening.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button size="lg" variant="outline">
                  View Venue Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Spotlight */}
      <section className="py-16 bg-primary text-primary-foreground overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white mb-6 ring-1 ring-inset ring-white/20">
            Community Spotlight
          </div>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8 max-w-3xl mx-auto">
            "The community is what keeps me coming back. I've made best friends on the court."
          </h2>

          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
              SJ
            </div>
            <div className="text-left">
              <div className="font-semibold">Sarah Jenkins</div>
              <div className="text-sm text-white/70">Player since 2023 • North Melbourne</div>
            </div>
          </div>

          <div className="mt-12">
            <Button size="lg" variant="secondary" className="font-semibold">
              Join the Community
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
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Explore Courts Near You</h2>
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
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-8">Recently Added</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentCourts.map((court) => (
              <CourtCard key={court.id} court={court} />
            ))}
            {/* Add your court card */}
            <Link href="/list-court" className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center hover:border-secondary hover:bg-secondary/5 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-secondary/20 flex items-center justify-center mb-4 transition-colors">
                <span className="text-2xl text-muted-foreground group-hover:text-secondary">+</span>
              </div>
              <h3 className="font-semibold text-lg text-foreground">Own a Court?</h3>
              <p className="text-sm text-muted-foreground mt-2">List your venue on Victoria&apos;s #1 Pickleball directory.</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
