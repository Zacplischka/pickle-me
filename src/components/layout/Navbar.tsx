"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, MapPin, User } from "lucide-react";
import { useState, useEffect } from "react";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SearchInput } from "@/components/search/SearchInput";
import { useCourts } from "@/lib/contexts/CourtsContext";
import { useAuth } from "@/lib/contexts/AuthContext";
import { UserMenu } from "@/components/auth/UserMenu";
import { useModals } from "@/lib/contexts/ModalContext";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const courts = useCourts();
    const { user, profile, loading } = useAuth();
    const { openAuthModal } = useModals();

    // Prevent hydration mismatch by only rendering auth UI after mount
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                        <Image
                            src="/final.png"
                            alt="MyPickle.me Logo"
                            width={48}
                            height={48}
                            className="object-contain"
                        />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-foreground">
                        MyPickle<span className="text-secondary">.me</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Find Courts
                    </Link>
                    <Link href="/guides" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Guides
                    </Link>
                    <Link href="/events" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Events
                    </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                        <SearchInput courts={courts} variant="navbar" />
                    </div>

                    <div className="hidden md:block">
                        <ThemeToggle />
                    </div>

                    <Link
                        href="/list-court"
                        className="hidden md:inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                        List a Court
                    </Link>

                    {/* Auth UI */}
                    <div className="hidden md:block">
                        {mounted && !loading ? (
                            user ? (
                                <UserMenu user={user} displayName={profile?.display_name || undefined} avatarUrl={profile?.avatar_url} />
                            ) : (
                                <button
                                    onClick={() => openAuthModal()}
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    Sign In
                                </button>
                            )
                        ) : (
                            <div className="w-20 h-9" />
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-foreground/80 hover:text-foreground"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={isOpen}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                    <div
                        className="md:hidden border-t border-border/40 bg-background animate-in fade-in slide-in-from-top-2 duration-200"
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
                                href="/guides"
                                className="text-sm font-medium py-2 text-foreground/80"
                                onClick={() => setIsOpen(false)}
                            >
                                Guides
                            </Link>
                            <Link
                                href="/events"
                                className="text-sm font-medium py-2 text-foreground/80"
                                onClick={() => setIsOpen(false)}
                            >
                                Events
                            </Link>
                            <hr className="border-border/40" />
                            <ThemeToggle variant="mobile" />
                            <Link
                                href="/list-court"
                                className="w-full text-center bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium block"
                                onClick={() => setIsOpen(false)}
                            >
                                List a Court
                            </Link>
                            {/* Mobile Auth */}
                            {mounted && !loading ? (
                                user ? (
                                    <>
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-2 py-2"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold overflow-hidden">
                                                {profile?.avatar_url ? (
                                                    <Image src={profile.avatar_url} alt="Avatar" width={32} height={32} className="w-full h-full object-cover" />
                                                ) : (
                                                    (profile?.display_name || user.email?.split("@")[0] || "U").slice(0, 2).toUpperCase()
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-foreground">
                                                {profile?.display_name || user.email?.split("@")[0]}
                                            </span>
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="text-sm font-medium py-2 text-foreground/80"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Settings
                                        </Link>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            openAuthModal();
                                        }}
                                        className="w-full text-center border border-border text-foreground rounded-md py-2 text-sm font-medium"
                                    >
                                        Sign In
                                    </button>
                                )
                            ) : null}
                        </div>
                    </div>
                )}

        </nav>
    );
}
