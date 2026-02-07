"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Camera, X } from "lucide-react";

import type { Court } from "@/lib/supabase/database.types";
import type { CourtPhotoWithProfile } from "@/lib/supabase/queries";

interface CourtPhotoCarouselProps {
  court: Court;
  userPhotos: CourtPhotoWithProfile[];
}

export function CourtPhotoCarousel({ court, userPhotos }: CourtPhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Build photo array - Google photos first, then user photos
  const googlePhotos = (court.google_photos as { name?: string }[] | null) || [];
  const allPhotos: { url: string; caption?: string; source: "google" | "user" }[] = [
    ...googlePhotos.map((p) => ({
      url: p.name
        ? `https://places.googleapis.com/v1/${p.name}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY?.trim()}&maxHeightPx=1200&maxWidthPx=1600`
        : "",
      caption: "Google Photos",
      source: "google" as const,
    })).filter((p) => p.url),
    ...userPhotos.map((p) => ({
      url: p.url,
      caption: p.caption || `Photo by ${p.profiles?.display_name || "User"}`,
      source: "user" as const,
    })),
  ];

  // Fallback if no photos
  if (allPhotos.length === 0) {
    allPhotos.push({
      url: court.image_url || "/court-placeholder.jpg",
      caption: court.name,
      source: "google",
    });
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allPhotos.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  return (
    <>
      {/* Carousel */}
      <div className="relative w-full h-64 md:h-96 bg-muted overflow-hidden group">
        {/* Main Image */}
        <Image
          src={allPhotos[currentIndex].url}
          alt={allPhotos[currentIndex].caption || court.name}
          fill
          className="object-cover cursor-pointer"
          onClick={() => setLightboxOpen(true)}
          priority
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Photo Counter */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm">
          <Camera className="w-4 h-4" />
          <span>{currentIndex + 1} / {allPhotos.length}</span>
        </div>

        {/* Navigation Arrows */}
        {allPhotos.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Thumbnail Strip */}
        {allPhotos.length > 1 && (
          <div className="absolute bottom-4 right-4 flex gap-1">
            {allPhotos.slice(0, 5).map((photo, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${
                  index === currentIndex ? "border-white" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={photo.url}
                  alt=""
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
            {allPhotos.length > 5 && (
              <div className="w-12 h-12 rounded-md bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-sm font-medium">
                +{allPhotos.length - 5}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-in fade-in duration-150"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="relative w-full h-full max-w-6xl max-h-[90vh] m-4" onClick={(e) => e.stopPropagation()}>
              <Image
                src={allPhotos[currentIndex].url}
                alt={allPhotos[currentIndex].caption || court.name}
                fill
                className="object-contain"
              />

              {allPhotos.length > 1 && (
                <>
                  <button
                    onClick={goToPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}

              {/* Caption */}
              {allPhotos[currentIndex].caption && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-lg text-white text-sm">
                  {allPhotos[currentIndex].caption}
                </div>
              )}
            </div>
          </div>
        )}
    </>
  );
}
