"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
    variant?: "default" | "mobile";
}

const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Defer state update to avoid cascading renders warning
        requestAnimationFrame(() => setMounted(true));
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);

    if (!mounted) {
        return (
            <div className={cn(
                "animate-pulse",
                variant === "mobile"
                    ? "h-10 bg-muted/50 rounded-md"
                    : "w-9 h-9 bg-muted/50 rounded-full"
            )} />
        );
    }

    const CurrentIcon = resolvedTheme === "dark" ? Moon : Sun;
    const currentThemeConfig = themes.find((t) => t.value === theme) || themes[2];

    if (variant === "mobile") {
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full py-2 text-sm font-medium text-foreground/80"
                    aria-label="Toggle theme"
                    aria-expanded={isOpen}
                >
                    <span className="flex items-center gap-2">
                        <currentThemeConfig.icon className="w-4 h-4" />
                        Theme: {currentThemeConfig.label}
                    </span>
                    <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-muted-foreground"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </motion.span>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="mt-1 py-1 bg-card border border-border rounded-md shadow-lg"
                            role="menu"
                        >
                            {themes.map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => {
                                        setTheme(value);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "flex items-center justify-between w-full px-3 py-2 text-sm transition-colors",
                                        theme === value
                                            ? "text-foreground bg-muted/50"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                                    )}
                                    role="menuitem"
                                >
                                    <span className="flex items-center gap-2">
                                        <Icon className="w-4 h-4" />
                                        {label}
                                    </span>
                                    {theme === value && <Check className="w-4 h-4 text-secondary" />}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle theme"
                aria-expanded={isOpen}
            >
                <CurrentIcon className="w-4 h-4" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 py-1 w-36 bg-card border border-border rounded-lg shadow-lg z-50"
                        role="menu"
                    >
                        {themes.map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => {
                                    setTheme(value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "flex items-center justify-between w-full px-3 py-2 text-sm transition-colors",
                                    theme === value
                                        ? "text-foreground bg-muted/50"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                                )}
                                role="menuitem"
                            >
                                <span className="flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </span>
                                {theme === value && <Check className="w-4 h-4 text-secondary" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
