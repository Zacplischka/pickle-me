"use client";

import { useEffect, useCallback } from "react";
import { ExternalLink, X } from "lucide-react";
import { Button } from "./Button";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";

interface ExternalLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    url: string;
    siteName?: string;
}

export function ExternalLinkModal({ isOpen, onClose, onConfirm, url, siteName }: ExternalLinkModalProps) {
    const trapRef = useFocusTrap(isOpen);

    const handleEscape = useCallback(() => onClose(), [onClose]);

    useEffect(() => {
        const container = trapRef.current;
        if (!container) return;
        container.addEventListener("escape", handleEscape);
        return () => container.removeEventListener("escape", handleEscape);
    }, [isOpen, handleEscape, trapRef]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    if (!isOpen) return null;

    // Extract domain from URL for display
    const domain = (() => {
        try {
            return new URL(url).hostname.replace("www.", "");
        } catch {
            return url;
        }
    })();

    return (
        <div
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-label="Leaving mypickle.me"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div
                className="relative w-full max-w-md mx-4 bg-card rounded-xl shadow-xl border border-border animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <ExternalLink className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold text-lg text-foreground">Leaving mypickle.me</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md hover:bg-muted transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-muted-foreground mb-4">
                        You&apos;re about to visit an external website{siteName ? ` for ${siteName}` : ""}.
                    </p>
                    <div className="bg-muted/50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-muted-foreground mb-1">You will be redirected to:</p>
                        <p className="text-sm font-medium text-foreground break-all">{domain}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        This site is not affiliated with mypickle.me. Please review their terms and policies.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-4 border-t border-border">
                    <Button variant="outline" className="flex-1" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="default"
                        className="flex-1 bg-secondary hover:bg-secondary/90 text-white"
                        onClick={onConfirm}
                    >
                        Continue to Site
                    </Button>
                </div>
            </div>
        </div>
    );
}
