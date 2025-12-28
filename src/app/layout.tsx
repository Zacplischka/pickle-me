import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CourtsProvider } from "@/lib/contexts/CourtsContext";
import { getCourts } from "@/lib/data";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pickle Me Victoria | Find Pickleball Courts in VIC",
  description: "The most comprehensive directory of pickleball courts in Victoria, Australia. Find indoor and outdoor courts near you.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const courts = await getCourts();

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
          <CourtsProvider courts={courts}>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </CourtsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
