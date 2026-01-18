"use client";

import { useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { updateProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

interface ProfileSettingsProps {
  displayName: string | null;
  avatarUrl: string | null;
  onUpdate: () => void;
}

export function ProfileSettings({ displayName, avatarUrl, onUpdate }: ProfileSettingsProps) {
  const [name, setName] = useState(displayName || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { user } = useAuth();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB");
      return;
    }

    setUploading(true);
    setError(null);

    const supabase = createClient();

    // Upload to avatars bucket
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("public")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("public")
      .getPublicUrl(filePath);

    // Update profile
    const result = await updateProfile(user.id, { avatar_url: publicUrl });

    if (result.error) {
      setError(result.error);
    } else {
      onUpdate();
    }

    setUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    const result = await updateProfile(user.id, { display_name: name.trim() || null });

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    }

    setSaving(false);
  };

  const initials = (name || "User").slice(0, 2).toUpperCase();

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Profile</h2>

      <div className="space-y-6">
        {/* Avatar */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Profile Picture
          </label>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>JPG, PNG or GIF</p>
              <p>Max 2MB</p>
            </div>
          </div>
        </div>

        {/* Display Name */}
        <form onSubmit={handleSave}>
          <label htmlFor="displayName" className="block text-sm font-medium text-foreground mb-1.5">
            Display Name
          </label>
          <div className="flex gap-3">
            <input
              id="displayName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
              className="flex-1 px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>

        {error && (
          <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-600 bg-green-500/10 px-3 py-2 rounded-md">
            Profile updated successfully!
          </p>
        )}
      </div>
    </div>
  );
}
