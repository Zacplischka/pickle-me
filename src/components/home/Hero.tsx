"use client";

import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Hero() {
    return (
        <section className="relative w-full py-20 md:py-32 lg:py-40 bg-muted overflow-hidden">
            {/* Background Pattern/Image Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/95 to-muted/80 z-10" />
                {/* Placeholder for a real image if we had one - using a pickleball pattern or abstract */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1629814407963-c35eb8567179?q=80&w=2670&auto=format')] bg-cover bg-center opacity-20 dark:opacity-40 mix-blend-overlay" />
            </div>

            <div className="container relative z-20 mx-auto px-4 md:px-6 flex flex-col items-center text-center gap-6">
                <div className="inline-flex items-center rounded-full border border-foreground/20 bg-foreground/10 px-3 py-1 text-sm text-foreground backdrop-blur-sm">
                    <span className="flex h-2 w-2 rounded-full bg-secondary mr-2 animate-pulse"></span>
                    Directory Live for 2025
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl">
                    Find Your Next <span className="text-secondary">Pickleball</span> Match in Victoria
                </h1>

                <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
                    The comprehensive directory for indoor & outdoor courts. Find clubs, book sessions, and join the fastest growing sport in Australia.
                </p>

                {/* Search Bar */}
                <div className="w-full max-w-2xl mt-8 p-2 bg-card/80 backdrop-blur-md border border-border rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2">
                    <div className="flex-1 relative flex items-center">
                        <MapPin className="absolute left-4 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Suburb, postcode, or court name..."
                            className="w-full h-12 pl-12 pr-4 bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 text-lg"
                        />
                    </div>
                    <Button size="lg" className="h-12 md:w-auto w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-lg px-8 rounded-xl shadow-lg shadow-secondary/20">
                        <Search className="w-5 h-5 mr-2" />
                        Find Courts
                    </Button>
                </div>

                <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
                    <span>Popular:</span>
                    <span className="underline decoration-secondary decoration-2 underline-offset-4 cursor-pointer hover:text-foreground">Indoor Courts</span>
                    <span className="underline decoration-secondary decoration-2 underline-offset-4 cursor-pointer hover:text-foreground">Melbourne</span>
                    <span className="underline decoration-secondary decoration-2 underline-offset-4 cursor-pointer hover:text-foreground">Free to Play</span>
                </div>
            </div>
        </section>
    );
}
