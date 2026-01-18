# MyPickle.me

**Victoria's most comprehensive pickleball court directory**

Live site: [https://mypickle.me](https://mypickle.me)

---

## About

MyPickle.me helps players discover indoor and outdoor pickleball courts across Victoria, Australia. Whether you're a beginner looking for your first game or a seasoned player searching for new venues, MyPickle.me makes it easy to find courts near you with detailed information including ratings, opening hours, court surfaces, accessibility features, and booking options.

Built by the community for the community, the platform connects Victorian pickleball enthusiasts with 50+ venues—from dedicated pickleball centres to tennis clubs and recreation facilities.

## Features

- Interactive map with court locations and clustering
- Search courts by suburb or postcode
- Court details: ratings, reviews, opening hours, photos
- Filter by indoor/outdoor, surface type, accessibility
- Mobile-friendly responsive design
- Community court submissions

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Maps:** Leaflet with react-leaflet
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google Places API key (for court enrichment)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/pickle-me.git
cd pickle-me

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_PLACES_API_KEY=your_google_places_key
ADMIN_PASSWORD=your_admin_password
```

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # Run ESLint
npm run seed      # Seed courts to Supabase
npm run enrich    # Enrich courts with Google Places data
```

## Project Structure

```
src/
├── app/                    # Next.js pages and routes
├── components/
│   ├── layout/            # Navbar, Footer
│   ├── map/               # Map components (client-side)
│   ├── home/              # Hero section
│   └── ui/                # UI primitives
└── lib/
    ├── supabase/          # Database clients and queries
    └── utils.ts           # Utility functions

scripts/                   # Seed and enrichment scripts
```

## Deployment

The app is deployed on [Vercel](https://vercel.com) with a [Supabase](https://supabase.com) PostgreSQL database.

## License

MIT
