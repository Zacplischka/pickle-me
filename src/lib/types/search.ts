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

export type Suggestion = CourtSuggestion | SuburbSuggestion;

export interface SuburbData {
  suburb: string;
  count: number;
}
