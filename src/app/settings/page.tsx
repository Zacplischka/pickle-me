"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { EmailPreferences } from "@/components/settings/EmailPreferences";
import { ChangePassword } from "@/components/settings/ChangePassword";
import { DeleteAccount } from "@/components/settings/DeleteAccount";
import { Spinner } from "@/components/ui/Spinner";

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [isOAuthUser, setIsOAuthUser] = useState(false);

  useEffect(() => {
    // Redirect to home if not logged in
    if (!authLoading && !user) {
      router.push("/");
      return;
    }

    // Check if user signed in via OAuth
    if (user) {
      const identities = user.identities || [];
      const hasOAuthIdentity = identities.some(
        (identity) => identity.provider !== "email"
      );
      setIsOAuthUser(hasOAuthIdentity);
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/profile"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>

        {/* Profile Settings */}
        <ProfileSettings
          displayName={profile.display_name}
          avatarUrl={profile.avatar_url}
          onUpdate={refreshProfile}
        />

        {/* Email Preferences */}
        <EmailPreferences
          preferences={profile.email_preferences}
          onUpdate={refreshProfile}
        />

        {/* Change Password (only for email users) */}
        <ChangePassword isOAuthUser={isOAuthUser} />

        {/* Delete Account */}
        <DeleteAccount />
      </div>
    </div>
  );
}
