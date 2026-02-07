import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { ModalProvider } from "@/lib/contexts/ModalContext";
import { GlobalModals } from "@/components/GlobalModals";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mypickle.me"),
  title: {
    default: "mypickle.me | Find Pickleball Courts in VIC",
    template: "%s | mypickle.me",
  },
  description: "The most comprehensive directory of pickleball courts in Victoria, Australia. Find indoor and outdoor courts near you.",
  keywords: ["pickleball", "victoria", "melbourne", "courts", "pickleball courts", "pickleball near me"],
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "/",
    title: "mypickle.me | Find Pickleball Courts in VIC",
    description: "The most comprehensive directory of pickleball courts in Victoria, Australia. Find indoor and outdoor courts near you.",
    siteName: "mypickle.me",
  },
  twitter: {
    card: "summary_large_image",
    title: "mypickle.me | Find Pickleball Courts in VIC",
    description: "The most comprehensive directory of pickleball courts in Victoria, Australia. Find indoor and outdoor courts near you.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          "antialiased min-h-screen flex flex-col bg-background font-sans"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ModalProvider>
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <GlobalModals />
            </ModalProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
