# Supabase Database Setup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up a Supabase database to store pickleball court data, replacing the hardcoded data with a proper backend.

**Architecture:** Create a `courts` table in Supabase, install the Supabase client libraries for Next.js with SSR support, create utility functions for both client and server components, enable Row Level Security with appropriate policies, and seed the database with the existing CSV data.

**Tech Stack:** Supabase (Postgres), @supabase/supabase-js, @supabase/ssr, Next.js 16 App Router

---

## Task 1: Create Supabase Project

**Files:**
- Create: `.env.local`

**Step 1: Create a new Supabase project (manual)**

User needs to create a new Supabase project via the dashboard or we'll use an existing one. Based on your account, you have several projects - we need to either create a new one or use an existing active one.

**Step 2: Get API credentials**

Once project is created/selected, retrieve:
- Project URL
- Anon key
- Service role key (for admin operations)

**Step 3: Create environment file**

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Step 4: Add .env.local to .gitignore (if not already)**

Run: `grep -q ".env.local" .gitignore || echo ".env.local" >> .gitignore`

---

## Task 2: Install Supabase Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install supabase client packages**

Run: `npm install @supabase/supabase-js @supabase/ssr`
Expected: Packages added to dependencies

**Step 2: Verify installation**

Run: `npm ls @supabase/supabase-js @supabase/ssr`
Expected: Both packages listed without errors

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install Supabase client libraries"
```

---

## Task 3: Create Supabase Client Utilities

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`

**Step 1: Create browser client utility**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Step 2: Create server client utility**

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
```

**Step 3: Create middleware utility**

```typescript
// src/lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}
```

**Step 4: Commit**

```bash
git add src/lib/supabase/
git commit -m "feat: add Supabase client utilities for browser and server"
```

---

## Task 4: Create Next.js Middleware

**Files:**
- Create: `middleware.ts` (at project root)

**Step 1: Create middleware file**

```typescript
// middleware.ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Step 2: Verify middleware location**

Run: `ls -la middleware.ts`
Expected: File exists at project root

**Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: add Next.js middleware for Supabase auth session"
```

---

## Task 5: Create Database Schema (Courts Table)

**Files:**
- Migration via Supabase MCP tool

**Step 1: Create courts table with RLS enabled**

Apply this migration using the Supabase MCP `apply_migration` tool:

```sql
-- Create courts table
CREATE TABLE public.courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  suburb TEXT NOT NULL,
  address TEXT,
  region TEXT,
  type TEXT CHECK (type IN ('Indoor', 'Outdoor', 'Hybrid')),
  surface TEXT,
  courts_count TEXT,
  line_marking TEXT,
  notes TEXT,
  venue_type TEXT,
  image_url TEXT,
  features TEXT[] DEFAULT '{}',
  price TEXT,
  website TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can view courts)
CREATE POLICY "Courts are viewable by everyone"
  ON public.courts
  FOR SELECT
  USING (true);

-- Create index for common queries
CREATE INDEX courts_region_idx ON public.courts(region);
CREATE INDEX courts_type_idx ON public.courts(type);
CREATE INDEX courts_suburb_idx ON public.courts(suburb);

-- Add comment for documentation
COMMENT ON TABLE public.courts IS 'Pickleball courts directory for Victoria, Australia';
```

**Step 2: Verify table was created**

Run SQL query: `SELECT * FROM public.courts LIMIT 1;`
Expected: Empty result set (table exists but no data)

---

## Task 6: Seed Database with CSV Data

**Files:**
- Create: `scripts/seed-courts.ts`
- Modify: `package.json` (add seed script)

**Step 1: Create seed script**

```typescript
// scripts/seed-courts.ts
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CSVCourt {
  Region: string;
  "Venue Name": string;
  "Suburb / Location": string;
  Type: string;
  Courts: string;
  Surface: string;
  "Line Marking / Metadata": string;
  Notes: string;
}

function parseCSV(csvContent: string): CSVCourt[] {
  const lines = csvContent.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || "";
    });
    return obj as CSVCourt;
  });
}

function mapVenueType(type: string): "Indoor" | "Outdoor" | "Hybrid" | null {
  const lower = type.toLowerCase();
  if (lower.includes("indoor") && lower.includes("outdoor")) return "Hybrid";
  if (lower.includes("indoor")) return "Indoor";
  if (lower.includes("outdoor")) return "Outdoor";
  // Map based on common patterns
  if (["commercial", "state centre", "council", "club"].includes(lower)) return "Indoor";
  return null;
}

