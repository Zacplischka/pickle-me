"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, MapPin, Pencil, Trash2, Plus } from "lucide-react";
import type { UserReview } from "@/lib/supabase/profile";
import { deleteUserFeedback } from "@/lib/supabase/profile";
import { Button } from "@/components/ui/Button";

interface ReviewsListProps {
  reviews: UserReview[];
  isOwnProfile: boolean;
  onEdit?: (review: UserReview) => void;
  onDelete?: (reviewId: string) => void;
}

export function ReviewsList({ reviews, isOwnProfile, onEdit, onDelete }: ReviewsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = async (reviewId: string) => {
    if (confirmDelete !== reviewId) {
      setConfirmDelete(reviewId);
      return;
    }

    setDeletingId(reviewId);
    const result = await deleteUserFeedback(reviewId, reviews.find(r => r.id === reviewId)?.user_id || "");

    if (result.success) {
      onDelete?.(reviewId);
    }

    setDeletingId(null);
    setConfirmDelete(null);
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
        <Star className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          {isOwnProfile ? "No reviews yet" : "No reviews yet"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {isOwnProfile
            ? "Share your thoughts on courts you've visited!"
            : "This user hasn't written any reviews yet."}
        </p>
        {isOwnProfile && (
          <Link href="/search">
            <Button variant="default" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Find Courts to Review
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Link
                href={`/court/${review.court_id}`}
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                {review.courts?.name || "Unknown Court"}
              </Link>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span>{review.courts?.suburb || "Unknown location"}</span>
                <span className="mx-1">•</span>
                <span>{formatDate(review.created_at)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {review.rating && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating! ? "fill-amber-400 text-amber-400" : "text-muted"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {review.content && (
            <p className="mt-3 text-sm text-foreground">{review.content}</p>
          )}

          {isOwnProfile && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
              <button
                onClick={() => onEdit?.(review)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(review.id)}
                disabled={deletingId === review.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  confirmDelete === review.id
                    ? "text-white bg-red-500 hover:bg-red-600"
                    : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {confirmDelete === review.id ? "Confirm Delete" : "Delete"}
              </button>
              {confirmDelete === review.id && (
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
