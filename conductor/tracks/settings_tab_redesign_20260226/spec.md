# Spec: Settings Tab Redesign

## Overview
Complete redesign of the Settings tab from a minimal 2-button data management page into a full-featured, premium settings dashboard with 5 organized sections. The redesign is inspired by a Google Stitch-generated design featuring glassmorphism cards, emerald gradient accents, and a modern esports aesthetic. This includes both UI/UX improvements and significant backend feature additions (league settings persistence, customizable scoring rules, selective data reset).

## Functional Requirements

### 1. Tournament Profile Section
- **Editable league name** (text input, currently hardcoded as "Pro League")
- **Editable season** (text input, currently hardcoded as "Season 4")
- **League description** (textarea, optional)
- **Backend persistence**: New `league_settings` table/endpoint to store and retrieve these values
- **Live sidebar sync**: Changing league name/season updates the sidebar brand text in real-time
- **Save button**: Explicit save action with success/error toast feedback
- **API**: `GET /api/settings` and `PUT /api/settings` endpoints

### 2. Scoring Configuration Section
- **Visual point cards**: Display 1st through 4th place with colored badges (gold, silver, bronze, default)
- **Editable point values**: Number inputs for each placement position
- **2-Player mode toggle**: Show/configure the 2-player scoring variant (1st=4, 2nd=1)
- **Backend persistence**: Store scoring rules in settings; scoring calculation reads from stored config instead of hardcoded values
- **Validation**: Points must be positive integers; 1st place >= 2nd >= 3rd >= 4th
- **Default reset**: Button to restore default scoring (4/3/2/1)

### 3. Data Management Section (Enhanced)
- **Export Data button**: Same functionality, with visual improvement
- **Import Data button**: Same functionality, with visual improvement
- **Data statistics panel**: Show counts of teams, sessions, games dynamically fetched from API
- **Reset All Data (Danger Zone)**: Red-styled danger button that opens a confirmation modal with:
  - Checkboxes: Teams, Sessions/Games/Scores, League Settings
  - "Type RESET to confirm" text input for safety
  - Clear warning text about irreversibility
  - Backend endpoint: `DELETE /api/data/reset` with body specifying what to reset

### 4. Appearance Section
- **Reduce Motion toggle**: Toggle that applies/removes `prefers-reduced-motion` override for CSS animations
- **Client-side persistence**: Store preference in localStorage
- **Theme indicator**: Show "Dark" as current theme (read-only for now, only dark theme exists)

### 5. About Section
- **App name**: "Tournament Tracker"
- **Version**: Display app version (from a constant or API)
- **Build info**: Static build identifier
- **Credits**: Links or text credits

## Non-Functional Requirements
- **Design**: Glassmorphism cards, dark green/emerald theme (#0b1a0f background, #4caf50/#00c853 accents)
- **Typography**: Inter body, Space Grotesk for display elements
- **Layout**: Two-column responsive grid (profile + scoring left, appearance + data + about right) at desktop; single column on mobile
- **Animations**: Fade-in entrance for section cards, hover effects on interactive elements
- **Accessibility**: All inputs properly labeled, WCAG AA contrast compliance, keyboard navigable
- **Responsive**: Works at 768px and 480px breakpoints

## Acceptance Criteria
1. Settings tab displays all 5 sections in glassmorphism card layout
2. League name and season can be edited and saved to backend; sidebar updates in real-time
3. Scoring point values can be edited and saved; future game scoring uses stored values
4. Data stats (teams, sessions, games counts) load dynamically
5. Reset modal shows selectable categories with "RESET" confirmation
6. Reduce Motion toggle persists across sessions
7. About section displays app info
8. Design matches the Stitch-inspired premium aesthetic
9. All existing export/import functionality preserved
10. Responsive layout at all breakpoints

## Out of Scope
- Light theme implementation (toggle visible but only dark theme functional)
- Logo/image upload for league branding
- Notification settings
- User account management
- Placement multiplier slider (shown in Stitch design but not needed)
