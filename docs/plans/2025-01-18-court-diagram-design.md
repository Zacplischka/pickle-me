# Court Diagram Addition to Guides Page

## Summary

Add the court diagram image (`public/court-diagram.jpg`) to the Guides page Rules section, with key measurement callouts.

## Location

Inside `/src/app/guides/page.tsx`, immediately after the Kitchen (Non-Volley Zone) rule card (the third card in the Rules section).

## Design

A new card-style container matching existing rule cards:

- Container: `bg-card border border-border/60 rounded-xl p-6`
- Image: full width of card content, `rounded-lg` corners
- Divider below image
- "Key Measurements" subheading
- Two bullet points:
  - Court size: 44ft long × 20ft wide
  - Kitchen (Non-Volley Zone): 7ft from the net

## Implementation

1. Import `Image` from `next/image` in guides page
2. Add new card after the Kitchen rule card
3. Use `next/image` with the court diagram
4. Add measurement callouts below the image

## Files Changed

- `src/app/guides/page.tsx` - Add court diagram card
