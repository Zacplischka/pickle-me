# Google Places Enrichment Pipeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a pipeline that fetches all courts from Supabase, enriches them with Google Places API data, and updates the database with the enriched information.

**Architecture:** A Node.js/TypeScript script that: (1) fetches all courts from Supabase, (2) uses Google Places Text Search API to find matching places by name + suburb, (3) retrieves detailed place information, and (4) updates each court record with enriched data (google_place_id, rating, phone, website, photos, opening hours).

**Tech Stack:** TypeScript, tsx runner, Supabase client, Google Places API (New), dotenv

---

### Task 1: Add Google Places columns to database schema

**Files:**
- Modify: Supabase database via migration

**Step 1: Create migration to add Google Places fields**

Apply the following migration to add columns for storing Google Places data:

```sql
-- Add Google Places enrichment columns
ALTER TABLE courts
ADD COLUMN IF NOT EXISTS google_place_id TEXT,
ADD COLUMN IF NOT EXISTS google_rating NUMERIC(2,1),
ADD COLUMN IF NOT EXISTS google_user_ratings_total INTEGER,
ADD COLUMN IF NOT EXISTS google_phone TEXT,
ADD COLUMN IF NOT EXISTS google_website TEXT,
ADD COLUMN IF NOT EXISTS google_photos JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS google_opening_hours JSONB,
ADD COLUMN IF NOT EXISTS google_formatted_address TEXT,
ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'pending';

-- Add index for enrichment status to speed up queries
CREATE INDEX IF NOT EXISTS idx_courts_enrichment_status ON courts(enrichment_status);

-- Add comment
COMMENT ON COLUMN courts.google_place_id IS 'Google Places API place ID';
COMMENT ON COLUMN courts.enrichment_status IS 'pending, success, not_found, error';
```

**Step 2: Verify migration applied**

Run: Query database to confirm new columns exist

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Google Places enrichment columns to courts table"
```

---

### Task 2: Update TypeScript database types

**Files:**
- Modify: `src/lib/supabase/database.types.ts`

**Step 1: Add new fields to Court type**

Add these fields to the `courts` table Row, Insert, and Update types:

```typescript
// Add to Row type:
google_place_id: string | null
google_rating: number | null
google_user_ratings_total: number | null
google_phone: string | null
google_website: string | null
google_photos: Json[] | null
google_opening_hours: Json | null
google_formatted_address: string | null
enriched_at: string | null
enrichment_status: string | null

// Add to Insert type (all optional):
google_place_id?: string | null
google_rating?: number | null
google_user_ratings_total?: number | null
google_phone?: string | null
google_website?: string | null
google_photos?: Json[] | null
google_opening_hours?: Json | null
google_formatted_address?: string | null
enriched_at?: string | null
enrichment_status?: string | null

// Add to Update type (all optional):
google_place_id?: string | null
google_rating?: number | null
google_user_ratings_total?: number | null
google_phone?: string | null
google_website?: string | null
google_photos?: Json[] | null
google_opening_hours?: Json | null
google_formatted_address?: string | null
enriched_at?: string | null
enrichment_status?: string | null
```

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/supabase/database.types.ts
git commit -m "feat: add Google Places types to database types"
```

---

### Task 3: Create Google Places API client module

**Files:**
- Create: `scripts/lib/google-places.ts`

**Step 1: Write the Google Places API client**

