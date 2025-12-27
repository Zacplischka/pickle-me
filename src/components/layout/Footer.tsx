import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full py-6 md:py-0 border-t border-border/40 bg-background">
            <div className="container mx-auto px-4 md:px-6 flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                    Built for the Victorian Pickleball Community.
                    <span className="opacity-60 ml-1">
                        Not affiliated with any official body.
                    </span>
                </p>
                <div className="flex gap-4 items-center">
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                        About
                    </Link>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                        Terms
                    </Link>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                        Privacy
                    </Link>
                </div>
            </div>
        </footer>
    );
}
