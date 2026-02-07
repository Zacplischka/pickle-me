"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, MessageCircle, AlertTriangle, Camera, Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useModals } from "@/lib/contexts/ModalContext";
import { ReviewForm } from "./ReviewForm";
import { CommentForm } from "./CommentForm";
import { ReportIssueForm } from "./ReportIssueForm";
import { PhotoUpload } from "./PhotoUpload";
import { deleteUserFeedback } from "@/lib/supabase/profile";
import type { CourtFeedbackWithProfile } from "@/lib/supabase/queries";

interface CommunitySectionProps {
  courtId: string;
  reviews: CourtFeedbackWithProfile[];
  comments: CourtFeedbackWithProfile[];
  corrections: CourtFeedbackWithProfile[];
}

type Tab = "reviews" | "comments" | "photos";

export function CommunitySection({ courtId, reviews, comments }: CommunitySectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>("reviews");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [editingReview, setEditingReview] = useState<CourtFeedbackWithProfile | null>(null);
  const [editingComment, setEditingComment] = useState<CourtFeedbackWithProfile | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { user } = useAuth();
  const { openAuthModal } = useModals();

  const handleDelete = async (feedbackId: string, userId: string) => {
    if (confirmDeleteId !== feedbackId) {
      setConfirmDeleteId(feedbackId);
      return;
    }

    setDeletingId(feedbackId);
    const result = await deleteUserFeedback(feedbackId, userId);

    if (result.success) {
      // Refresh the page to show updated content
      window.location.reload();
    }

    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  const handleAction = (action: () => void) => {
    if (!user) {
      openAuthModal();
    } else {
      action();
    }
  };

  const tabs: { id: Tab; label: string; count: number; icon: React.ReactNode }[] = [
    { id: "reviews", label: "Reviews", count: reviews.length, icon: <Star className="w-4 h-4" /> },
    { id: "comments", label: "Comments", count: comments.length, icon: <MessageCircle className="w-4 h-4" /> },
    { id: "photos", label: "Photos", count: 0, icon: <Camera className="w-4 h-4" /> },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">Community</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleAction(() => setShowReviewForm(true))}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-secondary/90 transition-colors"
          >
            <Star className="w-4 h-4" />
            Write Review
          </button>
          <button
            onClick={() => handleAction(() => setShowPhotoUpload(true))}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            <Camera className="w-4 h-4" />
            Add Photo
          </button>
          <button
            onClick={() => handleAction(() => setShowReportForm(true))}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted hover:text-foreground transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            Report Issue
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "reviews" && (
          <>
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
                <Star className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No reviews yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Be the first to share your experience!</p>
                <button
                  onClick={() => handleAction(() => setShowReviewForm(true))}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-secondary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Write a Review
                </button>
              </div>
            ) : (
              reviews.map((review) => {
              const isOwnReview = user?.id === review.user_id;
              return (
                <div key={review.id} className="p-4 bg-card rounded-xl border border-border">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/profile/${review.user_id}`}
                        className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold hover:bg-primary/20 transition-colors"
                      >
                        {(review.profiles?.display_name || "U").slice(0, 2).toUpperCase()}
                      </Link>
                      <div>
                        <Link
                          href={`/profile/${review.user_id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {review.profiles?.display_name || "Anonymous"}
                        </Link>
                        <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
                      </div>
                    </div>
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
                  {review.content && (
                    <p className="mt-3 text-sm text-foreground">{review.content}</p>
                  )}
                  {isOwnReview && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                      <button
                        onClick={() => setEditingReview(review)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(review.id, review.user_id)}
                        disabled={deletingId === review.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          confirmDeleteId === review.id
                            ? "text-white bg-red-500 hover:bg-red-600"
                            : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {confirmDeleteId === review.id ? "Confirm" : "Delete"}
                      </button>
                      {confirmDeleteId === review.id && (
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
            )}
          </>
        )}

        {activeTab === "comments" && (
          <>
            <CommentForm
              courtId={courtId}
              onAuthRequired={() => openAuthModal()}
              editComment={editingComment}
              onCancelEdit={() => setEditingComment(null)}
            />
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No comments yet. Start the conversation!
              </div>
            ) : (
              comments.map((comment) => {
                const isOwnComment = user?.id === comment.user_id;
                return (
                  <div key={comment.id} className="p-4 bg-card rounded-xl border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/profile/${comment.user_id}`}
                        className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold hover:bg-primary/20 transition-colors"
                      >
                        {(comment.profiles?.display_name || "U").slice(0, 2).toUpperCase()}
                      </Link>
                      <div>
                        <Link
                          href={`/profile/${comment.user_id}`}
                          className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {comment.profiles?.display_name || "Anonymous"}
                        </Link>
                        <p className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{comment.content}</p>
                    {isOwnComment && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                        <button
                          onClick={() => setEditingComment(comment)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id, comment.user_id)}
                          disabled={deletingId === comment.id}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            confirmDeleteId === comment.id
                              ? "text-white bg-red-500 hover:bg-red-600"
                              : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {confirmDeleteId === comment.id ? "Confirm" : "Delete"}
                        </button>
                        {confirmDeleteId === comment.id && (
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}

        {activeTab === "photos" && (
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
            <Camera className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Share your photos</h3>
            <p className="text-sm text-muted-foreground mb-4">Help others see what this court looks like!</p>
            <button
              onClick={() => handleAction(() => setShowPhotoUpload(true))}
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-secondary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Upload Photo
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <ReviewForm
        isOpen={showReviewForm || !!editingReview}
        onClose={() => {
          setShowReviewForm(false);
          setEditingReview(null);
        }}
        courtId={courtId}
        editReview={editingReview}
      />
      <ReportIssueForm
        isOpen={showReportForm}
        onClose={() => setShowReportForm(false)}
        courtId={courtId}
      />
      <PhotoUpload
        isOpen={showPhotoUpload}
        onClose={() => setShowPhotoUpload(false)}
        courtId={courtId}
      />
    </div>
  );
}
