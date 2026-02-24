# Learnings

## Inherited (from previous tracks)
- Inline SVGs preferred over PNGs for empty states
- BEM naming convention for component variants
- FastAPI StaticFiles mounts need to include all asset directories
- `void el.offsetWidth` forces reflow for CSS trigger of animations
- Animations: use transform/opacity for GPU compositing
- `prefers-reduced-motion` handled globally via blanket rule at end of stylesheet

## Discovered
- `grid-column: 1 / -1` is the cleanest way to span an element across all CSS Grid columns
- Glassmorphism effect: combine `backdrop-filter: blur(16px)` with `rgba()` background and radial gradient glow for premium feel
- Inline SVG `<defs>` gradient IDs must be unique per page to avoid ID collisions when multiple SVGs are present
- Horizontal stepper connecting lines: use `::after` pseudo-elements with `border-top: dashed` positioned absolutely
- When replacing PNG empty states with inline SVGs, update both the JS render functions AND the static HTML in index.html to keep initial render consistent
- `aria-hidden="true"` on decorative SVGs prevents screen readers from announcing visual-only content
- SVG `<text>` elements need explicit `font-family` attribute to render consistently across browsers
