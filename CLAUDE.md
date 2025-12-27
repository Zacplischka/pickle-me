# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pickle-me is a pickleball court finder for Victoria, Australia. It displays court locations on an interactive map with details like ratings, opening hours, and contact information.

## Commands

```bash
npm run dev       # Start development server (http://localhost:3000)
npm run build     # Production build
npm run lint      # Run ESLint
npm run seed      # Seed courts data to Supabase
npm run enrich    # Enrich courts with Google Places data
npm run enrich -- --limit=N   # Enrich only N courts
npm run enrich -- --retry     # Retry failed enrichments
npm run enrich -- --all       # Re-enrich all courts
```

## Architecture

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Supabase, Leaflet

### Code Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── layout/            # Navbar, Footer
│   ├── map/               # Map, MapWrapper (client-side Leaflet)
│   ├── home/              # Hero section
│   └── ui/                # Button and other primitives
└── lib/
    ├── supabase/
    │   ├── client.ts      # Browser Supabase client
    │   ├── server.ts      # Server Supabase client (uses cookies)
    │   ├── queries.ts     # Data fetching functions
    │   └── database.types.ts  # TypeScript types for DB schema
    └── utils.ts           # Utility functions (cn for classnames)

scripts/
├── seed-courts.ts         # Seeds court data to Supabase
├── enrich-courts.ts       # Enriches courts with Google Places API
└── lib/google-places.ts   # Google Places API client
```

### Data Flow

1. Court data is seeded via `npm run seed`
2. Courts are enriched with Google Places data (ratings, photos, hours) via `npm run enrich`
3. Server components fetch data using `src/lib/supabase/queries.ts`
4. Map component renders courts using Leaflet (client-side only via MapWrapper)

### Supabase Integration

- **Server components**: Use `createClient()` from `lib/supabase/server.ts`
- **Client components**: Use `createClient()` from `lib/supabase/client.ts`
- **Database types**: Defined in `database.types.ts`, exports `Court`, `CourtInsert`, `CourtUpdate`

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # For scripts only
GOOGLE_PLACES_API_KEY=          # For enrichment script
```

## Key Patterns

- Map components use dynamic imports with `ssr: false` due to Leaflet's browser dependency
- Server-side data fetching in page components, passed as props to client components
- Court enrichment tracks status (`pending`, `success`, `not_found`, `error`) for idempotent reruns
