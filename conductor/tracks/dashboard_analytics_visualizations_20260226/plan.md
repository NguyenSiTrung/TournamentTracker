# Plan: Dashboard Analytics Visualizations

## Phase 1: Backend Analytics API
<!-- execution: sequential -->
<!-- depends: -->

- [ ] Task 1: Create analytics router with points-over-time endpoint
  - [ ] Create `backend/routers/analytics.py` with `APIRouter(prefix="/api/stats/analytics")`
  - [ ] Implement `GET /points-over-time` — returns per-session cumulative points for each team
  - [ ] Create Pydantic response schemas in `backend/models/schemas.py` (`PointsOverTimeEntry`, `PointsOverTimeSeries`)
  - [ ] Register router in `backend/main.py`
  - [ ] Write tests in `backend/tests/test_analytics.py` for points-over-time endpoint

- [ ] Task 2: Add head-to-head comparison endpoint
  - [ ] Implement `GET /head-to-head?team1=<id>&team2=<id>` in analytics router
  - [ ] Returns: total_points, wins, sessions_played, avg_points_per_session, win_rate for each team
  - [ ] Create `HeadToHeadResponse` Pydantic schema
  - [ ] Add validation for missing/invalid team IDs
  - [ ] Write tests for head-to-head endpoint (valid teams, invalid teams, edge cases)

- [ ] Task 3: Add activity heatmap endpoint
  - [ ] Implement `GET /activity-heatmap` in analytics router
  - [ ] Returns: list of `{ date, session_count, winners[] }` grouped by date
  - [ ] Create `ActivityHeatmapEntry` Pydantic schema
  - [ ] Write tests for activity heatmap endpoint

- [ ] Task 4: Conductor — User Manual Verification 'Backend Analytics API' (Protocol in workflow.md)

## Phase 2: Frontend Foundation — Tab & ApexCharts Setup
<!-- execution: sequential -->
<!-- depends: -->

- [ ] Task 1: Add ApexCharts CDN and Analytics tab to HTML
  - [ ] Add ApexCharts CDN `<script>` tag to `index.html` (version pinned)
  - [ ] Add "Analytics" sidebar nav button between History and Settings (📊 icon, `data-tab="analytics"`)
  - [ ] Add `<section class="view-content" id="view-analytics">` with page header, date range selector, and chart container placeholders
  - [ ] Layout structure: page header → filter row → 2-col row (bar + donut) → full-width row (line) → grid row (sparklines) → 2-col row (radar + heatmap)

- [ ] Task 2: Create analytics.js module and register tab
  - [ ] Create `js/analytics.js` with module pattern (matching existing `Teams`, `Session`, `History`, `Settings` patterns)
  - [ ] Export `Analytics.render()` entry point
  - [ ] Register `ANALYTICS` in `App.js` TAB enum and `TAB_RENDERERS`
  - [ ] Add `<script src="/js/analytics.js"></script>` to `index.html`
  - [ ] Verify tab switching works with crossfade transition

- [ ] Task 3: Add analytics API client functions
  - [ ] Add `getPointsOverTime()`, `getHeadToHead(team1, team2)`, `getActivityHeatmap()` to `js/api.js`
  - [ ] Add wrapper functions in `js/store.js` for analytics data fetching
  - [ ] Wire date range filter to pass query params

- [ ] Task 4: Create ApexCharts theme configuration
  - [ ] Define shared dark theme config object in `analytics.js` matching glassmorphism design tokens
  - [ ] Colors: background transparent, grid lines `#1a3a20`, text `#e8f5e9`, tooltip dark styled
  - [ ] Configure `prefers-reduced-motion` to disable animations globally
  - [ ] Create helper function to map team colors from backend to chart series colors

- [ ] Task 5: Conductor — User Manual Verification 'Frontend Foundation' (Protocol in workflow.md)

## Phase 3: Chart Implementations
<!-- execution: parallel -->
<!-- depends: phase1, phase2 -->

- [ ] Task 1: Implement Win Distribution Bar Chart
  <!-- files: js/analytics.js (renderWinDistribution function only) -->
  - [ ] Fetch leaderboard data, extract wins per team
  - [ ] Render horizontal bar chart with team colors, value labels
  - [ ] Apply hover tooltips (win count + percentage)
  - [ ] Responsive config for 768px/480px breakpoints

- [ ] Task 2: Implement Win Rate Donut Chart
  <!-- files: js/analytics.js (renderWinRateDonut function only) -->
  - [ ] Fetch leaderboard data, calculate win proportions
  - [ ] Render donut chart with team color segments, center total label
  - [ ] Apply hover tooltips (team name, wins, percentage)
  - [ ] Legend toggle to show/hide teams

