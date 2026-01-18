"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface CommentFormProps {
  courtId: string;
  onAuthRequired: () => void;
}

export function CommentForm({ courtId, onAuthRequired }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

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
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={user ? "Add a comment..." : "Sign in to comment"}
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
