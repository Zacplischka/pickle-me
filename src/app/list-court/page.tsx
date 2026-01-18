import { CourtSubmissionForm } from "@/components/CourtSubmissionForm";
import { MapPin } from "lucide-react";

export const metadata = {
  title: "List a Court | mypickle.me",
  description: "Submit a pickleball court to be listed on Victoria's #1 pickleball court directory.",
};

export default function ListCourtPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/50 border-b border-border/40">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-md bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary ring-1 ring-inset ring-secondary/20 mb-4">
              <MapPin className="mr-1.5 h-4 w-4" /> Add a Court
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              List a Pickleball Court
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              Know of a pickleball court that&apos;s not on our map? Help us grow Victoria&apos;s most comprehensive court directory by submitting it below.
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-2xl">
          <CourtSubmissionForm />
        </div>
      </div>
    </div>
  );
}
