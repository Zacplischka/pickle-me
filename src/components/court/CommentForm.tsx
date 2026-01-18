"use client";

import { useState, useEffect } from "react";
import { Send, Loader2, X } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { CourtFeedback } from "@/lib/supabase/database.types";

interface CommentFormProps {
  courtId: string;
  onAuthRequired: () => void;
  editComment?: CourtFeedback | null;
  onCancelEdit?: () => void;
}

export function CommentForm({ courtId, onAuthRequired, editComment, onCancelEdit }: CommentFormProps) {
  const [content, setContent] = useState(editComment?.content || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const isEditing = !!editComment;

  // Update form when editComment changes
  useEffect(() => {
    if (editComment) {
      setContent(editComment.content || "");
    } else {
      setContent("");
    }
  }, [editComment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      onAuthRequired();
      return;
    }

    if (!content.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();

    if (isEditing && editComment) {
      // Update existing comment
      const { error: updateError } = await supabase
        .from("court_feedback")
        .update({
          content: content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", editComment.id)
        .eq("user_id", user.id); // Ensure user owns the comment

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      // Reset form
      setContent("");
      setLoading(false);
      onCancelEdit?.();

      // Refresh the page to show updated comment
      window.location.reload();
    } else {
      // Create new comment
      const { error: submitError } = await supabase.from("court_feedback").insert({
        court_id: courtId,
        user_id: user.id,
        type: "comment",
        content: content.trim(),
      });

      if (submitError) {
        setError(submitError.message);
        setLoading(false);
        return;
      }

      // Reset form
      setContent("");
      setLoading(false);

      // Refresh the page to show new comment
      window.location.reload();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {isEditing && (
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
          <span>Editing comment</span>
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
        </div>
      )}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={user ? (isEditing ? "Update your comment..." : "Add a comment...") : "Sign in to comment"}
            disabled={loading}
            className="w-full px-4 py-2.5 pr-12 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
            onClick={() => !user && onAuthRequired()}
          />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </form>
  );
}
