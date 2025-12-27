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
  // Map based on common patterns - most commercial/council venues are indoor
  if (["commercial", "state centre", "council", "club", "private", "school"].includes(lower)) return "Indoor";
  return null;
}

function extractFeatures(lineMarking: string, notes: string): string[] {
  const features: string[] = [];
  const combined = `${lineMarking} ${notes}`.toLowerCase();

  if (combined.includes("dedicated") || combined.includes("perm")) features.push("Permanent Nets");
  if (combined.includes("coaching")) features.push("Coaching");
  if (combined.includes("cafe") || combined.includes("bar") || combined.includes("lounge")) features.push("Cafe/Bar");
  if (combined.includes("24/7")) features.push("24/7 Access");
  if (combined.includes("sauna") || combined.includes("wellness") || combined.includes("ice")) features.push("Wellness");
  if (combined.includes("parking")) features.push("Parking");
  if (combined.includes("free-to-play") || combined.includes("free to play")) features.push("Free-to-play");
  if (combined.includes("outdoor")) features.push("Outdoor Courts");
  if (combined.includes("stadium")) features.push("Stadium");

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