```typescript
import "dotenv/config";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_API_BASE = "https://places.googleapis.com/v1";

if (!GOOGLE_PLACES_API_KEY) {
  throw new Error("GOOGLE_PLACES_API_KEY is not set in environment variables");
}

export interface PlaceSearchResult {
  id: string;
  displayName?: { text: string; languageCode: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
}

export interface PlaceDetails {
  id: string;
  displayName?: { text: string; languageCode: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: {
    openNow?: boolean;
    periods?: Array<{
      open: { day: number; hour: number; minute: number };
      close: { day: number; hour: number; minute: number };
    }>;
    weekdayDescriptions?: string[];
  };
  photos?: Array<{
    name: string;
    widthPx: number;
    heightPx: number;
    authorAttributions?: Array<{
      displayName: string;
      uri: string;
      photoUri: string;
    }>;
  }>;
}

export async function searchPlaces(
  query: string,
  locationBias?: { lat: number; lng: number }
): Promise<PlaceSearchResult[]> {
  const fieldMask = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
  ].join(",");

  const body: Record<string, unknown> = {
    textQuery: query,
    languageCode: "en",
    regionCode: "AU",
  };

  // Add location bias if coordinates provided (500m radius)
  if (locationBias) {
    body.locationBias = {
      circle: {
        center: {
          latitude: locationBias.lat,
          longitude: locationBias.lng,
        },
        radius: 500.0,
      },
    };
  }

  const response = await fetch(`${PLACES_API_BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Places API search failed: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.places || [];
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  const fieldMask = [
    "id",
    "displayName",
    "formattedAddress",
    "location",
    "rating",
    "userRatingCount",
    "nationalPhoneNumber",
    "internationalPhoneNumber",
    "websiteUri",
    "regularOpeningHours",
    "photos",
  ].join(",");

  const response = await fetch(`${PLACES_API_BASE}/places/${placeId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": fieldMask,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const error = await response.text();
    throw new Error(`Places API details failed: ${response.status} - ${error}`);
  }

  return response.json();
}

// Rate limiting helper - Google allows 600 QPM for most APIs
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

**Step 2: Verify file syntax**

Run: `npx tsc --noEmit scripts/lib/google-places.ts`
Expected: No errors (or create tsconfig if needed)

**Step 3: Commit**

```bash
git add scripts/lib/google-places.ts
git commit -m "feat: add Google Places API client module"
```

---

### Task 4: Create the enrichment pipeline script

**Files:**
- Create: `scripts/enrich-courts.ts`

**Step 1: Write the enrichment pipeline**

```typescript
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { searchPlaces, getPlaceDetails, delay } from "./lib/google-places";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase environment variables not set");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Court {
  id: string;
  name: string;
  suburb: string;
  lat: number | null;
  lng: number | null;
  enrichment_status: string | null;
}

async function fetchCourtsToEnrich(): Promise<Court[]> {
  const { data, error } = await supabase
    .from("courts")
    .select("id, name, suburb, lat, lng, enrichment_status")
    .or("enrichment_status.is.null,enrichment_status.eq.pending,enrichment_status.eq.error")
    .order("name");

  if (error) {
    throw new Error(`Failed to fetch courts: ${error.message}`);
  }

  return data || [];
}

async function enrichCourt(court: Court): Promise<void> {
  console.log(`\nProcessing: ${court.name} (${court.suburb})`);

  try {
    // Build search query: venue name + suburb + state
    const searchQuery = `${court.name} ${court.suburb} Victoria Australia`;

    // Search with location bias if we have coordinates
    const locationBias = court.lat && court.lng
      ? { lat: court.lat, lng: court.lng }
      : undefined;

    const searchResults = await searchPlaces(searchQuery, locationBias);

    if (searchResults.length === 0) {
      console.log(`  No results found for: ${searchQuery}`);
      await updateCourtStatus(court.id, "not_found");
      return;
    }

    // Take the first (most relevant) result
    const bestMatch = searchResults[0];
    console.log(`  Found: ${bestMatch.displayName?.text} at ${bestMatch.formattedAddress}`);

    // Add delay to respect rate limits (100ms between requests)
    await delay(100);

    // Get detailed place information
    const details = await getPlaceDetails(bestMatch.id);

    if (!details) {
      console.log(`  Could not fetch details for place ID: ${bestMatch.id}`);
      await updateCourtStatus(court.id, "error");
      return;
    }

    // Prepare photos array (store first 5 photo references)
    const photos = (details.photos || []).slice(0, 5).map((photo) => ({
      name: photo.name,
      widthPx: photo.widthPx,
      heightPx: photo.heightPx,
      authorAttributions: photo.authorAttributions,
    }));

    // Update court with enriched data
    const { error: updateError } = await supabase
      .from("courts")
      .update({
        google_place_id: details.id,
        google_rating: details.rating || null,
        google_user_ratings_total: details.userRatingCount || null,
        google_phone: details.nationalPhoneNumber || details.internationalPhoneNumber || null,
        google_website: details.websiteUri || null,
        google_photos: photos.length > 0 ? photos : null,
        google_opening_hours: details.regularOpeningHours || null,
        google_formatted_address: details.formattedAddress || null,
        // Also update lat/lng if we didn't have them and Google provides them
        lat: court.lat || details.location?.latitude || null,
        lng: court.lng || details.location?.longitude || null,
        enriched_at: new Date().toISOString(),
        enrichment_status: "success",
      })
      .eq("id", court.id);

    if (updateError) {
      throw new Error(`Failed to update court: ${updateError.message}`);
    }

    console.log(`  Successfully enriched with rating: ${details.rating || "N/A"}`);
  } catch (error) {
    console.error(`  Error enriching ${court.name}:`, error);
    await updateCourtStatus(court.id, "error");
  }
}

async function updateCourtStatus(courtId: string, status: string): Promise<void> {
  await supabase
    .from("courts")
    .update({
      enrichment_status: status,
      enriched_at: new Date().toISOString(),
    })
    .eq("id", courtId);
}

async function main() {
  console.log("=== Google Places Enrichment Pipeline ===\n");

  // Fetch courts that need enrichment
  const courts = await fetchCourtsToEnrich();
  console.log(`Found ${courts.length} courts to enrich\n`);

  if (courts.length === 0) {
    console.log("No courts need enrichment. Done!");
    return;
  }

  // Process each court with rate limiting
  let successCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;

  for (const court of courts) {
    await enrichCourt(court);

    // Add delay between courts to respect rate limits
    await delay(200);

    // Update counts (re-fetch status)
    const { data } = await supabase
      .from("courts")
      .select("enrichment_status")
      .eq("id", court.id)
      .single();

    if (data?.enrichment_status === "success") successCount++;
    else if (data?.enrichment_status === "not_found") notFoundCount++;
    else errorCount++;
  }

  console.log("\n=== Enrichment Complete ===");
  console.log(`Success: ${successCount}`);
  console.log(`Not Found: ${notFoundCount}`);
  console.log(`Errors: ${errorCount}`);
}

main().catch(console.error);
```

**Step 2: Verify script syntax**

Run: `npx tsc --noEmit scripts/enrich-courts.ts`
Expected: No errors

**Step 3: Commit**

```bash
git add scripts/enrich-courts.ts
git commit -m "feat: add Google Places enrichment pipeline script"
```

---

### Task 5: Add npm script for running enrichment

**Files:**
- Modify: `package.json`

**Step 1: Add the enrich script**

Add to the "scripts" section in package.json:

```json
"enrich": "npx tsx scripts/enrich-courts.ts"
```

**Step 2: Verify script runs**

Run: `npm run enrich -- --help` (or just verify the script is recognized)
Expected: Script should be found

**Step 3: Commit**

```bash
git add package.json
git commit -m "feat: add npm script for court enrichment"
```

---

### Task 6: Run the enrichment pipeline (test with limited batch)

**Files:**
- None (execution only)

**Step 1: Verify environment variables are set**

Check that `.env` or `.env.local` contains:
- `GOOGLE_PLACES_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Step 2: Run enrichment on first 5 courts (manual test)**

Modify the script temporarily to limit to 5 courts, or run and cancel after a few:

Run: `npm run enrich`
Expected: Script processes courts and shows success/not_found status

**Step 3: Verify data in database**

Query Supabase to confirm enrichment data was stored:
```sql
SELECT name, google_place_id, google_rating, enrichment_status
FROM courts
WHERE enrichment_status = 'success'
LIMIT 5;
```

**Step 4: Commit (if any script tweaks needed)**

```bash
git add -A
git commit -m "fix: adjust enrichment pipeline based on test results"
```

---

### Task 7: Create re-enrichment utility for failed courts

**Files:**
- Modify: `scripts/enrich-courts.ts`

**Step 1: Add command-line argument support**

Add argument parsing to allow:
- `--all` - Re-enrich all courts (reset status first)
- `--retry` - Only retry courts with status "error" or "not_found"
- `--limit N` - Process only N courts

```typescript
// Add at the top of the file after imports
const args = process.argv.slice(2);
const flags = {
  all: args.includes("--all"),
  retry: args.includes("--retry"),
  limit: parseInt(args.find(a => a.startsWith("--limit="))?.split("=")[1] || "0", 10),
};

// Modify fetchCourtsToEnrich function
async function fetchCourtsToEnrich(): Promise<Court[]> {
  let query = supabase
    .from("courts")
    .select("id, name, suburb, lat, lng, enrichment_status");

  if (flags.all) {
    // Reset all and re-enrich
    console.log("Mode: Re-enriching ALL courts");
  } else if (flags.retry) {
    // Only retry failures
    console.log("Mode: Retrying failed enrichments");
    query = query.or("enrichment_status.eq.error,enrichment_status.eq.not_found");
  } else {
    // Default: only pending/null
    console.log("Mode: Processing pending courts only");
    query = query.or("enrichment_status.is.null,enrichment_status.eq.pending");
  }

  query = query.order("name");

  if (flags.limit > 0) {
    console.log(`Limiting to ${flags.limit} courts`);
    query = query.limit(flags.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch courts: ${error.message}`);
  }

  return data || [];
}
```

**Step 2: Test with --limit flag**

Run: `npm run enrich -- --limit=3`
Expected: Only 3 courts processed

**Step 3: Commit**

```bash
git add scripts/enrich-courts.ts
git commit -m "feat: add CLI flags for enrichment modes (--all, --retry, --limit)"
```

---

### Task 8: Run full enrichment pipeline

**Files:**
- None (execution only)

**Step 1: Run full enrichment**

Run: `npm run enrich`
Expected: All 85 courts processed with status output

**Step 2: Check results in database**

Query to see enrichment stats:
```sql
SELECT
  enrichment_status,
  COUNT(*) as count
FROM courts
GROUP BY enrichment_status;
```

**Step 3: Commit any final adjustments**

```bash
git add -A
git commit -m "feat: complete Google Places enrichment pipeline"
```

---

## Summary

This implementation creates a complete enrichment pipeline that:

1. **Adds database columns** for storing Google Places data (place_id, rating, phone, website, photos, hours)
2. **Creates a reusable API client** for Google Places Text Search and Place Details
3. **Implements the enrichment script** with rate limiting and error handling
4. **Supports multiple run modes** (pending only, retry failures, re-enrich all)
5. **Tracks enrichment status** per court for monitoring and debugging

**Key API endpoints used:**
- `POST /v1/places:searchText` - Find places by name/address
- `GET /v1/places/{placeId}` - Get detailed place information

**Environment variables required:**
- `GOOGLE_PLACES_API_KEY` - From Google Cloud Console
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (bypasses RLS)
