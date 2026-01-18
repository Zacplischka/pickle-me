"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, Trash2, Loader2 } from "lucide-react";
import type { CourtPhotoWithProfile } from "@/lib/supabase/queries";

interface PhotosListProps {
  photos: CourtPhotoWithProfile[];
}

export function PhotosList({ photos }: PhotosListProps) {
  const [items, setItems] = useState(photos);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (id: string, action: "hide" | "show" | "delete") => {
    setLoadingId(id);

    const res = await fetch(`/api/admin/photos/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId: id }),
    });

    if (res.ok) {
      if (action === "delete") {
        setItems(items.filter((item) => item.id !== id));
      } else {
        setItems(
          items.map((item) =>
            item.id === id
              ? { ...item, status: action === "hide" ? "hidden" : "active" }
              : item
          )
        );
      }
    }

    setLoadingId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No photos to display.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((photo) => (
        <div
          key={photo.id}
          className={`bg-card rounded-xl border overflow-hidden ${
            photo.status === "hidden" ? "border-border/50 opacity-60" : "border-border"
          }`}
        >
          {/* Image */}
          <div className="relative aspect-video bg-muted">
            <Image
              src={photo.url}
              alt={photo.caption || "Court photo"}
              fill
              className="object-cover"
            />
            {photo.status === "hidden" && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">Hidden</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {photo.caption && (
                  <p className="text-sm text-foreground truncate mb-1">{photo.caption}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {photo.profiles?.display_name || "Anonymous"} • {formatDate(photo.created_at)}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Court: {photo.court_id}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-1">
                {photo.status === "active" ? (
                  <button
                    onClick={() => handleAction(photo.id, "hide")}
                    disabled={loadingId === photo.id}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                    title="Hide"
                  >
                    {loadingId === photo.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(photo.id, "show")}
                    disabled={loadingId === photo.id}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                    title="Show"
                  >
                    {loadingId === photo.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                )}
                <button
                  onClick={() => handleAction(photo.id, "delete")}
                  disabled={loadingId === photo.id}
                  className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                  title="Delete"
                >
                  {loadingId === photo.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
