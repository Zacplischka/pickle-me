"use client";

import { useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { updateProfile } from "@/lib/supabase/profile";

interface EmailPreferencesProps {
  preferences: {
    submission_reviewed: boolean;
    replies: boolean;
    weekly_digest: boolean;
  } | null;
  onUpdate: () => void;
}

export function EmailPreferences({ preferences, onUpdate }: EmailPreferencesProps) {
  const [prefs, setPrefs] = useState(preferences || {
    submission_reviewed: true,
    replies: true,
    weekly_digest: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const handleToggle = async (key: keyof typeof prefs) => {
    if (!user) return;

    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    setSaving(true);
    setError(null);

    const result = await updateProfile(user.id, { email_preferences: newPrefs });

    if (result.error) {
      setError(result.error);
      // Revert on error
      setPrefs(prefs);
    } else {
      onUpdate();
    }

    setSaving(false);
  };

  const options = [
    {
      key: "submission_reviewed" as const,
      label: "Court submission reviewed",
      description: "Get notified when your court submission is approved or rejected",
    },
    {
      key: "replies" as const,
      label: "Replies to my content",
      description: "Get notified when someone replies to your review or comment",
    },
    {
      key: "weekly_digest" as const,
      label: "Weekly digest",
      description: "Receive a weekly summary of new courts and activity",
    },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Email Preferences</h2>

      <div className="space-y-4">
        {options.map((option) => (
          <label
            key={option.key}
            className="flex items-start gap-4 cursor-pointer"
          >
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={prefs[option.key]}
                onChange={() => handleToggle(option.key)}
                disabled={saving}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{option.label}</p>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </div>
          </label>
        ))}
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md">{error}</p>
      )}
    </div>
  );
}
