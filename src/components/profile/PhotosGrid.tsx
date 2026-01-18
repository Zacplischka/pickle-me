"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, Trash2, MapPin, Plus } from "lucide-react";
import type { UserPhoto } from "@/lib/supabase/profile";
import { deleteUserPhoto } from "@/lib/supabase/profile";
import { Button } from "@/components/ui/Button";

interface PhotosGridProps {
  photos: UserPhoto[];
  isOwnProfile: boolean;
  userId: string;
  onDelete?: (photoId: string) => void;
}

export function PhotosGrid({ photos, isOwnProfile, userId, onDelete }: PhotosGridProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = async (photoId: string) => {
    if (confirmDelete !== photoId) {
      setConfirmDelete(photoId);
      return;
    }

    setDeletingId(photoId);
    const result = await deleteUserPhoto(photoId, userId);

    if (result.success) {
      onDelete?.(photoId);
    }

    setDeletingId(null);
    setConfirmDelete(null);
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
        <Camera className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          {isOwnProfile ? "No photos yet" : "No photos yet"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {isOwnProfile
            ? "Share photos of courts you've visited!"
            : "This user hasn't uploaded any photos yet."}
        </p>
        {isOwnProfile && (
          <Link href="/search">
            <Button variant="default" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Find Courts to Photograph
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <div key={photo.id} className="relative group">
          <Link href={`/court/${photo.court_id}`}>
            <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
              <Image
                src={photo.url}
                alt={photo.caption || "Court photo"}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white font-medium truncate">
                  {photo.courts?.name || "Unknown Court"}
                </p>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {photo.courts?.suburb || "Unknown location"}
                </p>
              </div>
            </div>
          </Link>

          {isOwnProfile && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(photo.id);
                }}
                disabled={deletingId === photo.id}
                className={`p-1.5 rounded-md transition-colors ${
                  confirmDelete === photo.id
                    ? "bg-red-500 text-white"
                    : "bg-background/80 backdrop-blur-sm text-foreground hover:bg-red-500 hover:text-white"
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {confirmDelete === photo.id && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
              <div className="text-center p-4">
                <p className="text-white text-sm font-medium mb-2">Delete this photo?</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => handleDelete(photo.id)}
                    disabled={deletingId === photo.id}
                    className="px-3 py-1 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-3 py-1 text-xs font-medium bg-white/20 text-white rounded-md hover:bg-white/30"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