- [ ] Task 3: Implement Points Over Time Line Chart
  <!-- files: js/analytics.js (renderPointsOverTime function only) -->
  - [ ] Fetch points-over-time API data
  - [ ] Render multi-series line chart with team colors
  - [ ] Crosshair tooltip showing all team values at hover point
  - [ ] Legend toggle for team visibility
  - [ ] Responsive resize behavior

- [ ] Task 4: Implement Session Performance Sparklines
  <!-- files: js/analytics.js (renderSparklines function only) -->
  - [ ] Fetch leaderboard + per-session data for each team
  - [ ] Render sparkline card grid (team name + total + mini chart)
  - [ ] Hover tooltip on sparkline showing session date and points
  - [ ] Responsive grid: 3 cols → 2 → 1

- [ ] Task 5: Implement Head-to-Head Radar Chart
  <!-- files: js/analytics.js (renderHeadToHead function only) -->
  - [ ] Add two team selector dropdowns above chart container
  - [ ] Fetch head-to-head API data on team selection
  - [ ] Render radar chart with 5 axes (Points, Wins, Sessions, Avg Pts, Win Rate)
  - [ ] Overlapping polygons in team colors
  - [ ] Dynamic update on selector change

- [ ] Task 6: Implement Streak & Activity Heatmap
  <!-- files: js/analytics.js (renderActivityHeatmap function only) -->
  - [ ] Fetch activity heatmap API data
  - [ ] Render heatmap with intensity mapped to session activity
  - [ ] Color gradient: dark green → bright green (theme-consistent)
  - [ ] Hover tooltip showing date, session count, winners

- [ ] Task 7: Conductor — User Manual Verification 'Chart Implementations' (Protocol in workflow.md)

## Phase 4: Analytics CSS & Polish
<!-- execution: sequential -->
<!-- depends: phase3 -->

- [ ] Task 1: Create analytics tab styles
  - [ ] Add analytics section styles to CSS (or new `css/analytics.css`)
  - [ ] Style chart containers as glassmorphism `.panel` cards
  - [ ] Style date range selector consistent with existing filter controls
  - [ ] Style head-to-head team selector dropdowns
  - [ ] Style sparkline card grid layout
  - [ ] Ensure 2-column / full-width / grid row layout per spec

- [ ] Task 2: Implement animated chart entrances
  - [ ] Charts animate on tab load (bars grow, lines draw, donut expand)
  - [ ] Stagger entrance animations per chart card (matching existing `nth-child` stagger pattern)
  - [ ] `prefers-reduced-motion` disables all chart animations
  - [ ] Use `void el.offsetWidth` reflow trick if re-triggering animations on tab revisit

- [ ] Task 3: Implement empty state
  - [ ] When no completed sessions exist, show glassmorphism hero card with inline SVG illustration
  - [ ] Message: "No analytics data yet. Complete your first session to unlock insights! 📊"
  - [ ] CTA button to start a session (matching existing empty state pattern)
  - [ ] Hide all chart containers when empty state is shown

- [ ] Task 4: Responsive layout and accessibility
  - [ ] Test and fix chart layouts at 768px and 480px breakpoints
  - [ ] 2-column rows collapse to single column on mobile
  - [ ] Sparkline grid: 3 → 2 → 1 columns
  - [ ] Add `aria-hidden="true"` to all chart containers
  - [ ] Verify WCAG AA contrast on all chart text/labels
  - [ ] Keyboard accessibility: date range selector and H2H dropdowns are keyboard navigable

- [ ] Task 5: Conductor — User Manual Verification 'Analytics CSS & Polish' (Protocol in workflow.md)

## Phase 5: Integration Testing & Final QA
<!-- execution: sequential -->
<!-- depends: phase4 -->

- [ ] Task 1: Integration testing
  - [ ] Test all 6 charts render with real multi-team, multi-session data
  - [ ] Test date range filter updates all charts correctly
  - [ ] Test empty state shows/hides correctly
  - [ ] Test tab switching does not leak memory (chart instances destroyed on tab leave)
  - [ ] Run all existing backend tests — verify no regressions
  - [ ] Verify no console errors or warnings

- [ ] Task 2: Cross-tab data consistency
  - [ ] Verify analytics updates after: completing a session, adding a team, deleting data
  - [ ] Verify `App.refreshDashboard()` integration (analytics re-renders on data changes)
  - [ ] Test sidebar nav badge and tab active state

- [ ] Task 3: Conductor — User Manual Verification 'Integration Testing & Final QA' (Protocol in workflow.md)
