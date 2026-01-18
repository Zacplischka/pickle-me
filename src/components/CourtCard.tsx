"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Trophy, Users, Star, Phone, Globe, Navigation } from "lucide-react";
import { Court } from "@/lib/data";
import { cn, formatDistance } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { OpeningHours } from "@/components/OpeningHours";
import { ExternalLinkModal } from "@/components/ui/ExternalLinkModal";

interface CourtCardProps {
    court: Court & { distance?: number };
    variant?: "default" | "compact";
    onClick?: () => void;
    isSelected?: boolean;
}

export function CourtCard({ court, variant = "default", onClick, isSelected }: CourtCardProps) {
    const [isExternalModalOpen, setIsExternalModalOpen] = useState(false);
    const isCompact = variant === "compact";
    const bookingUrl = court.google_website || court.website;

    const handleBookNowClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (bookingUrl) {
            setIsExternalModalOpen(true);
        }
    };

    const handleConfirmNavigation = () => {
        if (bookingUrl) {
            window.open(bookingUrl, "_blank", "noopener,noreferrer");
        }
        setIsExternalModalOpen(false);
    };

    const typeColor = court.type === "Indoor"
        ? "bg-primary/90 text-primary-foreground"
        : court.type === "Outdoor"
            ? "bg-sky-500/90 text-white"
            : "bg-emerald-500/90 text-white"; // Hybrid

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative flex flex-col rounded-xl border bg-card overflow-hidden transition-all hover:shadow-lg cursor-pointer",
                isSelected
                    ? "border-primary ring-2 ring-primary/20 shadow-lg"
                    : "border-border hover:border-border/80"
            )}
        >
            {/* Image Section */}
            <div className={cn("aspect-[4/3] w-full overflow-hidden bg-muted relative", isCompact && "aspect-[3/2]")}>
                <Image
                    src={
                        (court.google_photos as { name?: string }[])?.[0]?.name
                            ? `https://places.googleapis.com/v1/${(court.google_photos as { name?: string }[])[0].name}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&maxHeightPx=800&maxWidthPx=800`
                            : court.image_url || "https://images.unsplash.com/photo-1626245353528-77402061e858?q=80&w=2664&auto=format&fit=crop"
                    }
                    alt={court.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
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
            <div className={cn("flex flex-1 flex-col p-5 gap-3", isCompact && "p-3")}>
                <div>
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors">
                            {court.name}
                        </h3>
                        {court.distance !== undefined && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full whitespace-nowrap">
                                <Navigation className="w-3 h-3" />
                                {formatDistance(court.distance)}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-xs font-medium truncate">
                            {court.google_formatted_address || `${court.suburb}${court.region ? `, ${court.region}` : ""}`}
                        </span>
                    </div>
                </div>

                {/* Rating Section */}
                {court.google_rating && (
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-sm text-foreground">{court.google_rating.toFixed(1)}</span>
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

                {!isCompact && (
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
                )}

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
                                href={(court.google_website || court.website)!}
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

                {/* Opening Hours */}
                {court.google_opening_hours && (
                    <div className="mt-2">
                        <OpeningHours hours={court.google_opening_hours as { weekdayDescriptions?: string[] }} />
                    </div>
                )}

                <div className="mt-auto pt-2 flex items-center justify-between gap-3">
                    <Button variant="outline" size="sm" className="w-full">
                        View Details
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        className="w-full bg-secondary hover:bg-secondary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleBookNowClick}
                        disabled={!bookingUrl}
                    >
                        Book Now
                    </Button>
                </div>
            </div>

            {/* External Link Confirmation Modal */}
            <ExternalLinkModal
                isOpen={isExternalModalOpen}
                onClose={() => setIsExternalModalOpen(false)}
                onConfirm={handleConfirmNavigation}
                url={bookingUrl || ""}
                siteName={court.name}
            />
        </div>
    );
}
