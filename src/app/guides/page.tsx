
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, ShoppingBag, AlertTriangle, CheckCircle2, Ruler } from "lucide-react";

export default function GuidesPage() {
    return (
        <div className="flex flex-col min-h-screen pb-20">
            {/* Header */}
            <div className="relative bg-muted/30 border-b border-border/40 py-16 md:py-24 overflow-hidden">
                {/* Background Video */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-muted/80 via-muted/60 to-muted/40 z-10" />
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-60 dark:opacity-70"
                    >
                        <source src="/guide-hero.mp4" type="video/mp4" />
                    </video>
                </div>
                <div className="container relative z-20 mx-auto px-4 md:px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                        New to Pickleball?
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Everything you need to know to get started. From the basic rules to choosing your first paddle.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 py-12">
                <div className="grid md:grid-cols-[1fr_300px] gap-12 max-w-6xl mx-auto">

                    {/* Main Content */}
                    <div className="space-y-12">

                        {/* Rules Section */}
                        <section id="rules" className="scroll-mt-24">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold">The Basics Rules</h2>
                            </div>

                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                                    Pickleball is famous for being easy to learn. The game is played on a badminton-sized court with a tennis-style net.
                                </p>

                                <div className="space-y-6">
                                    <div className="bg-card border border-border/60 rounded-xl p-6">
                                        <h3 className="text-xl font-semibold mb-3">1. The Serve</h3>
                                        <p className="text-muted-foreground">
                                            The serve must be hit <strong>underhand</strong> and contact the ball below the waist. It must differ diagonally to the opponent's service court. You only get one serve attempt.
                                        </p>
                                    </div>

                                    <div className="bg-card border border-border/60 rounded-xl p-6">
                                        <h3 className="text-xl font-semibold mb-3">2. The Two-Bounce Rule</h3>
                                        <p className="text-muted-foreground">
                                            When the ball is served, the receiving team must let it bounce before returning, and then the serving team must let it bounce before returning. After these two bounces (one on each side), volleys are allowed.
                                        </p>
                                    </div>

                                    <div className="bg-card border border-border/60 rounded-xl p-6 border-l-4 border-l-accent">
                                        <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                            3. The Kitchen (Non-Volley Zone)
                                            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">Important</span>
                                        </h3>
                                        <p className="text-muted-foreground">
                                            The 7-foot zone on both sides of the net is the "Kitchen". You cannot volley the ball (hit it in the air) while standing in this zone. You can only enter the kitchen to hit a ball that has already bounced.
                                        </p>
                                    </div>

                                    {/* Court Diagram */}
                                    <div className="bg-card border border-border/60 rounded-xl p-6">
                                        <Image
                                            src="/court-diagram.jpg"
                                            alt="Pickleball court diagram showing dimensions: 44 feet long by 20 feet wide, with 7-foot non-volley zones (kitchen) on each side of the net"
                                            width={1024}
                                            height={683}
                                            className="w-full rounded-lg"
                                        />
                                        <div className="mt-4 pt-4 border-t border-border/60">
                                            <h4 className="font-semibold flex items-center gap-2 mb-3">
                                                <Ruler className="w-4 h-4 text-muted-foreground" />
                                                Key Measurements
                                            </h4>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li className="flex gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                                    <span>Court size: <strong className="text-foreground">44ft long × 20ft wide</strong></span>
                                                </li>
                                                <li className="flex gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                                    <span>Kitchen (Non-Volley Zone): <strong className="text-foreground">7ft from the net</strong></span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Gear Section */}
                        <section id="gear" className="scroll-mt-24 pt-8 border-t border-border">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-secondary/10 p-2 rounded-lg text-secondary">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold">Essential Gear</h2>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="bg-card p-6 rounded-xl border border-border/60">
                                    <h3 className="font-semibold text-lg mb-2">The Paddle</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Unlike tennis racquets, pickleball paddles are solid. They are made of composite materials like graphite or fiberglass.
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                            <span>Start with a mid-weight paddle (7.5-8 oz)</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                            <span>Expect to spend $50-$100 for a decent starter</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-card p-6 rounded-xl border border-border/60">
                                    <h3 className="font-semibold text-lg mb-2">Shoes</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        <strong>Do not wear running shoes.</strong> You need "court shoes" (tennis or indoor court) that provide lateral support to prevent ankle injuries.
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex gap-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                            <span>Running shoes lack side support</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                            <span>Look for tennis or volleyball shoes</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="hidden md:block space-y-6">
                        <div className="sticky top-24">
                            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                <h3 className="font-semibold mb-4">Quick Navigation</h3>
                                <nav className="space-y-2 text-sm">
                                    <Link href="#rules" className="block p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                        The Basic Rules
                                    </Link>
                                    <Link href="#gear" className="block p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                        Essential Gear
                                    </Link>
                                </nav>
                            </div>

                            <div className="mt-6 bg-primary text-primary-foreground rounded-xl p-6 shadow-md">
                                <h3 className="font-bold text-lg mb-2">Ready to play?</h3>
                                <p className="text-sm opacity-90 mb-4">
                                    Now that you know the rules, find a court near you.
                                </p>
                                <Link
                                    href="/search"
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 w-full"
                                >
                                    Find Courts
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
