// Re-export Court type from database types for backwards compatibility
export type { Court } from "./supabase/database.types";

// Re-export query functions for convenience
export { getCourts, getFeaturedCourts, getCourtById, getCourtsByRegion, searchCourts, getSimilarCourts, getCourtSummaries, getCourtsBySuburb, getDistinctSuburbs } from "./supabase/queries";
