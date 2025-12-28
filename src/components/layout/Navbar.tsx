"use client";

import Link from "next/link";
import { Menu, Search, MapPin } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative w-8 h-8 flex items-center justify-center bg-secondary rounded-lg text-secondary-foreground font-bold shadow-sm group-hover:bg-secondary/90 transition-colors">
                        P
                    </div>
                    <span className="font-bold text-xl tracking-tight text-foreground">
                        Pickle Me <span className="text-secondary">Vic</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Find Courts
                    </Link>
                    <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Community
                    </Link>
                    <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Events
                    </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-full transition-colors">
                        <Search className="w-4 h-4" />
                        <span className="opacity-60">Search courts...</span>
                    </button>

                    <div className="hidden md:block">
                        <ThemeToggle />
                    </div>

                    <button className="hidden md:inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                        List a Court
                    </button>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-foreground/80 hover:text-foreground"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-border/40 bg-background"
                    >
                        <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                            <Link
                                href="/search"
                                className="flex items-center gap-2 text-sm font-medium py-2 text-foreground/80"
                                onClick={() => setIsOpen(false)}
                            >
                                <MapPin className="w-4 h-4" />
                                Find Courts
                            </Link>
                            <Link
                                href="#"
                                className="text-sm font-medium py-2 text-foreground/80"
                                onClick={() => setIsOpen(false)}
                            >
                                Community
                            </Link>
                            <Link
                                href="#"
                                className="text-sm font-medium py-2 text-foreground/80"
                                onClick={() => setIsOpen(false)}
                            >
                                Events
                            </Link>
                            <hr className="border-border/40" />
                            <ThemeToggle variant="mobile" />
                            <button className="w-full text-center bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium">
                                List a Court
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
