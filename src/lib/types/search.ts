import { Court } from "@/lib/supabase/database.types";

export type CourtSuggestion = {
  type: "court";
  court: Court;
  matchScore: number;
};

export type SuburbSuggestion = {
  type: "suburb";
  suburb: string;
  count: number;
  matchScore: number;
};

export type PlaceSuggestion = {
  type: "place";
  placeId: string;
  mainText: string;
  secondaryText: string;
  matchScore: number;
};

export type Suggestion = CourtSuggestion | SuburbSuggestion | PlaceSuggestion;

export interface SuburbData {
  suburb: string;
  count: number;
}
