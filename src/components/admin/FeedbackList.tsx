"use client";

import { useState } from "react";
import { Star, MessageCircle, AlertTriangle, Eye, EyeOff, CheckCircle, Trash2, Loader2 } from "lucide-react";
import type { CourtFeedbackWithProfile } from "@/lib/supabase/queries";
import { formatDate } from "@/lib/utils";

interface FeedbackListProps {
  feedback: CourtFeedbackWithProfile[];
}

export function FeedbackList({ feedback }: FeedbackListProps) {
  const [items, setItems] = useState(feedback);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (id: string, action: "hide" | "resolve" | "delete") => {
    setLoadingId(id);

    const res = await fetch(`/api/admin/feedback/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedbackId: id }),
    });

    if (res.ok) {
      if (action === "delete") {
        setItems(items.filter((item) => item.id !== id));
      } else {
        setItems(
          items.map((item) =>
            item.id === id
              ? { ...item, status: action === "hide" ? "hidden" : "resolved" }
              : item
          )
        );
      }
    }

    setLoadingId(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "review":
        return <Star className="w-4 h-4 text-amber-500" />;
      case "comment":
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "correction":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-0.5 bg-green-500/10 text-green-600 text-xs rounded-full">Active</span>;
      case "hidden":
        return <span className="px-2 py-0.5 bg-gray-500/10 text-gray-500 text-xs rounded-full">Hidden</span>;
      case "resolved":
        return <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 text-xs rounded-full">Resolved</span>;
      default:
        return null;
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No feedback to display.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className={`p-4 bg-card rounded-xl border ${
            item.status === "hidden" ? "border-border/50 opacity-60" : "border-border"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                {getTypeIcon(item.type)}
                <span className="text-sm font-medium text-foreground capitalize">{item.type}</span>
                {getStatusBadge(item.status)}
                {item.rating && (
                  <div className="flex items-center gap-1 ml-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < item.rating! ? "fill-amber-400 text-amber-400" : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* User & Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span>{item.profiles?.display_name || "Anonymous"}</span>
                <span>•</span>
                <span>{formatDate(item.created_at, { includeTime: true })}</span>
              </div>

              {/* Content */}
              {item.content && (
                <p className="text-sm text-foreground mb-2">{item.content}</p>
              )}

              {/* Correction Details */}
              {item.type === "correction" && (
                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Issue Type:</p>
                  <p className="text-sm font-medium text-foreground capitalize">
                    {item.correction_type?.replace("_", " ")}
                  </p>
                  {item.correction_details && (
                    <>
                      <p className="text-xs text-muted-foreground mt-2 mb-1">Details:</p>
                      <p className="text-sm text-foreground">{item.correction_details}</p>
                    </>
                  )}
                </div>
              )}

              {/* Court ID */}
              <p className="text-xs text-muted-foreground mt-2">
                Court ID: {item.court_id}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {item.status === "active" && (
                <>
                  <button
                    onClick={() => handleAction(item.id, "hide")}
                    disabled={loadingId === item.id}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    title="Hide"
                  >
                    {loadingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  {item.type === "correction" && (
                    <button
                      onClick={() => handleAction(item.id, "resolve")}
                      disabled={loadingId === item.id}
                      className="p-2 text-muted-foreground hover:text-green-600 hover:bg-green-500/10 rounded-md transition-colors"
                      title="Mark Resolved"
                    >
                      {loadingId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </>
              )}
              {item.status === "hidden" && (
                <button
                  onClick={() => handleAction(item.id, "resolve")}
                  disabled={loadingId === item.id}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  title="Restore"
                >
                  {loadingId === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
              <button
                onClick={() => handleAction(item.id, "delete")}
                disabled={loadingId === item.id}
                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                title="Delete"
              >
                {loadingId === item.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
