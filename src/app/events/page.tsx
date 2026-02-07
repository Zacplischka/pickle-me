import { Calendar, Mail } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pickleball Events in Victoria",
  description: "Find pickleball tournaments, social sessions, and workshops across Victoria, Australia. Submit your own event for free.",
  openGraph: {
    title: "Pickleball Events in Victoria | mypickle.me",
    description: "Discover upcoming pickleball events, tournaments, and social sessions near you.",
  },
};

export default function EventsPage() {
    return (
        <div className="flex flex-col min-h-screen pb-20">
            {/* Header */}
            <div className="bg-muted/30 border-b border-border/40 py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                        Events
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        From social sessions to competitive tournaments. Find your next game and connect with the community.
                    </p>
                </div>
            </div>

            {/* Coming Soon */}
            <div className="container mx-auto px-4 md:px-6 py-12 flex-grow flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-3">Coming Soon</h2>
                    <p className="text-muted-foreground mb-6">
                        We&apos;re working on bringing you the best pickleball events across Victoria. Check back soon for tournaments, social sessions, and workshops.
                    </p>
                </div>
            </div>

            {/* CTA Section */}
            <div className="container mx-auto px-4 md:px-6">
                <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 max-w-5xl mx-auto text-center relative overflow-hidden">
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-2xl md:text-3xl font-bold">Hosting an event?</h2>
                        <p className="text-primary-foreground/80 max-w-xl mx-auto">
                            We want to help grow the sport. List your social session, tournament, or workshop on mypickle.me for free.
                        </p>
                        <Link
                            href="mailto:hello@mypickle.me"
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-11 rounded-md px-8 gap-2"
                        >
                            <Mail className="w-4 h-4" />
                            Submit an Event
                        </Link>
                    </div>

                    {/* Decorative background circle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -z-0" />
                </div>
            </div>
        </div>
    );
}
