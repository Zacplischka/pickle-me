# CLAUDE.md

## Core Development Loop

**Every code change follows this cycle:**

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  RESEARCH   │ ──▶ │  IMPLEMENT  │ ──▶ │   VERIFY    │
│             │     │             │     │             │
│ • Read docs │     │ • Write code│     │ • Open in   │
│ • Explore   │     │ • Run build │     │   browser   │
│   codebase  │     │ • Fix errors│     │ • Test UI   │
│ • Understand│     │             │     │ • Confirm   │
│   context   │     │             │     │   behavior  │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                                       │
       └───────────────────────────────────────┘
                    Loop until correct
```

### 1. Research
- Use context7 to get latest library documentation before coding
- Read existing code to understand patterns
- Explore the codebase structure before modifying

### 2. Implement
- Write the code changes
- Run `npm run build` to catch type errors
- Fix any issues before proceeding

### 3. Verify with Claude in Chrome
- Open `http://localhost:3000` in the browser
- Use Claude in Chrome tools to interact with the UI
- Visually confirm the implementation works as expected
- Test user flows and edge cases

**Do not consider a task complete until verified in the browser.**

---

## Project Overview

Pickleball court finder for Victoria, Australia. Displays courts on an interactive map with ratings, hours, and contact info.

## Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run lint      # Run ESLint
npm run seed      # Seed courts to Supabase
npm run enrich    # Enrich with Google Places data
```

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Supabase, Leaflet

## Structure

```
src/
├── app/
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes (admin, places)
│   ├── auth/              # Auth callback
│   ├── court/[id]/        # Court detail page
│   ├── events/            # Events page
│   ├── guides/            # Guides page
│   ├── list-court/        # Court submission form
│   ├── profile/           # User profile pages
│   ├── search/            # Court search with map
│   └── settings/          # User settings
├── components/
│   ├── admin/             # Admin components (login, lists)
│   ├── auth/              # AuthModal, UserMenu
│   ├── court/             # Court detail components
│   ├── home/              # Hero, HeatMapPreview, NearbyDrawer
│   ├── layout/            # Navbar, Footer
│   ├── map/               # Map, MapWrapper (client-side)
│   ├── profile/           # Profile tabs, favorites, reviews
│   ├── search/            # Search input, filters, court list
│   ├── settings/          # Settings forms
│   └── ui/                # Button, Spinner, ThemeToggle
└── lib/
    ├── contexts/          # AuthContext, CourtsContext
    ├── supabase/          # DB clients, queries, auth, favorites
    ├── types/             # TypeScript types
    └── utils.ts           # Utilities

scripts/                   # Seed and enrichment scripts
```

## Key Patterns

- Map uses dynamic imports with `ssr: false` (Leaflet requires browser)
- Server components fetch data, pass to client components as props
- Court enrichment is idempotent via status tracking

## Data Layer

### Supabase

All data is hosted in Supabase (PostgreSQL). Two main tables:

- **`courts`** - Verified court locations with enriched data
- **`court_submissions`** - User-submitted courts pending admin review

**Clients:**
- Server components: `lib/supabase/server.ts` (uses cookies)
- Client components: `lib/supabase/client.ts` (browser client)
- Scripts: Use `SUPABASE_SERVICE_ROLE_KEY` for admin access

### Google Places API

Used to enrich court data with real-world info:
- Ratings and review counts
- Opening hours
- Photos
- Contact details

Run `npm run enrich` to fetch Google Places data for courts with `enrichment_status: pending`.

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # Admin access for scripts
GOOGLE_PLACES_API_KEY=          # Places API enrichment
ADMIN_PASSWORD=                 # /admin page access
```