function extractFeatures(lineMarking: string, notes: string): string[] {
  const features: string[] = [];
  const combined = `${lineMarking} ${notes}`.toLowerCase();

  if (combined.includes("dedicated") || combined.includes("perm")) features.push("Permanent Nets");
  if (combined.includes("coaching")) features.push("Coaching");
  if (combined.includes("cafe") || combined.includes("bar")) features.push("Cafe/Bar");
  if (combined.includes("24/7")) features.push("24/7 Access");
  if (combined.includes("sauna") || combined.includes("wellness")) features.push("Wellness");
  if (combined.includes("parking")) features.push("Parking");
  if (combined.includes("free")) features.push("Free-to-play");

  return features;
}

async function seed() {
  console.log("Reading CSV file...");
  const csvPath = path.join(process.cwd(), "victoria_pickleball_courts_updated.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");

  console.log("Parsing CSV...");
  const courts = parseCSV(csvContent);

  console.log(`Found ${courts.length} courts to import`);

  const courtsToInsert = courts.map((court) => ({
    name: court["Venue Name"],
    suburb: court["Suburb / Location"],
    region: court.Region,
    venue_type: court.Type,
    type: mapVenueType(court.Type),
    surface: court.Surface,
    courts_count: court.Courts,
    line_marking: court["Line Marking / Metadata"],
    notes: court.Notes || null,
    features: extractFeatures(court["Line Marking / Metadata"], court.Notes),
    // Default placeholder image
    image_url: "https://images.unsplash.com/photo-1626245353528-77402061e858?q=80&w=2664&auto=format&fit=crop",
  }));

  console.log("Inserting courts into database...");
  const { data, error } = await supabase
    .from("courts")
    .insert(courtsToInsert)
    .select();

  if (error) {
    console.error("Error inserting courts:", error);
    process.exit(1);
  }

  console.log(`Successfully inserted ${data.length} courts!`);
}

seed();
```

**Step 2: Add seed script to package.json**

Add to scripts section:
```json
"seed": "npx tsx scripts/seed-courts.ts"
```

**Step 3: Run seed script (requires SUPABASE_SERVICE_ROLE_KEY in .env.local)**

Run: `npm run seed`
Expected: "Successfully inserted 86 courts!"

**Step 4: Commit**

```bash
git add scripts/seed-courts.ts package.json
git commit -m "feat: add database seeding script for courts data"
```

---

## Task 7: Generate TypeScript Types

**Files:**
- Create: `src/lib/supabase/database.types.ts`

**Step 1: Generate types using Supabase MCP**

Use the `generate_typescript_types` MCP tool to get types, then save to file.

**Step 2: Create types file**

```typescript
// src/lib/supabase/database.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      courts: {
        Row: {
          id: string;
          name: string;
          suburb: string;
          address: string | null;
          region: string | null;
          type: "Indoor" | "Outdoor" | "Hybrid" | null;
          surface: string | null;
          courts_count: string | null;
          line_marking: string | null;
          notes: string | null;
          venue_type: string | null;
          image_url: string | null;
          features: string[] | null;
          price: string | null;
          website: string | null;
          lat: number | null;
          lng: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          suburb: string;
          address?: string | null;
          region?: string | null;
          type?: "Indoor" | "Outdoor" | "Hybrid" | null;
          surface?: string | null;
          courts_count?: string | null;
          line_marking?: string | null;
          notes?: string | null;
          venue_type?: string | null;
          image_url?: string | null;
          features?: string[] | null;
          price?: string | null;
          website?: string | null;
          lat?: number | null;
          lng?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          suburb?: string;
          address?: string | null;
          region?: string | null;
          type?: "Indoor" | "Outdoor" | "Hybrid" | null;
          surface?: string | null;
          courts_count?: string | null;
          line_marking?: string | null;
          notes?: string | null;
          venue_type?: string | null;
          image_url?: string | null;
          features?: string[] | null;
          price?: string | null;
          website?: string | null;
          lat?: number | null;
          lng?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

export type Court = Database["public"]["Tables"]["courts"]["Row"];
```

**Step 3: Commit**

```bash
git add src/lib/supabase/database.types.ts
git commit -m "feat: add Supabase database TypeScript types"
```

---

## Task 8: Create Data Fetching Functions

**Files:**
- Create: `src/lib/supabase/queries.ts`

**Step 1: Create queries file with court fetching functions**

```typescript
// src/lib/supabase/queries.ts
import { createClient } from "./server";
import type { Court } from "./database.types";

export async function getCourts(): Promise<Court[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching courts:", error);
    return [];
  }

  return data || [];
}

export async function getFeaturedCourts(limit = 3): Promise<Court[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .not("image_url", "is", null)
    .limit(limit);

  if (error) {
    console.error("Error fetching featured courts:", error);
    return [];
  }

  return data || [];
}

export async function getCourtById(id: string): Promise<Court | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching court:", error);
    return null;
  }

  return data;
}

