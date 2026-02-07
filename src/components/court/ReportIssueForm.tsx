"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

import { useAuth } from "@/lib/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

interface ReportIssueFormProps {
  isOpen: boolean;
  onClose: () => void;
  courtId: string;
}

type CorrectionType = "wrong_info" | "no_pickleball" | "closed" | "other";

const correctionOptions: { value: CorrectionType; label: string; description: string }[] = [
  { value: "wrong_info", label: "Incorrect Information", description: "Address, hours, contact info, etc. is wrong" },
  { value: "no_pickleball", label: "No Pickleball", description: "This venue doesn't have pickleball courts" },
  { value: "closed", label: "Permanently Closed", description: "This venue is no longer operating" },
  { value: "other", label: "Other Issue", description: "Something else is wrong" },
];

export function ReportIssueForm({ isOpen, onClose, courtId }: ReportIssueFormProps) {
  const [correctionType, setCorrectionType] = useState<CorrectionType | null>(null);
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!correctionType) {
      setError("Please select an issue type");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error: submitError } = await supabase.from("court_feedback").insert({
      court_id: courtId,
      user_id: user.id,
      type: "correction",
      correction_type: correctionType,
      correction_details: details.trim() || null,
    });

    if (submitError) {
      setError(submitError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const handleClose = () => {
    setCorrectionType(null);
    setDetails("");
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={handleClose}
      >
        <div
          className="w-full max-w-md bg-card rounded-xl shadow-xl border border-border overflow-hidden animate-in zoom-in-95 fade-in duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-foreground">Report an Issue</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Thank you!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your report has been submitted and will be reviewed by our team.
              </p>
              <Button onClick={handleClose}>Close</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Issue Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  What&apos;s the issue?
                </label>
                <div className="space-y-2">
                  {correctionOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setCorrectionType(option.value)}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        correctionType === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-border/80 hover:bg-muted/50"
                      }`}
                    >
                      <p className="font-medium text-sm text-foreground">{option.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div>
                <label htmlFor="details" className="block text-sm font-medium text-foreground mb-1.5">
                  Additional Details (Optional)
                </label>
                <textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Please provide any additional information that might help us fix this issue..."
                  rows={3}
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
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" loading={loading}>
                  {loading ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
  );
}
