"use client";

import { useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

export function DeleteAccount() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (confirmation !== "DELETE") {
      setError("Please type DELETE to confirm");
      return;
    }

    if (!user) return;

    setLoading(true);
    setError(null);

    const res = await fetch("/api/account/delete", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to delete account");
      setLoading(false);
      return;
    }

    // Redirect to home (user is now signed out server-side)
    window.location.href = "/";
  };

  return (
    <div className="bg-card border border-red-500/30 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-2">Danger Zone</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Once you delete your account, your profile will be anonymized. Your reviews and photos will remain but will show as "Deleted User".
      </p>

      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
      >
        <AlertTriangle className="w-4 h-4" />
        Delete Account
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-card rounded-xl shadow-xl border border-border overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Delete Account</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleDelete} className="p-6 space-y-4">
                <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-red-500">This action cannot be undone</p>
                    <p className="text-muted-foreground mt-1">
                      Your profile will be anonymized. All your reviews and photos will remain visible but will show as "Deleted User".
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmation" className="block text-sm font-medium text-foreground mb-1.5">
                    Type <span className="font-mono bg-muted px-1 rounded">DELETE</span> to confirm
                  </label>
                  <input
                    id="confirmation"
                    type="text"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    placeholder="DELETE"
                    required
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md">{error}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                    disabled={loading || confirmation !== "DELETE"}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
