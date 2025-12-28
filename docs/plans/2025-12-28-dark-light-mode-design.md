# Dark/Light Mode Feature Design

## Status: COMPLETED

## Overview

Add user-controlled theme switching with Light, Dark, and System options.

## Requirements

- Theme toggle in both Navbar (desktop) and mobile menu
- Three options: Light / Dark / System
- Icon button with dropdown UI
- Persist user preference across sessions
- Respect system preference when "System" selected

## Technical Approach

**Library:** next-themes (industry standard for Next.js)

### CSS Changes

Convert from media query to class-based dark mode in `globals.css`:

```css
:root {
  /* Light theme values */
}

html.dark {
  /* Dark theme values */
}
```

**Note:** Must use `html.dark` selector (not just `.dark`) for proper specificity with Tailwind CSS v4.

### ThemeProvider Setup

Wrap app in ThemeProvider in `layout.tsx`:

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

- `attribute="class"` - Uses `.dark` class on `<html>`
- `defaultTheme="system"` - Respects OS preference by default
- `suppressHydrationWarning` on `<html>` element

### ThemeToggle Component

New file: `src/components/ui/ThemeToggle.tsx`

**Features:**
- Icon button showing current theme (Sun/Moon)
- Dropdown with Light, Dark, System options (with icons)
- Active state indicator (checkmark) on current selection
- Mounted check to prevent hydration mismatch
- Keyboard accessible (Escape closes dropdown)
- Click outside closes dropdown
- Framer Motion animations

**Variants:**
- `default` - Icon button with dropdown (desktop)
- `mobile` - Full-width row with label and chevron (mobile menu)

### Navbar Integration

**Desktop:** ThemeToggle between search button and "List a Court" button

**Mobile menu:** Full-width ThemeToggle row before "List a Court" button

## Files Created/Modified

1. `package.json` - Added next-themes dependency
2. `src/app/globals.css` - Converted to class-based dark mode with `html.dark`
3. `src/app/layout.tsx` - Added ThemeProvider wrapper
4. `src/components/ui/ThemeToggle.tsx` - New component (created)
5. `src/components/layout/Navbar.tsx` - Added ThemeToggle to desktop and mobile
6. `src/components/home/Hero.tsx` - Updated to use theme-aware CSS variables

## Implementation Notes

### Hero Section Fix

The Hero component originally used hardcoded dark colors (`bg-slate-900`, `text-white`). Updated to use semantic CSS variables:

- `bg-slate-900` → `bg-muted`
- `text-white` → `text-foreground`
- `text-slate-300` → `text-muted-foreground`
- `bg-slate-800/50` → `bg-card/80`
- `border-slate-700/50` → `border-border`

### Tailwind v4 Specificity Fix

Initial implementation used `.dark { ... }` selector which didn't properly override `:root` variables in Tailwind v4. Fixed by using `html.dark { ... }` selector for proper CSS specificity.
