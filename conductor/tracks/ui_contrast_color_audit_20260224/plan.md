# Plan: UI/UX Contrast & Color Audit

## Phase 1: CSS Custom Properties & Global Foundation

- [x] Task 1: Audit and fix CSS custom property contrast ratios
  - Review `--text-muted` (#4a7c50) vs `--bg-card` (#132218) — currently ~2.5:1, needs ≥4.5:1
  - Review `--text-dim` (#2e5233) vs `--bg-body` (#0b1a0f) — currently ~1.7:1, needs ≥4.5:1
  - Review `--border-color-light` visibility against card/body backgrounds
  - Adjust muted/dim text colors and low-alpha borders to meet WCAG AA
  - Sub-tasks:
    - [x] Calculate current contrast ratios for all text-color/bg pairs
    - [x] Propose improved values preserving dark green identity
    - [x] Update `:root` custom properties

- [x] Task 2: Audit and fix global element contrast (buttons, badges, forms)
  - Review `.btn-outline` and `.btn-ghost` text color vs background
  - Review `.form-input::placeholder` color (`--text-dim`) readability
  - Review `.badge-active` and `.badge-completed` contrast
  - Review `.status-badge` variants (finalized, review, pending, active) contrast
  - Sub-tasks:
    - [x] Fix placeholder text contrast
    - [x] Fix outline/ghost button contrast
    - [x] Fix badge and status badge contrast

- [x] Task: Conductor - User Manual Verification 'CSS Custom Properties & Global Foundation' (Protocol in workflow.md)

## Phase 2: Sidebar & Navigation

- [x] Task 1: Audit and fix sidebar contrast issues
  - Review `.sidebar-nav-item` inactive state (`--text-muted`) readability
  - Review `.sidebar-season` text (`--text-muted`) readability
  - Review `.sidebar-user-email` text (`--text-muted`) readability
  - Review `.sidebar-logout-btn` icon color readability
  - Sub-tasks:
    - [x] Fix inactive nav item text contrast
    - [x] Fix sidebar footer text contrast (season label, user email)

- [x] Task: Conductor - User Manual Verification 'Sidebar & Navigation' (Protocol in workflow.md)

## Phase 3: Dashboard Section

- [ ] Task 1: Audit and fix dashboard stat cards & leaderboard
  - Review `.stat-card-label` (uppercase labels) contrast — uses `--text-muted`
  - Review `.stat-card-trend-neutral` contrast
  - Review `.lb-rank` contrast for non-podium positions
  - Review `.lb-team-players-count` contrast
  - Review `.panel-action-link` and `.game-count` contrast
  - Sub-tasks:
    - [ ] Fix stat card label contrast
    - [ ] Fix leaderboard secondary text contrast
    - [ ] Fix panel action link and game count contrast

- [ ] Task 2: Audit and fix dashboard sessions table
  - Review `.sessions-table th` header contrast
  - Review `.session-cell-date` contrast
  - Review `.points-pending` and `.points-neutral` contrast
  - Sub-tasks:
    - [ ] Fix table header text contrast
    - [ ] Fix secondary table cell text contrast

- [ ] Task: Conductor - User Manual Verification 'Dashboard Section' (Protocol in workflow.md)

## Phase 4: Session Tab

- [ ] Task 1: Audit and fix session hero, KPI cards, and matrix
  - Review `.session-kpi-label` contrast on dark card backgrounds
  - Review `.session-sidebar-caption` contrast
  - Review `.matrix-player-breakdown` contrast (`--text-muted`)
  - Review `.matrix-cell-empty` contrast
  - Review `.matrix-rank` color scale (ranks 3, 4) contrast
  - Review `.standings-note-neutral` contrast
  - Review `.standings-score span` (unit text) contrast
  - Sub-tasks:
    - [ ] Fix session KPI label and sidebar caption contrast
    - [ ] Fix matrix secondary text contrast
    - [ ] Fix standings secondary text contrast

- [ ] Task 2: Audit and fix penalty panel contrast
  - Review `.penalty-reason` text contrast
  - Review `.session-penalty-panel` background against penalty items
  - Review `.matrix-subtotal-cell span` contrast
  - Sub-tasks:
    - [ ] Fix penalty reason text contrast
    - [ ] Fix subtotal secondary text contrast

- [ ] Task: Conductor - User Manual Verification 'Session Tab' (Protocol in workflow.md)

## Phase 5: Teams, History, Settings & Modals

- [ ] Task 1: Audit and fix teams tab
  - Review `.player-tag` text contrast
  - Review `.team-card-actions .btn` contrast at small size

- [ ] Task 2: Audit and fix history tab
  - Review `.history-session-meta` text contrast
  - Review `.stats-table th` header contrast
  - Review `.expand-icon` contrast
  - Review `.empty-state` text contrast

- [ ] Task 3: Audit and fix modals and toasts
  - Review `.btn-close` background/text contrast
  - Review modal form label contrast in game result modal
  - Review toast notification text contrast and border accents
  - Review `.btn-delete-inline` contrast (`--text-muted`)

- [ ] Task: Conductor - User Manual Verification 'Teams, History, Settings & Modals' (Protocol in workflow.md)
