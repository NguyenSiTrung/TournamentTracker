# Product Guidelines: Tournament Tracker

## Tone & Voice
- **Casual & fun** — use emojis freely (🏆, 🎮, 🎯, ⚡) to reinforce the game night vibe
- **Friendly & warm** — approachable language that celebrates play ("Great game!", "Well played!", "Let's go!")
- Avoid corporate or overly formal language
- Keep labels short and action-oriented ("Add Game", "New Session", not "Create a New Game Session")

## UI Copy Principles
- Use encouraging feedback: "Team created! 🎉", "Session completed! 🏆"
- Error messages should be helpful, not harsh: "Please add at least one player" over "Error: invalid input"
- Empty states should guide the user: "No teams yet. Create your first team to get started!"

## Visual Identity
- **Theme:** Dark green pro theme — deep forest background (`#0b1a0f`), green accent system
- **Style:** Glassmorphism cards with subtle blur and translucent borders
- **Typography:** Inter (body) + Space Grotesk (display/headings), bold weights for emphasis (700–900)
- **Iconography:** Emoji-based icons for simplicity and personality (🏆, 👥, 🎮, 📊)
- **Color Palette:**
  - Primary background: `#0b1a0f` (body), `#0d1f12` (sidebar), `#132218` (cards)
  - Accent green: `#4caf50` / bright: `#66bb6a` / dark: `#2e7d32` / emerald: `#00c853`
  - Gold (winners): `#ffd700`
  - Danger/errors: `#ef5350`
  - Success: `#4caf50`
  - Text primary: `#e8f5e9` / secondary: `#81c784` / muted: `#6b9b72`

## Interaction Patterns
- Confirm destructive actions (delete team, complete session) with a modal
- Toast notifications for feedback (success, error, info) — auto-dismiss after 3s
- Smooth transitions and hover effects to feel polished
- Tab-based navigation for main sections

## Accessibility
- Ensure sufficient color contrast for text on dark backgrounds
- Support keyboard navigation (Escape to close modals)
- Responsive design: mobile-first, collapsing labels on small screens
