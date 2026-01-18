"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { submitCourt } from "@/app/list-court/actions";
import { CheckCircle } from "lucide-react";

const REGIONS = [
  "Melbourne CBD",
  "Inner Melbourne",
  "Northern Melbourne",
  "Eastern Melbourne",
  "South East Melbourne",
  "Western Melbourne",
  "Mornington Peninsula",
  "Geelong & Surf Coast",
  "Ballarat & Central Highlands",
  "Bendigo & Central Victoria",
  "Gippsland",
  "North East Victoria",
  "North West Victoria",
];

const COURT_TYPES = ["Indoor", "Outdoor", "Hybrid"];
const VENUE_TYPES = ["Public", "Private Club", "Council", "Recreation Centre", "Tennis Club"];
const SURFACES = ["Concrete", "Asphalt", "Sport Court", "Synthetic Grass", "Wood", "Other"];

export function CourtSubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    const result = await submitCourt(formData);

    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
    } else {
      setError(result.error || "Something went wrong. Please try again.");
    }
  }

  if (isSuccess) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Thank You!</h2>
        <p className="text-muted-foreground mb-6">
          Your court submission has been received. We&apos;ll review it and add it to the directory if approved.
        </p>
        <Button
          onClick={() => {
            setIsSuccess(false);
            setError(null);
          }}
          variant="outline"
        >
          Submit Another Court
        </Button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
              Court / Venue Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="e.g., Melbourne Sports Centre"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="suburb" className="block text-sm font-medium text-foreground mb-1.5">
                Suburb <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                id="suburb"
                name="suburb"
                required
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="e.g., Richmond"
              />
            </div>

            <div>
              <label htmlFor="region" className="block text-sm font-medium text-foreground mb-1.5">
                Region
              </label>
              <select
                id="region"
                name="region"
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="">Select a region</option>
                {REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-foreground mb-1.5">
              Street Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="e.g., 123 Main Street"
            />
          </div>
        </div>
      </div>

      {/* Court Details */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Court Details</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="courts_count" className="block text-sm font-medium text-foreground mb-1.5">
                Number of Courts
              </label>
              <input
                type="text"
                id="courts_count"
                name="courts_count"
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="e.g., 4"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1.5">
                Court Type
              </label>
              <select
                id="type"
                name="type"
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="">Select type</option>
                {COURT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="surface" className="block text-sm font-medium text-foreground mb-1.5">
                Surface Type
              </label>
              <select
                id="surface"
                name="surface"
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="">Select surface</option>
                {SURFACES.map((surface) => (
                  <option key={surface} value={surface}>
                    {surface}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="venue_type" className="block text-sm font-medium text-foreground mb-1.5">
                Venue Type
              </label>
              <select
                id="venue_type"
                name="venue_type"
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="">Select venue type</option>
                {VENUE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1.5">
              Price / Cost
            </label>
            <input
              type="text"
              id="price"
              name="price"
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="e.g., Free, $10/hour, Members only"
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Additional Information</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-foreground mb-1.5">
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1.5">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              placeholder="Any additional details about the court (e.g., booking requirements, facilities available, best times to play...)"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="text-destructive">*</span> Required fields
        </p>
        <Button type="submit" loading={isSubmitting} size="lg">
          {isSubmitting ? "Submitting..." : "Submit Court"}
        </Button>
      </div>
    </form>
  );
}
