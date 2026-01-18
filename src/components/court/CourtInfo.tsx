"use client";

import { useState } from "react";
import { Clock, Phone, Globe, Info, CheckCircle } from "lucide-react";
import type { Court } from "@/lib/supabase/database.types";
import { OpeningHours } from "@/components/OpeningHours";

interface CourtInfoProps {
  court: Court;
}

type Tab = "details" | "hours" | "contact";

export function CourtInfo({ court }: CourtInfoProps) {
  const [activeTab, setActiveTab] = useState<Tab>("details");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "details", label: "Details", icon: <Info className="w-4 h-4" /> },
    { id: "hours", label: "Hours", icon: <Clock className="w-4 h-4" /> },
    { id: "contact", label: "Contact", icon: <Phone className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "details" && (
          <div className="space-y-6">
            {/* Features */}
            {court.features && court.features.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Features & Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {court.features.map((feature) => (
                    <span
                      key={feature}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-sm text-foreground"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Court Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {court.surface && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Surface</p>
                  <p className="text-sm font-medium text-foreground">{court.surface}</p>
                </div>
              )}
              {court.courts_count && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Number of Courts</p>
                  <p className="text-sm font-medium text-foreground">{court.courts_count}</p>
                </div>
              )}
              {court.line_marking && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Line Marking</p>
                  <p className="text-sm font-medium text-foreground">{court.line_marking}</p>
                </div>
              )}
              {court.venue_type && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Venue Type</p>
                  <p className="text-sm font-medium text-foreground">{court.venue_type}</p>
                </div>
              )}
              {court.price && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Price</p>
                  <p className="text-sm font-medium text-foreground">{court.price}</p>
                </div>
              )}
              {court.type && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Type</p>
                  <p className="text-sm font-medium text-foreground">{court.type}</p>
                </div>
              )}
            </div>

            {/* Notes */}
            {court.notes && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground">{court.notes}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "hours" && (
          <div>
            {court.google_opening_hours ? (
              <OpeningHours
                hours={court.google_opening_hours as { weekdayDescriptions?: string[] }}
                expanded
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Opening hours not available. Please contact the venue directly.
              </p>
            )}
          </div>
        )}

        {activeTab === "contact" && (
          <div className="space-y-4">
            {court.google_phone && (
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Phone</p>
                  <a
                    href={`tel:${court.google_phone}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {court.google_phone}
                  </a>
                </div>
              </div>
            )}

            {(court.google_website || court.website) && (
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Website</p>
                  <a
                    href={court.google_website || court.website || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline truncate block max-w-xs"
                  >
                    {(court.google_website || court.website || "").replace(/^https?:\/\//, "")}
                  </a>
                </div>
              </div>
            )}

            {court.google_formatted_address && (
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Address</p>
                  <p className="text-sm font-medium text-foreground">{court.google_formatted_address}</p>
                </div>
              </div>
            )}

            {!court.google_phone && !court.google_website && !court.website && (
              <p className="text-sm text-muted-foreground">
                Contact information not available.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
