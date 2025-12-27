import Link from "next/link";
import { MapPin, Trophy, Users, Info, Star, Phone, Globe } from "lucide-react";
import { Court } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface CourtCardProps {
    court: Court;
}

export function CourtCard({ court }: CourtCardProps) {
    const typeColor = court.type === "Indoor"
        ? "bg-primary/90 text-primary-foreground"
        : court.type === "Outdoor"
            ? "bg-sky-500/90 text-white"
            : "bg-emerald-500/90 text-white"; // Hybrid

    return (
        <div className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-border/80">
            {/* Image Section */}
            <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
                <img
                    src={court.image_url || "https://images.unsplash.com/photo-1626245353528-77402061e858?q=80&w=2664&auto=format&fit=crop"}
                    alt={court.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                    {court.type && (
                        <span className={cn("px-2 py-1 rounded-md text-xs font-semibold shadow-sm backdrop-blur-md", typeColor)}>
                            {court.type}
                        </span>
                    )}
                    {court.price && (
                        <span className="px-2 py-1 rounded-md text-xs font-semibold bg-background/90 text-foreground shadow-sm backdrop-blur-md">
                            {court.price}
                        </span>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col p-5 gap-3">
                <div>
                    <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors">
                        {court.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">{court.suburb}</span>
                        {court.region && (
                            <span className="text-xs text-muted-foreground/70">• {court.region}</span>
                        )}
                    </div>
                </div>

                {/* Rating Section */}
                {court.google_rating && (
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-sm">{court.google_rating.toFixed(1)}</span>
                        </div>
                        {court.google_user_ratings_total && (
                            <span className="text-xs text-muted-foreground">
                                ({court.google_user_ratings_total.toLocaleString()} reviews)
                            </span>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2 my-1">
                    {court.surface && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1.5 rounded-md">
                            <Trophy className="w-3.5 h-3.5 text-accent" />
                            <span>{court.surface}</span>
                        </div>
                    )}
                    {court.courts_count && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1.5 rounded-md">
                            <Users className="w-3.5 h-3.5 text-secondary" />
                            <span>{court.courts_count} Courts</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2 h-14 overflow-hidden content-start">
                    {(court.features || []).slice(0, 4).map((feature) => (
                        <span key={feature} className="px-1.5 py-0.5 rounded border border-border text-[10px] text-muted-foreground bg-background">
                            {feature}
                        </span>
                    ))}
                    {(court.features || []).length > 4 && (
                        <span className="px-1.5 py-0.5 rounded border border-border text-[10px] text-muted-foreground bg-background">
                            +{(court.features || []).length - 4} more
                        </span>
                    )}
                </div>

                {/* Contact Links */}
                {(court.google_phone || court.google_website || court.website) && (
                    <div className="flex items-center gap-3 text-xs">
                        {court.google_phone && (
                            <a
                                href={`tel:${court.google_phone}`}
                                className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Call</span>
                            </a>
                        )}
                        {(court.google_website || court.website) && (
                            <a
                                href={court.google_website || court.website || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Globe className="w-3.5 h-3.5" />
                                <span>Website</span>
                            </a>
                        )}
                    </div>
                )}

                <div className="mt-auto pt-2 flex items-center justify-between gap-3">
                    <Button variant="outline" size="sm" className="w-full">
                        View Details
                    </Button>
                    <Button variant="default" size="sm" className="w-full bg-secondary hover:bg-secondary/90 text-white">
                        Book Now
                    </Button>
                </div>
            </div>
        </div>
    );
}
