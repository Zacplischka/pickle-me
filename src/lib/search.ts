import { Court } from "@/lib/supabase/database.types";
import { Suggestion, SuburbData } from "@/lib/types/search";

/**
 * Extract unique suburbs with court counts from courts array
 */
export function extractSuburbs(courts: Court[]): SuburbData[] {
  const counts = courts.reduce((acc, court) => {
    const suburb = court.suburb;
    acc[suburb] = (acc[suburb] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts)
    .map(([suburb, count]) => ({ suburb, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculate match score: 0 = starts with (best), 1 = contains
 */
function getMatchScore(text: string, query: string): number | null {
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) return null;

  if (normalizedText.startsWith(normalizedQuery)) return 0;
  if (normalizedText.includes(normalizedQuery)) return 1;
  return null;
}

/**
 * Filter and rank courts and suburbs based on query
 */
export function searchSuggestions(
  courts: Court[],
  suburbs: SuburbData[],
  query: string,
  limit: number = 8
): Suggestion[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    // Return initial suggestions: top suburbs by court count
    const topSuburbs: Suggestion[] = suburbs.slice(0, 4).map((s) => ({
      type: "suburb",
      suburb: s.suburb,
      count: s.count,
      matchScore: 0,
    }));

    // Add top-rated courts if available
    const topCourts: Suggestion[] = courts
      .filter((c) => c.google_rating !== null)
      .sort((a, b) => (b.google_rating || 0) - (a.google_rating || 0))
      .slice(0, 4)
      .map((court) => ({
        type: "court",
        court,
        matchScore: 0,
      }));

    return [...topSuburbs, ...topCourts].slice(0, limit);
  }

  const suggestions: Suggestion[] = [];

  // Match courts by name or suburb
  for (const court of courts) {
    const nameScore = getMatchScore(court.name, normalizedQuery);
    const suburbScore = getMatchScore(court.suburb, normalizedQuery);
    const bestScore = nameScore !== null ? nameScore : suburbScore;

    if (bestScore !== null) {
      suggestions.push({
        type: "court",
        court,
        matchScore: bestScore,
      });
    }
  }

  // Match suburbs
  for (const { suburb, count } of suburbs) {
    const score = getMatchScore(suburb, normalizedQuery);
    if (score !== null) {
      suggestions.push({
        type: "suburb",
        suburb,
        count,
        matchScore: score,
      });
    }
  }

  // Sort by match score, then alphabetically
  return suggestions
    .sort((a, b) => {
      if (a.matchScore !== b.matchScore) return a.matchScore - b.matchScore;
      const aName = a.type === "court" ? a.court.name : a.type === "suburb" ? a.suburb : "";
      const bName = b.type === "court" ? b.court.name : b.type === "suburb" ? b.suburb : "";
      return aName.localeCompare(bName);
    })
    .slice(0, limit);
}
