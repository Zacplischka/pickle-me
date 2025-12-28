# Dark/Light Mode Feature Design

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
  /* Light theme (existing values) */
}

.dark {
  /* Dark theme (moved from @media query) */
}
```

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
- Icon button showing current theme (Sun/Moon/Monitor)
- Dropdown with Light, Dark, System options
- Active state indicator on current selection
- Mounted check to prevent hydration mismatch
- Keyboard accessible

**Variants:**
- `default` - Icon button with dropdown (desktop)
- `mobile` - Full-width row with label (mobile menu)

### Navbar Integration

**Desktop:** ThemeToggle between search button and "List a Court" button

**Mobile menu:** Full-width ThemeToggle row before "List a Court" button

## Files to Create/Modify

1. `package.json` - Add next-themes dependency
2. `src/app/globals.css` - Convert to class-based dark mode
3. `src/app/layout.tsx` - Add ThemeProvider wrapper
4. `src/components/ui/ThemeToggle.tsx` - New component
5. `src/components/layout/Navbar.tsx` - Add ThemeToggle

## No Changes Needed

- Existing components already use semantic CSS variables
- They will automatically respond to theme changes
