import Link from "next/link";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="w-full border-t border-border/40 bg-background">
            <div className="container mx-auto px-4 md:px-6 py-6 space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/final.png"
                            alt="MyPickle.me Logo"
                            width={32}
                            height={32}
                            className="object-contain"
                        />
                        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                            Built for the Victorian Pickleball Community.
                            <span className="opacity-60 ml-1">
                                Not affiliated with any official body.
                            </span>
                        </p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <Link href="/search" className="text-sm text-muted-foreground hover:text-foreground">
                            Find Courts
                        </Link>
                        <Link href="/list-court" className="text-sm text-muted-foreground hover:text-foreground">
                            Submit Court
                        </Link>
                    </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 items-center justify-center md:justify-start border-t border-border/40 pt-4">
                    <span className="text-sm font-medium text-muted-foreground">Popular Areas:</span>
                    {[
                        { name: "Melbourne", slug: "melbourne" },
                        { name: "South Melbourne", slug: "south-melbourne" },
                        { name: "Richmond", slug: "richmond" },
                        { name: "Albert Park", slug: "albert-park" },
                        { name: "Footscray", slug: "footscray" },
                        { name: "Brunswick", slug: "brunswick" },
                    ].map((area) => (
                        <Link key={area.slug} href={`/courts/${area.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
                            {area.name}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
}
