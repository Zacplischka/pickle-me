"use client";

import { useState } from "react";
import type { CourtSubmission } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/Button";
import { Check, X, Loader2, MapPin, Clock, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

// Format date consistently to avoid hydration mismatches
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

interface SubmissionsListProps {
  submissions: CourtSubmission[];
}

export function SubmissionsList({ submissions }: SubmissionsListProps) {
  if (submissions.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
          <Check className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          All caught up!
        </h2>
        <p className="text-muted-foreground">
          No pending submissions to review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <SubmissionCard key={submission.id} submission={submission} />
      ))}
    </div>
  );
}

function SubmissionCard({ submission }: { submission: CourtSubmission }) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const router = useRouter();

  async function handleApprove() {
    setIsApproving(true);
    const res = await fetch("/api/admin/submissions/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId: submission.id }),
    });
    setIsApproving(false);

    if (res.ok) {
      router.refresh();
    }
  }

  async function handleReject(reason?: string) {
    setIsRejecting(true);
    const res = await fetch("/api/admin/submissions/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId: submission.id, reason }),
    });
    setIsRejecting(false);
    setShowRejectModal(false);

    if (res.ok) {
      router.refresh();
    }
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <>
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-semibold text-foreground">
                {submission.name}
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  statusColors[submission.status as keyof typeof statusColors]
                }`}
              >
                {submission.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {submission.suburb}
              {submission.region && `, ${submission.region}`}
            </div>
          </div>

          {submission.status === "pending" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRejectModal(true)}
                disabled={isRejecting || isApproving}
              >
                {isRejecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <X className="w-4 h-4 mr-1" /> Reject
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
              >
                {isApproving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" /> Approve
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {submission.address && (
            <div>
              <span className="text-muted-foreground">Address:</span>
              <p className="text-foreground">{submission.address}</p>
            </div>
          )}
          {submission.type && (
            <div>
              <span className="text-muted-foreground">Type:</span>
              <p className="text-foreground">{submission.type}</p>
            </div>
          )}
          {submission.courts_count && (
            <div>
              <span className="text-muted-foreground">Courts:</span>
              <p className="text-foreground">{submission.courts_count}</p>
            </div>
          )}
          {submission.surface && (
            <div>
              <span className="text-muted-foreground">Surface:</span>
              <p className="text-foreground">{submission.surface}</p>
            </div>
          )}
          {submission.venue_type && (
            <div>
              <span className="text-muted-foreground">Venue Type:</span>
              <p className="text-foreground">{submission.venue_type}</p>
            </div>
          )}
          {submission.price && (
            <div>
              <span className="text-muted-foreground">Price:</span>
              <p className="text-foreground">{submission.price}</p>
            </div>
          )}
          {submission.website && (
            <div>
              <span className="text-muted-foreground">Website:</span>
              <a
                href={submission.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                Link <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {submission.notes && (
          <div className="mt-4 pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">Notes:</span>
            <p className="text-sm text-foreground mt-1">{submission.notes}</p>
          </div>
        )}

        {submission.rejection_reason && (
          <div className="mt-4 pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">Rejection Reason:</span>
            <p className="text-sm text-foreground mt-1">{submission.rejection_reason}</p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Submitted: {formatDate(submission.created_at!)}
          </div>
          {submission.reviewed_at && (
            <div>
              Reviewed: {formatDate(submission.reviewed_at)}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <RejectModal
          onClose={() => setShowRejectModal(false)}
          onReject={handleReject}
          isLoading={isRejecting}
        />
      )}
    </>
  );
}

function RejectModal({
  onClose,
  onReject,
  isLoading,
}: {
  onClose: () => void;
  onReject: (reason?: string) => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Reject Submission
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Optionally provide a reason for rejection.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection (optional)"
          rows={3}
          className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none mb-4"
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => onReject(reason || undefined)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Reject"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
