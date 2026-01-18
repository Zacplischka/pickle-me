"use client";

import { useState } from "react";
import { Star, MessageCircle, AlertTriangle, Camera, Plus } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { ReviewForm } from "./ReviewForm";
import { CommentForm } from "./CommentForm";
import { ReportIssueForm } from "./ReportIssueForm";
import { PhotoUpload } from "./PhotoUpload";
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  const { user } = useAuth();

  const handleAction = (action: () => void) => {
    if (!user) {
      setShowAuthModal(true);
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
              reviews.map((review) => (
                <div key={review.id} className="p-4 bg-card rounded-xl border border-border">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                        {(review.profiles?.display_name || "U").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {review.profiles?.display_name || "Anonymous"}
                        </p>
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
                </div>
              ))
            )}
          </>
        )}

        {activeTab === "comments" && (
          <>
            <CommentForm courtId={courtId} onAuthRequired={() => setShowAuthModal(true)} />
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No comments yet. Start the conversation!
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-4 bg-card rounded-xl border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                      {(comment.profiles?.display_name || "U").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {comment.profiles?.display_name || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground">{comment.content}</p>
                </div>
              ))
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
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <ReviewForm
        isOpen={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        courtId={courtId}
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
