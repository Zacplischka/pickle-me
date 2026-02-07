"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Mail, Loader2 } from "lucide-react";

import { signInWithEmail, signUpWithEmail, signInWithProvider, resetPassword } from "@/lib/supabase/auth";
import { Button } from "@/components/ui/Button";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "signin" | "signup";
}

type AuthMode = "signin" | "signup" | "reset";

export function AuthModal({ isOpen, onClose, defaultMode = "signin" }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const trapRef = useFocusTrap(isOpen, { onEscape: onClose });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "reset") {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setMessage("Check your email for a password reset link.");
        }
      } else if (mode === "signin") {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setError(error.message);
        } else {
          onClose();
        }
      } else {
        const { error } = await signUpWithEmail(email, password);
        if (error) {
          setError(error.message);
        } else {
          setMessage("Check your email to confirm your account.");
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "facebook") => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await signInWithProvider(provider);
      if (error) {
        setError(error.message);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setError(null);
    setMessage(null);
  };

  const switchMode = (newMode: AuthMode) => {
    resetForm();
    setMode(newMode);
  };

  if (!isOpen) return null;

  // Check for browser environment (required for createPortal)
  if (typeof document === "undefined") return null;

  const modalContent = (
    <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label={mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Reset Password"}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md max-h-[90vh] bg-card rounded-xl shadow-xl border border-border overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">
              {mode === "signin" && "Sign In"}
              {mode === "signup" && "Create Account"}
              {mode === "reset" && "Reset Password"}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {/* OAuth Buttons */}
            {mode !== "reset" && (
              <>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn("google")}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-border rounded-lg bg-background hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-foreground">Continue with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn("facebook")}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-border rounded-lg bg-background hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="text-sm font-medium text-foreground">Continue with Facebook</span>
                  </button>
                </div>

                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              </>
            )}

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {mode !== "reset" && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md">{error}</p>
              )}

              {message && (
                <p className="text-sm text-green-600 bg-green-500/10 px-3 py-2 rounded-md">{message}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    {mode === "signin" && "Sign In"}
                    {mode === "signup" && "Create Account"}
                    {mode === "reset" && "Send Reset Link"}
                  </>
                )}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center text-sm">
              {mode === "signin" && (
                <>
                  <button
                    type="button"
                    onClick={() => switchMode("reset")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Forgot password?
                  </button>
                  <div className="mt-2 text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("signup")}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign up
                    </button>
                  </div>
                </>
              )}
              {mode === "signup" && (
                <div className="text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </div>
              )}
              {mode === "reset" && (
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="text-primary hover:underline font-medium"
                >
                  Back to sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
  );

  // Use portal to render at document body level, escaping navbar's stacking context
  return createPortal(modalContent, document.body);
}
