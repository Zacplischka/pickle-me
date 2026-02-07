"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Star } from "lucide-react";

import { useAuth } from "@/lib/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import type { CourtFeedback } from "@/lib/supabase/database.types";

interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  courtId: string;
  editReview?: CourtFeedback | null;
}

export function ReviewForm({ isOpen, onClose, courtId, editReview }: ReviewFormProps) {
  const [rating, setRating] = useState(editReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState(editReview?.content || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { user } = useAuth();
  const trapRef = useFocusTrap(isOpen, { onEscape: onClose });

  const isEditing = !!editReview;

  // Update form when editReview changes
  useEffect(() => {
    if (editReview) {
      setRating(editReview.rating || 0);
      setContent(editReview.content || "");
    } else {
      setRating(0);
      setContent("");
    }
  }, [editReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();

    if (isEditing && editReview) {
      // Update existing review
      const { error: updateError } = await supabase
        .from("court_feedback")
        .update({
          rating,
          content: content.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editReview.id)
        .eq("user_id", user.id); // Ensure user owns the review

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
    } else {
      // Create new review
      const { error: submitError } = await supabase.from("court_feedback").insert({
        court_id: courtId,
        user_id: user.id,
        type: "review",
        rating,
        content: content.trim() || null,
      });

      if (submitError) {
        setError(submitError.message);
        setLoading(false);
        return;
      }
    }

    // Reset form and close
    setRating(0);
    setContent("");
    setLoading(false);
    onClose();

    // Refresh the page to show updated data
    router.refresh();
  };

  if (!isOpen) return null;

  return (
    <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? "Edit Review" : "Write a Review"}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md bg-card rounded-xl shadow-xl border border-border overflow-hidden animate-in zoom-in-95 fade-in duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">
              {isEditing ? "Edit Review" : "Write a Review"}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Your Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoveredRating(value)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                    aria-label={`Rate ${value} out of 5 stars`}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        value <= (hoveredRating || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {rating === 0 && "Click to rate"}
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            </div>

            {/* Review Content */}
            <div>
              <label htmlFor="review" className="block text-sm font-medium text-foreground mb-1.5">
                Your Review (Optional)
              </label>
              <textarea
                id="review"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your experience at this court..."
                rows={4}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" loading={loading}>
                {loading
                  ? (isEditing ? "Updating..." : "Submitting...")
                  : (isEditing ? "Update Review" : "Submit Review")}
              </Button>
            </div>
          </form>
        </div>
      </div>
  );
}
