# Spec: Redesign Empty States

## Overview

Redesign all empty states across the Tournament Tracker application with a rich, illustrated style matching the provided design mockup. Each empty state will feature a generated trophy/themed illustration, bold heading, descriptive subtitle, a prominent CTA button, and contextual "How it works" onboarding steps where appropriate. The goal is to transform basic text placeholders into visually engaging, premium onboarding experiences.

## Functional Requirements

### 1. Teams Tab Empty State (Primary)
- Display a generated trophy illustration (PNG/WebP image asset)
- Heading: "No Teams Registered"
- Subtitle: "Start by creating your first team to track their progress and scores across sessions."
- Full-width green CTA button: "+ Create Your First Team"
- "How it works" section with 3 icon-labeled steps:
  - ✏️ 1. Name your team
  - 👥 2. Add players
  - 🎮 3. Start playing!
- CTA button triggers the existing `Teams.showCreateModal()` function

### 2. Dashboard Leaderboard Empty State
- Themed illustration for leaderboard/rankings context
- Heading: "No Rankings Yet"
- Subtitle: "Complete your first session to see team rankings here."
- CTA: "Start a Session" → switches to session tab

### 3. Dashboard Recent Sessions Empty State
- Themed illustration for sessions context
- Heading: "No Sessions Recorded"
- Subtitle: "Start a new session to track games and scores."
- CTA: "Start New Session" → triggers new session flow

### 4. Session Tab Empty State (No Active Session)
- Already has a semi-illustrated style — enhance to match the new design language
- Keep existing CTA and resume functionality
- Add themed illustration replacing the emoji icon

### 5. History Tab Empty States (Overall Stats + Session History)
- Themed illustration for history/statistics
- Heading: "No History Yet"
- Subtitle: "Complete sessions to build your tournament history and statistics."
- CTA: "Go to Sessions" → switches to session tab

### 6. Inline Empty States (Games list, Penalties, Scoreboard)
- Keep these lighter — use consistent `.empty-state` styling with subtle icon + text
- No full illustrated treatment (they appear within active panels, not as primary views)

## Non-Functional Requirements
- Generated images should be optimized WebP format and served as static assets
- All illustrations must look cohesive on the dark green theme (#0a1f14 background)
- Animations: fade-in entrance animation on empty state render
- Responsive: stack vertically on mobile (≤480px), scale illustration down
- Must respect `prefers-reduced-motion` accessibility preference

## Acceptance Criteria
- [ ] All 5 primary empty states display rich illustrated cards instead of plain text
- [ ] Each illustration is a generated image asset (not emoji)
- [ ] CTA buttons trigger the correct existing actions
- [ ] "How it works" steps appear on Teams empty state with accurate current-feature steps
- [ ] Empty states are responsive at 768px and 480px breakpoints
- [ ] Entrance animations respect `prefers-reduced-motion`
- [ ] Inline empty states (games, penalties, scoreboard) have consistent subtle styling

## Out of Scope
- Team logo/avatar upload feature
- Animated/Lottie illustrations
- Localization/i18n of empty state text
