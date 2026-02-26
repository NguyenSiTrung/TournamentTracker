# Spec: Dashboard Analytics Visualizations

## Overview
Add a dedicated **Analytics** tab to the Tournament Tracker sidebar with 6 interactive chart visualizations powered by ApexCharts (CDN). The tab provides rich graphical insights into team performance, win trends, session history, and head-to-head comparisons — complementing the existing Dashboard overview with deep data exploration.

## Functional Requirements

### FR-1: Analytics Tab (Sidebar Navigation)
- Add a new top-level "Analytics" entry in the sidebar navigation (📊 icon)
- Position between "History" and "Settings" in the sidebar order
- Uses the same tab-switching architecture as existing tabs (`data-tab="analytics"`, `#view-analytics`)
- New `js/analytics.js` module handles all chart rendering and data fetching
- Tab crossfade transition consistent with existing tab animations

### FR-2: Win Distribution Bar Chart
- **Type:** Horizontal bar chart
- **Data:** Total wins per team across all completed sessions
- **Display:** Team name + team color on each bar, value labels at bar ends
- **Interaction:** Hover tooltip showing exact win count and win percentage

### FR-3: Points Over Time Line Chart
- **Type:** Multi-series line/area chart
- **Data:** Cumulative team points plotted per session (X-axis: sessions chronologically, Y-axis: points)
- **Display:** One line per team, colored with team's assigned color
- **Interaction:** Hover crosshair tooltip showing all team values at that session; legend toggle to show/hide teams

### FR-4: Win Rate Pie/Donut Chart
- **Type:** Donut chart
- **Data:** Proportional win share per team (wins / total completed sessions)
- **Display:** Team color segments, center label showing total sessions
- **Interaction:** Hover tooltip with team name, win count, and percentage

### FR-5: Session Performance Sparklines
- **Type:** Inline sparkline mini-charts (one per team)
- **Data:** Per-session points for each team across last N sessions
- **Display:** Small sparkline next to team name and current total, rendered in a card grid
- **Interaction:** Hover tooltip showing session date and points for that session

### FR-6: Head-to-Head Comparison
- **Type:** Radar/spider chart
- **Data:** Multi-axis comparison of two selected teams (Total Points, Wins, Sessions Played, Avg Points/Session, Win Rate)
- **Display:** Two-team selector dropdowns above the chart; overlapping radar polygons in team colors
- **Interaction:** Tooltip on each axis showing exact values; team selectors update chart dynamically

### FR-7: Streak & Activity Heatmap
- **Type:** Heatmap grid
- **Data:** Session activity frequency and/or winning streaks over time
- **Display:** Calendar-style or grid-style heatmap with intensity mapped to activity/wins; color gradient from dark green to bright green (matching theme)
- **Interaction:** Hover tooltip showing date, session count, and winner(s)

### FR-8: Date Range Selector
- **Component:** Filter control at top of Analytics tab
- **Options:** "Last 5 Sessions", "Last 10 Sessions", "Last 30 Sessions", "All Time"
- **Behavior:** All 6 charts update simultaneously when filter changes; default is "All Time"
- **Persistence:** Selection resets on tab switch (no persistence needed)

### FR-9: Interactive Features (All Charts)
- **Tooltips:** All charts show detailed tooltips on hover with exact values
- **Team Legend Toggle:** Click team names in chart legends to show/hide that team's data
- **Animated Entrance:** Charts animate on tab load (bars grow, lines draw, donut segments expand)
- **Responsive Resize:** Charts adapt to viewport changes (768px / 480px breakpoints)
- **Team Color Integration:** Each team's data uses their assigned team color from the backend; fallback to ApexCharts default palette for teams without colors

### FR-10: Backend API — Analytics Endpoints
- **`GET /api/stats/analytics/points-over-time`** — Returns per-session cumulative points for each team
- **`GET /api/stats/analytics/head-to-head?team1=<id>&team2=<id>`** — Returns comparative stats for two teams
- **`GET /api/stats/analytics/activity-heatmap`** — Returns session activity data grouped by date
- Existing `/api/stats/leaderboard` provides data for win distribution, win rate, and sparklines (reuse)

### FR-11: Empty State
- When no completed sessions exist, show an illustrated empty state consistent with existing empty states (glassmorphism hero card, inline SVG illustration, CTA to start a session)
- Message: "No analytics data yet. Complete your first session to unlock insights! 📊"

### FR-12: Analytics Tab Layout
- **Top:** Page header ("Analytics" title + subtitle) + Date range selector
- **Row 1:** Win Distribution Bar (left, wider) + Win Rate Donut (right, narrower) — 2-column
- **Row 2:** Points Over Time Line Chart — full width
- **Row 3:** Sparklines grid (team cards) — responsive grid (3 cols → 2 → 1)
- **Row 4:** Head-to-Head Radar (left) + Streak Heatmap (right) — 2-column
- All chart containers use glassmorphism `.panel` cards consistent with Dashboard panels

## Non-Functional Requirements

- **NFR-1:** ApexCharts loaded via CDN `<script>` tag (no npm/bundler); version pinned
- **NFR-2:** Charts must render within 500ms on a dataset of 20 sessions × 8 teams
- **NFR-3:** All chart text meets WCAG AA contrast ratios on dark green theme
- **NFR-4:** `prefers-reduced-motion` disables chart entrance animations (consistent with existing behavior)
- **NFR-5:** Charts are non-interactive decorative content for screen readers (`aria-hidden="true"` on chart containers with text summary alternatives)

## Acceptance Criteria

1. ✅ "Analytics" tab appears in sidebar between History and Settings with 📊 icon
2. ✅ Tab switching works with crossfade animation consistent with other tabs
3. ✅ All 6 chart types render correctly with real data from the API
4. ✅ Tooltips display on hover for all charts
5. ✅ Team legend toggle hides/shows team data on applicable charts
6. ✅ Date range selector filters all charts simultaneously
7. ✅ Head-to-Head team selectors dynamically update radar chart
8. ✅ Charts use team-assigned colors from the backend
9. ✅ Animated chart entrances play on tab load
10. ✅ Responsive layout works at 768px and 480px breakpoints
11. ✅ Empty state displays when no completed sessions exist
12. ✅ `prefers-reduced-motion` disables animations
13. ✅ Backend analytics endpoints return correct data
14. ✅ All existing tests continue to pass (no regressions)

## Out of Scope

- Real-time WebSocket chart updates
- Chart data export (PNG/CSV download)
- Custom date range picker (calendar input)
- Per-player analytics (charts are team-level only)
- Persisting filter selections across sessions
- Print-optimized chart styles
