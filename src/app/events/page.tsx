
import { Button } from "@/components/ui/Button";
import { Calendar, MapPin, Clock, Mail } from "lucide-react";
import Link from "next/link";

const EVENTS = [
    {
        id: 1,
        title: "Social Saturday at Royal Park",
        date: "Every Saturday",
        time: "10:00 AM - 1:00 PM",
        location: "Royal Park Tennis Club, Parkville",
        description: "Looking for a game? Come down for our weekly social session. All skill levels welcome, paddles provided if needed.",
        category: "Social Play",
        price: "$15 non-members",
    },
    {
        id: 2,
        title: "Victorian Open Championships",
        date: "March 15-16, 2026",
        time: "8:00 AM - 6:00 PM",
        location: "Melbourne Sports & Aquatic Centre",
        description: "The biggest event on the calendar! Singles, Doubles, and Mixed categories. Registration opens Feb 1st.",
        category: "Tournament",
        price: "Registration fees apply",
    },
    {
        id: 3,
        title: "Beginner Clinic: Learning the Basics",
        date: "Sunday, Feb 8th",
        time: "9:00 AM - 11:00 AM",
        location: "Albert Park",
        description: "New to Pickleball? Join our certified instructors for a comprehensive introduction to rules, scoring, and basic shots.",
        category: "Workshop",
        price: "$25",
    },
];

export default function EventsPage() {
    return (
        <div className="flex flex-col min-h-screen pb-20">
            {/* Header */}
            <div className="bg-muted/30 border-b border-border/40 py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                        Upcoming Events in Victoria
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        From social sessions to competitive tournaments. Find your next game and connect with the community.
                    </p>
                </div>
            </div>

            {/* Events Grid */}
            <div className="container mx-auto px-4 md:px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {EVENTS.map((event) => (
                        <div
                            key={event.id}
                            className="group bg-card border border-border/60 hover:border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                    {event.category}
                                </div>
                                <div className="text-sm font-medium text-primary">
                                    {event.price}
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                                {event.title}
                            </h3>

                            <div className="space-y-2 mb-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{event.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{event.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{event.location}</span>
                                </div>
                            </div>

                            <p className="text-muted-foreground mb-6 flex-grow">
                                {event.description}
                            </p>

                            <Button className="w-full sm:w-auto" variant="outline">
                                Event Details
                            </Button>
                        </div>
                    ))}
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
                            Submit and Event
                        </Link>
                    </div>

                    {/* Decorative background circle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -z-0" />
                </div>
            </div>
        </div>
    );
}
