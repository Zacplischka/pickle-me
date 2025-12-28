# Search Bar with Autocomplete - Design Document

## Overview

Implement functional search bars (hero + navbar) with autocomplete that helps users find pickleball courts by name or location.

## Requirements

- **Autocomplete dropdown** appears on focus with suggestions
- **Smart single list** mixes courts and suburbs, ranked by relevance
- **Navigation**: Courts → detail page, suburbs → /search filtered
- **Identical behavior** for both hero and navbar search bars
- **Simple text match** ranking (starts with > contains)
- **Rich context** in dropdown: icons + secondary text

## Architecture

### Approach: Client-side Filtering

Fetch all courts once, filter in-browser. Chosen for:
- Instant autocomplete (no network latency)
- Simple implementation
- Appropriate for ~50-200 courts (Victoria scope)

### Component Structure

```
src/
├── components/search/
│   └── SearchInput.tsx      # Shared search component
├── lib/contexts/
│   └── CourtsContext.tsx    # Courts data provider
```

## SearchInput Component

### Props

```typescript
interface SearchInputProps {
  courts: Court[]
  variant: 'hero' | 'navbar'
  placeholder?: string
}
```

### Internal State

- `query: string` - Current input text
- `isOpen: boolean` - Dropdown visibility
- `activeIndex: number` - Keyboard navigation index

### Behavior

| Trigger | Action |
|---------|--------|
| Focus | Show dropdown with initial suggestions |
| Type | Filter and update dropdown |
| Blur (delayed) | Close dropdown |
| Arrow keys | Navigate suggestions |
| Enter | Select highlighted or submit query |
| Escape | Close dropdown |

## Data Structure

### Suggestion Type

```typescript
type Suggestion =
  | { type: 'court'; court: Court }
  | { type: 'suburb'; suburb: string; count: number }
```

### Filtering Logic

1. Normalize query (lowercase, trim)
2. Filter courts where name OR suburb contains query
3. Filter suburbs where name contains query
4. Rank by match position:
   - "Starts with" → score 0 (highest)
   - "Contains" → score 1
5. Sort by score, then alphabetically
6. Limit to 8 results

### Initial Suggestions (empty query)

- 3-4 popular suburbs (by court count)
- 2-3 highly-rated courts

## Dropdown UI

```
┌─────────────────────────────────────┐
│ 🏸 Melbourne Park Courts · Preston  │  ← court
│ 📍 Preston · 12 courts              │  ← suburb
│ 🏸 Preston Pickleball Club · Preston│
│ 📍 Melbourne · 8 courts             │
└─────────────────────────────────────┘
```

- Absolute positioned, full width
- White background, shadow, rounded corners
- Hover/active highlight
- MapPin icon for suburbs, racket/marker for courts

## Navigation

| Selection | Action |
|-----------|--------|
| Court | `router.push(/courts/[slug])` |
| Suburb | `router.push(/search?suburb=[suburb])` |
| Enter (no selection) | `router.push(/search?q=[query])` |

## Search Page URL Handling

- `?suburb=Preston` → filter to suburb
- `?q=pickle` → text search

Show active filter badge with clear button.

## Integration

### CourtsProvider Context

```tsx
// src/lib/contexts/CourtsContext.tsx
const CourtsContext = createContext<Court[]>([])

export function CourtsProvider({ children, courts }) {
  return (
    <CourtsContext.Provider value={courts}>
      {children}
    </CourtsContext.Provider>
  )
}

export const useCourts = () => useContext(CourtsContext)
```

### Files to Modify

| File | Change |
|------|--------|
| `src/components/search/SearchInput.tsx` | Create new |
| `src/lib/contexts/CourtsContext.tsx` | Create new |
| `src/components/home/Hero.tsx` | Use SearchInput |
| `src/components/layout/Navbar.tsx` | Add SearchInput |
| `src/app/search/page.tsx` | Read URL params, filter |
| `src/components/search/SearchLayout.tsx` | Accept filtered courts |

## Edge Cases

- **No matches**: Show "No courts or suburbs match '[query]'"
- **Loading**: Skeleton/spinner in dropdown
- **Rapid typing**: Debounce ~150ms
- **Click outside**: Close dropdown
- **Special characters**: Escape regex chars

## Accessibility

- `role="combobox"` on input
- `role="listbox"` on dropdown
- `role="option"` on suggestions
- `aria-expanded`, `aria-activedescendant`
- Keyboard navigation with focus management
- Escape closes dropdown

## Performance

- `useMemo` for filtered results
- Max 8 dropdown items
- No virtualization needed at scale