export async function getCourtsByRegion(region: string): Promise<Court[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .eq("region", region)
    .order("name");

  if (error) {
    console.error("Error fetching courts by region:", error);
    return [];
  }

  return data || [];
}
```

**Step 2: Commit**

```bash
git add src/lib/supabase/queries.ts
git commit -m "feat: add court data fetching functions"
```

---

## Task 9: Update Data Types to Match Database

**Files:**
- Modify: `src/lib/data.ts`

**Step 1: Update Court type to be compatible with database**

```typescript
// src/lib/data.ts
import type { Court as DBCourt } from "./supabase/database.types";

// Re-export database Court type
export type Court = DBCourt;

// Legacy type for backwards compatibility during migration
export type LegacyCourt = {
  id: string;
  name: string;
  suburb: string;
  address: string;
  type: "Indoor" | "Outdoor" | "Hybrid";
  surface: "Hard Court" | "Carpet" | "Wood" | "Concrete";
  courts: number;
  imageUrl: string;
  features: string[];
  price?: string;
  website?: string;
  lat: number;
  lng: number;
};

// Keep legacy data for fallback (will be removed after migration)
export const legacyCourts: LegacyCourt[] = [
  // ... existing hardcoded courts
];
```

**Step 2: Commit**

```bash
git add src/lib/data.ts
git commit -m "refactor: update Court type to use database schema"
```

---

## Task 10: Update Home Page to Use Database

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Update home page to fetch from Supabase**

```typescript
// src/app/page.tsx
import { Hero } from "@/components/home/Hero";
import { CourtCard } from "@/components/CourtCard";
import { getFeaturedCourts, getCourts } from "@/lib/supabase/queries";
import { ArrowRight, Map } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function Home() {
  const [featuredCourts, allCourts] = await Promise.all([
    getFeaturedCourts(3),
    getCourts(),
  ]);

  const recentCourts = allCourts.slice(0, 4);

  return (
    // ... rest of component using fetched data
  );
}
```

**Step 2: Run dev server and verify**

Run: `npm run dev`
Expected: Page loads with courts from database

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: update home page to fetch courts from Supabase"
```

---

## Task 11: Update CourtCard Component

**Files:**
- Modify: `src/components/CourtCard.tsx`

**Step 1: Update CourtCard to use database Court type**

Update the component to handle the new database field names:
- `image_url` instead of `imageUrl`
- `courts_count` instead of `courts`
- Handle nullable fields appropriately

**Step 2: Verify component renders correctly**

Run: `npm run dev`
Expected: Court cards display with correct data

**Step 3: Commit**

```bash
git add src/components/CourtCard.tsx
git commit -m "refactor: update CourtCard to use database Court type"
```

---

## Task 12: Update Search Page

**Files:**
- Modify: `src/app/search/page.tsx`

**Step 1: Update search page to fetch from database**

```typescript
// src/app/search/page.tsx
import { getCourts } from "@/lib/supabase/queries";
// ... rest of imports

export default async function SearchPage() {
  const courts = await getCourts();

  // ... rest of component
}
```

**Step 2: Verify search page works**

Run: `npm run dev`
Navigate to: `/search`
Expected: All courts from database displayed

**Step 3: Commit**

```bash
git add src/app/search/page.tsx
git commit -m "feat: update search page to fetch courts from Supabase"
```

---

## Task 13: Update Map Components

**Files:**
- Modify: `src/components/map/MapWrapper.tsx`
- Modify: `src/components/map/Map.tsx`

**Step 1: Update map components to use database Court type**

Ensure the map components handle the new data structure, particularly:
- `lat` and `lng` fields (which may be null)
- Filter out courts without coordinates

**Step 2: Verify map displays correctly**

Run: `npm run dev`
Expected: Map shows markers for courts with coordinates

**Step 3: Commit**

```bash
git add src/components/map/
git commit -m "refactor: update map components to use database Court type"
```

---

## Task 14: Run Build and Fix Any Issues

**Files:**
- Various (as needed for fixes)

**Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Fix any type errors or build issues**

Address any compilation errors that arise.

**Step 4: Commit fixes**

```bash
git add .
git commit -m "fix: resolve build errors after Supabase migration"
```

---

## Task 15: Clean Up Legacy Code

**Files:**
- Modify: `src/lib/data.ts`

**Step 1: Remove legacy hardcoded courts data**

Once everything is working, remove the legacy courts array from `src/lib/data.ts`.

**Step 2: Final verification**

Run: `npm run build && npm run dev`
Expected: App works entirely from database

**Step 3: Commit**

```bash
git add src/lib/data.ts
git commit -m "chore: remove legacy hardcoded courts data"
```

---

## Summary

After completing all tasks, the pickle-me app will:
1. Have a Supabase database with a `courts` table containing 86+ Victoria pickleball courts
2. Use proper Next.js 16 App Router patterns with server-side Supabase client
3. Have Row Level Security enabled with public read access
4. Use TypeScript types generated from the database schema
5. Fetch all court data from the database instead of hardcoded files
