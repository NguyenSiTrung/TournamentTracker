# CSS Style Guide

## Architecture
- Single stylesheet (`style.css`) organized by sections with comment headers
- Use CSS custom properties (`:root`) for theming (colors, spacing, transitions)
- Mobile-responsive via `@media` breakpoints at 768px and 480px

## Naming
- Lowercase with hyphens: `.team-card`, `.btn-accent`, `.glass-card`
- Component-scoped prefixes: `.session-header-bar`, `.leaderboard-entry`
- State classes: `.active`, `.expanded`, `.disabled`
- Utility classes: `.mt-8`, `.mb-16`, `.text-gold`, `.fw-bold`

## Properties
- Use CSS custom properties for all colors, radii, shadows, transitions
- Prefer `var(--property)` references over hardcoded values
- Group properties: positioning → display → box model → typography → visual → misc

## Responsive
- Desktop-first with mobile overrides
- Hide non-essential elements on mobile (e.g., `.tab-label`, `.header-actions`)
- Use flexible grids that collapse on smaller screens

## Effects
- Glassmorphism: `backdrop-filter: blur()` with translucent backgrounds
- Transitions on interactive elements (buttons, cards, tabs)
- Subtle hover transforms (`translateY`, `translateX`)
