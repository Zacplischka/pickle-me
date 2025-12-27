import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { searchPlaces, getPlaceDetails, delay } from "./lib/google-places";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase environment variables not set");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Parse CLI arguments
const args = process.argv.slice(2);
const flags = {
  all: args.includes("--all"),
  retry: args.includes("--retry"),
  limit: parseInt(args.find(a => a.startsWith("--limit="))?.split("=")[1] || "0", 10),
};

interface Court {
  id: string;
  name: string;
  suburb: string;
  lat: number | null;
  lng: number | null;
  enrichment_status: string | null;
}

async function fetchCourtsToEnrich(): Promise<Court[]> {
  let query = supabase
    .from("courts")
    .select("id, name, suburb, lat, lng, enrichment_status");

  if (flags.all) {
    // Re-enrich ALL courts
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
