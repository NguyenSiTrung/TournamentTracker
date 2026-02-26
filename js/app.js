/**
 * App - Main application controller
 */
const App = (() => {
    let activeModalClass = '';
    let recentSessionsFilter = 'all';
    const TAB = Object.freeze({
        DASHBOARD: 'dashboard',
        TEAMS: 'teams',
        SESSION: 'session',
        HISTORY: 'history',
        SETTINGS: 'settings',
    });
    const TAB_RENDERERS = Object.freeze({
        [TAB.DASHBOARD]: () => refreshDashboard(),
        [TAB.TEAMS]: () => Teams.render(),
        [TAB.SESSION]: () => Session.render(),
        [TAB.HISTORY]: () => History.render(),
        [TAB.SETTINGS]: () => Settings.render(),
    });

    async function init() {
        setupSidebarNavigation();
        setupEventListeners();
        Settings.restoreReduceMotion();
        await checkLocalStorageMigration();
        await refreshAll();
    }

    function getAvailableTabs() {
        const tabs = Array.from(document.querySelectorAll('.sidebar-nav-item[data-tab]'))
            .map((btn) => btn.getAttribute('data-tab'))
            .filter(Boolean);
        return Array.from(new Set(tabs));
    }

    function getCurrentActiveTab() {
        const active = document.querySelector('.sidebar-nav-item.active[data-tab]');
        return active ? active.getAttribute('data-tab') : null;
    }

    function resolveTabName(tabName) {
        const availableTabs = getAvailableTabs();
        if (availableTabs.length === 0) {
            return null;
        }

        if (tabName && availableTabs.includes(tabName) && document.getElementById(`view-${tabName}`)) {
            return tabName;
        }

        const activeTab = getCurrentActiveTab();
        if (activeTab && availableTabs.includes(activeTab) && document.getElementById(`view-${activeTab}`)) {
            return activeTab;
        }

        if (availableTabs.includes(TAB.DASHBOARD) && document.getElementById(`view-${TAB.DASHBOARD}`)) {
            return TAB.DASHBOARD;
        }

        return availableTabs.find((tab) => document.getElementById(`view-${tab}`)) || null;
    }

    function setupSidebarNavigation() {
        document.querySelectorAll('.sidebar-nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                switchTab(tab);
            });
        });

        // Mobile sidebar toggle
        const toggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        if (toggle) {
            toggle.addEventListener('click', () => {
                const isOpen = sidebar.classList.toggle('open');
                toggle.setAttribute('aria-expanded', String(isOpen));
            });
        }

        // Close sidebar on main area click (mobile)
        document.querySelector('.main-area').addEventListener('click', () => {
            sidebar.classList.remove('open');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    async function switchTab(tabName) {
        const resolvedTab = resolveTabName(tabName);
        if (!resolvedTab) {
            console.warn(`Unable to switch tab for target "${tabName}"`);
            return;
        }

        const target = document.getElementById(`view-${resolvedTab}`);
        if (!target) {
            console.warn(`Missing view for tab "${resolvedTab}"`);
            return;
        }

        // Update sidebar active state
        document.querySelectorAll('.sidebar-nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === resolvedTab);
        });

        // Show target view
        document.querySelectorAll('.view-content').forEach(content => {
            if (content === target) {
                content.classList.remove('active');
                void content.offsetWidth; // force reflow
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        // Close mobile sidebar
        document.getElementById('sidebar').classList.remove('open');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.setAttribute('aria-expanded', 'false');
        }

        const renderTab = TAB_RENDERERS[resolvedTab];
        if (renderTab) {
            await renderTab();
        }
    }

    function setupDelegatedTabSwitching() {
        document.addEventListener('click', (event) => {
            const trigger = event.target.closest('[data-switch-tab]');
            if (!trigger) {
                return;
            }

            const tabName = trigger.getAttribute('data-switch-tab');
            if (!tabName) {
                return;
            }

            event.preventDefault();
            switchTab(tabName);
        });
    }

    function setTabSwitchTarget(el, tabName) {
        if (!el) {
            return;
        }
        el.setAttribute('data-switch-tab', tabName);
        el.removeAttribute('onclick');
    }

    function setTabSwitchTargets(root = document) {
        if (!root) {
            return;
        }

        root.querySelectorAll('[onclick]').forEach((el) => {
            const handler = (el.getAttribute('onclick') || '').trim();
            const match = handler.match(/^App\.switchTab\('([^']+)'\)$/);
            if (!match) {
                return;
            }
            setTabSwitchTarget(el, match[1]);
        });
    }

    function setupEventListeners() {
        setupDelegatedTabSwitching();
        setTabSwitchTargets();

        document.getElementById('btn-create-team').addEventListener('click', () => {
            Teams.showCreateModal();
        });

        document.getElementById('btn-new-session').addEventListener('click', handleSessionStartIntent);
        document.getElementById('btn-start-session-hero').addEventListener('click', handleSessionStartIntent);

        document.getElementById('btn-add-game').addEventListener('click', () => {
            Session.showAddGameModal();
        });

        document.getElementById('btn-edit-session').addEventListener('click', () => {
            Session.showEditSessionModal();
        });

        document.getElementById('btn-add-penalty').addEventListener('click', () => {
            Session.showAddPenaltyModal();
        });

        document.getElementById('btn-complete-session').addEventListener('click', () => {
            Session.completeSession();
        });

        document.getElementById('modal-close').addEventListener('click', closeModal);
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modal-overlay')) {
                closeModal();
            }
        });

        // Export/Import (sidebar footer + settings)
        document.getElementById('btn-export').addEventListener('click', exportData);

        const exportSettings = document.getElementById('btn-export-settings');
        if (exportSettings) exportSettings.addEventListener('click', exportData);

        const importSettings = document.getElementById('btn-import-settings');
        if (importSettings) {
            importSettings.addEventListener('click', () => {
                document.getElementById('import-file').click();
            });
        }
        document.getElementById('import-file').addEventListener('change', importData);

        const recentFilter = document.getElementById('recent-session-filter');
        if (recentFilter) {
            recentFilter.addEventListener('change', async (e) => {
                recentSessionsFilter = e.target.value;
                await renderRecentSessions();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }

    async function refreshAll() {
        // Load sidebar brand from settings
        try {
            const settings = await API.getSettings();
            const brandEl = document.querySelector('.sidebar-brand');
            const seasonEl = document.querySelector('.sidebar-season');
            if (brandEl) brandEl.textContent = settings.league_name || 'Pro League';
            if (seasonEl) seasonEl.textContent = settings.season || 'Season 4';
        } catch (e) { /* silent fallback to hardcoded defaults */ }

        await refreshDashboard();
        await Teams.render();
        await Session.render();
        await History.render();
    }

    function animateCounter(el, target) {
        const duration = 1200;
        const start = performance.now();
        const from = 0;
        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(from + (target - from) * eased).toLocaleString();
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    async function refreshDashboard() {
        const teams = await Store.getTeams();
        const sessions = await Store.getSessions();
        const activeSessions = await Store.getActiveSessions();

        const totalTeams = teams.length;
        const totalSessions = sessions.length;
        const totalActive = activeSessions.length;

        let totalGames = 0;
        let totalPoints = 0;
        for (const s of sessions) {
            const full = await Store.getSession(s.id);
            totalGames += full.games.length;
        }

        // Calculate avg points per game
        const completed = await Store.getCompletedSessions();
        for (const s of completed) {
            const scores = await Store.getSessionScores(s.id);
            for (const [, score] of Object.entries(scores)) {
                totalPoints += score.total;
            }
        }
        const avgPoints = totalGames > 0 ? Math.round(totalPoints / totalGames) : 0;

        animateCounter(document.getElementById('total-teams'), totalTeams);
        animateCounter(document.getElementById('total-sessions'), totalSessions);
        animateCounter(document.getElementById('avg-points'), avgPoints);
        updateSessionEntryCtas(totalTeams);

        // Update nav badges
        updateNavBadges(activeSessions);

        await renderLeaderboard();
        await renderRecentSessions();
    }

    async function updateNavBadges(activeSessions) {
        const sessionBadge = document.getElementById('session-badge');
        if (activeSessions.length > 0) {
            sessionBadge.style.display = '';
        } else {
            sessionBadge.style.display = 'none';
        }
    }

    function updateSessionEntryCtas(totalTeams) {
        const needsTeams = totalTeams < 2;
        const heroLabel = document.getElementById('btn-start-session-hero-label');
        const sessionLabel = document.getElementById('btn-new-session-label');

        if (heroLabel) {
            heroLabel.textContent = needsTeams ? 'Create Teams First' : 'Start New Session';
        }
        if (sessionLabel) {
            sessionLabel.textContent = needsTeams ? 'Create Teams First' : 'New Session';
        }
    }

    async function handleSessionStartIntent() {
        const teams = await Store.getTeams();
        if (teams.length < 2) {
            toast('Create at least 2 teams first to start a session.', 'info');
            await switchTab(TAB.TEAMS);
            return;
        }
        Session.showNewSessionModal();
    }

    async function renderLeaderboard() {
        const leaderboard = await Store.getAllTimeLeaderboard();
        const container = document.getElementById('leaderboard-content');

        if (leaderboard.length === 0) {
            container.innerHTML = `
        <div class="empty-state-hero-card">
            <div class="empty-state-hero">
                <svg class="empty-state-hero__svg-illustration" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <!-- Podium blocks -->
                    <rect x="20" y="100" width="40" height="55" rx="4" fill="#132218" stroke="#2e7d32" stroke-width="1.5"/>
                    <rect x="70" y="75" width="40" height="80" rx="4" fill="#132218" stroke="#4caf50" stroke-width="2"/>
                    <rect x="120" y="110" width="40" height="45" rx="4" fill="#132218" stroke="#2e7d32" stroke-width="1.5"/>
                    <!-- Rank numbers -->
                    <text x="40" y="132" text-anchor="middle" fill="#2e7d32" font-size="18" font-weight="800" font-family="Inter,sans-serif" opacity="0.6">2</text>
                    <text x="90" y="112" text-anchor="middle" fill="#4caf50" font-size="22" font-weight="800" font-family="Inter,sans-serif" opacity="0.7">1</text>
                    <text x="140" y="140" text-anchor="middle" fill="#2e7d32" font-size="16" font-weight="800" font-family="Inter,sans-serif" opacity="0.5">3</text>
                    <!-- Stars above podium -->
                    <polygon points="90,42 93,50 101,51 95,56 96.5,64 90,60 83.5,64 85,56 79,51 87,50" fill="#ffd700" opacity="0.8"/>
                    <polygon points="40,70 42,75 47,75.5 43.5,78.5 44.5,83 40,80.5 35.5,83 36.5,78.5 33,75.5 38,75" fill="#c0c0c0" opacity="0.5"/>
                    <polygon points="140,82 141.5,86 146,86.5 143,89 143.8,93 140,91 136.2,93 137,89 134,86.5 138.5,86" fill="#cd7f32" opacity="0.5"/>
                    <!-- Sparkles -->
                    <circle cx="25" cy="60" r="2" fill="#ffd700" opacity="0.5"/>
                    <circle cx="160" cy="70" r="2.5" fill="#ffd700" opacity="0.4"/>
                    <circle cx="90" cy="168" r="2" fill="#4caf50" opacity="0.3"/>
                    <!-- Base line -->
                    <line x1="15" y1="156" x2="165" y2="156" stroke="#2e7d32" stroke-width="1" opacity="0.3"/>
                </svg>
                <h3 class="empty-state-hero__title">No Rankings Yet</h3>
                <p class="empty-state-hero__subtitle">Complete your first session to see team rankings here.</p>
                <button class="empty-state-hero__cta" data-switch-tab="${TAB.SESSION}" id="cta-start-session-lb">Start a Session</button>
            </div>
        </div>`;
            return;
        }

        function getInitials(name) {
            return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
        }

        let html = '';

        // First place card
        const first = leaderboard[0];
        const firstTeam = Store.getTeamFromCache(first.teamId);
        const firstName = firstTeam ? firstTeam.name : 'Unknown';
        const firstInitials = getInitials(firstName);
        const firstPlayerCount = firstTeam ? firstTeam.players.length : 0;

        html += `
            <div class="lb-first-place">
                <div class="lb-first-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    1ST PLACE
                </div>
                <div class="lb-first-score">${first.totalPoints.toLocaleString()} pts</div>
                <div class="lb-first-team">
                    <div class="lb-team-avatar lb-team-avatar-1">${escapeHtml(firstInitials)}</div>
                    <div>
                        <div class="lb-first-name">${escapeHtml(firstName)}</div>
                        <div class="lb-first-players">
                            ${Array(Math.min(firstPlayerCount, 4)).fill('').map(() => '<span class="lb-player-dot">👤</span>').join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remaining entries (2-5)
        const rest = leaderboard.slice(1, 5);
        rest.forEach((entry, idx) => {
            const team = Store.getTeamFromCache(entry.teamId);
            const teamName = team ? team.name : 'Unknown';
            const initials = getInitials(teamName);
            const rank = idx + 2;
            const playerCount = team ? team.players.length : 0;
            const avatarClass = rank === 2 ? 'lb-team-avatar-2' : rank === 3 ? 'lb-team-avatar-3' : 'lb-team-avatar-other';

            html += `
                <div class="lb-row">
                    <span class="lb-rank">${rank}</span>
                    <div class="lb-team-avatar ${avatarClass}">${escapeHtml(initials)}</div>
                    <div class="lb-team-info">
                        <div class="lb-team-name">${escapeHtml(teamName)}</div>
                        <div class="lb-team-players-count">${playerCount} Player${playerCount !== 1 ? 's' : ''}</div>
                    </div>
                    <span class="lb-score">${entry.totalPoints.toLocaleString()} pts</span>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    async function renderRecentSessions() {
        const allSessions = await Store.getSessions();
        allSessions.sort((a, b) => new Date(b.date) - new Date(a.date));
        const filterSelect = document.getElementById('recent-session-filter');
        if (filterSelect && !['all', 'active', 'completed'].includes(recentSessionsFilter)) {
            recentSessionsFilter = 'all';
        }
        if (filterSelect) {
            filterSelect.value = recentSessionsFilter;
        }

        const filteredSessions = allSessions.filter((session) => {
            if (recentSessionsFilter === 'active') return session.status === 'active';
            if (recentSessionsFilter === 'completed') return session.status === 'completed';
            return true;
        });
        const recent = filteredSessions.slice(0, 6);

        const tbody = document.getElementById('recent-sessions-body');
        const viewAll = document.getElementById('sessions-view-all');

        if (recent.length === 0) {
            if (allSessions.length > 0) {
                const label = recentSessionsFilter === 'active' ? 'active sessions' : 'finalized sessions';
                tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No ${label} found yet.</td></tr>`;
                viewAll.style.display = 'none';
                return;
            }

            tbody.innerHTML = `<tr><td colspan="5">
                <div class="empty-state-hero">
                    <svg class="empty-state-hero__svg-illustration" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="30" y="20" width="120" height="140" rx="12" fill="#132218" stroke="#2e7d32" stroke-width="1.5" opacity="0.9"/>
                        <rect x="45" y="45" width="90" height="8" rx="4" fill="#2e7d32" opacity="0.4"/>
                        <rect x="45" y="65" width="70" height="6" rx="3" fill="#2e7d32" opacity="0.25"/>
                        <rect x="45" y="83" width="90" height="8" rx="4" fill="#2e7d32" opacity="0.4"/>
                        <rect x="45" y="103" width="55" height="6" rx="3" fill="#2e7d32" opacity="0.25"/>
                        <rect x="45" y="121" width="80" height="8" rx="4" fill="#2e7d32" opacity="0.4"/>
                        <circle cx="140" cy="40" r="26" fill="#0b1a0f" stroke="#4caf50" stroke-width="2"/>
                        <polygon points="140,22 144.5,33 156,34.5 147.8,42.3 149.8,53.8 140,48.5 130.2,53.8 132.2,42.3 124,34.5 135.5,33" fill="#ffd700" opacity="0.9"/>
                    </svg>
                    <h3 class="empty-state-hero__title">No Sessions Recorded</h3>
                    <p class="empty-state-hero__subtitle">Start a new session to track games and scores.</p>
                    <button class="empty-state-hero__cta" onclick="App.handleSessionStartIntent()" id="cta-start-new-session">Start New Session</button>
                </div>
            </td></tr>`;
            viewAll.style.display = 'none';
            return;
        }

        const rows = [];
        for (let i = 0; i < recent.length; i++) {
            const session = recent[i];
            const full = await Store.getSession(session.id);
            const sessionNum = allSessions.length - allSessions.findIndex(item => item.id === session.id);
            const dateObj = new Date(full.date);

            // Determine if today/yesterday/other
            const now = new Date();
            const isToday = dateObj.toDateString() === now.toDateString();
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const isYesterday = dateObj.toDateString() === yesterday.toDateString();

            let dateLabel;
            if (isToday) {
                dateLabel = `Today, ${dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
            } else if (isYesterday) {
                dateLabel = `Yesterday, ${dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
            } else {
                dateLabel = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' +
                    dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            }

            let winnerName = '-';
            let pointsHtml = '<span class="points-pending">Pending</span>';
            let penaltyHtml = '<span class="points-neutral">-</span>';
            let statusHtml = '';

            if (full.status === 'completed') {
                const scores = await Store.getSessionScores(full.id);
                const sorted = Object.entries(scores).sort((a, b) => b[1].total - a[1].total);
                const winnerTeam = Store.getTeamFromCache(sorted[0]?.[0]);
                winnerName = winnerTeam ? winnerTeam.name : 'Unknown';

                const totalPts = sorted.reduce((sum, [, s]) => sum + s.gamePoints, 0);
                const totalPenalty = sorted.reduce((sum, [, s]) => sum + s.penaltyPoints, 0);

                pointsHtml = `<span class="points-positive">+${totalPts.toLocaleString()}</span>`;
                penaltyHtml = totalPenalty < 0
                    ? `<span class="points-negative">${totalPenalty}</span>`
                    : '<span class="points-neutral">-</span>';
                statusHtml = '<span class="status-badge status-finalized">Finalized</span>';
            } else {
                // Active session
                const scores = await Store.getSessionScores(full.id);
                const sorted = Object.entries(scores).sort((a, b) => b[1].total - a[1].total);
                const winnerTeam = Store.getTeamFromCache(sorted[0]?.[0]);
                winnerName = winnerTeam ? winnerTeam.name : '-';

                if (full.games.length > 0) {
                    const totalPts = sorted.reduce((sum, [, s]) => sum + s.gamePoints, 0);
                    pointsHtml = `<span class="points-positive">+${totalPts.toLocaleString()}</span>`;
                } else {
                    pointsHtml = '<span class="points-pending">Pending</span>';
                }
                statusHtml = '<span class="status-badge status-active">Active</span>';
            }

            rows.push(`
                <tr>
                    <td>
                        <div class="session-cell-info">
                            <span class="session-cell-id">Session #${sessionNum}</span>
                            <span class="session-cell-date">${dateLabel}</span>
                        </div>
                    </td>
                    <td>
                        <div class="session-cell-winner">
                            <span class="winner-dot"></span>
                            <span class="winner-name">${escapeHtml(winnerName)}</span>
                        </div>
                    </td>
                    <td>${pointsHtml}</td>
                    <td>${penaltyHtml}</td>
                    <td>${statusHtml}</td>
                </tr>
            `);
        }

        tbody.innerHTML = rows.join('');

        if (filteredSessions.length > 0) {
            viewAll.style.display = 'block';
        } else {
            viewAll.style.display = 'none';
        }

        // Update "View all X sessions" text
        const viewAllBtn = viewAll.querySelector('.panel-action-link');
        if (viewAllBtn) {
            const suffix = recentSessionsFilter === 'active'
                ? 'active sessions'
                : recentSessionsFilter === 'completed'
                    ? 'finalized sessions'
                    : 'sessions';
            viewAllBtn.textContent = `View all ${filteredSessions.length} ${suffix}`;
            setTabSwitchTarget(
                viewAllBtn,
                recentSessionsFilter === 'active' ? TAB.SESSION : TAB.HISTORY
            );
        }
    }

    // --- Modal ---
    function openModal(title, bodyHtml, footerHtml, options = {}) {
        const modal = document.getElementById('modal');
        if (activeModalClass) {
            modal.classList.remove(activeModalClass);
            activeModalClass = '';
        }

        const modalClass = typeof options.modalClass === 'string' ? options.modalClass.trim() : '';
        if (modalClass) {
            modal.classList.add(modalClass);
            activeModalClass = modalClass;
        }

        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = bodyHtml;
        document.getElementById('modal-footer').innerHTML = footerHtml;
        document.getElementById('modal-overlay').classList.add('active');

        setTimeout(() => {
            const input = document.querySelector('#modal-body .form-input');
            if (input) input.focus();
        }, 100);
    }

    function isModalDirty() {
        const overlay = document.getElementById('modal-overlay');
        if (!overlay.classList.contains('active')) return false;

        const fields = document.querySelectorAll('#modal-body input, #modal-body textarea, #modal-body select');
        for (const field of fields) {
            if (field.disabled) continue;
            const type = (field.getAttribute('type') || '').toLowerCase();
            if (type === 'hidden') continue;

            if (type === 'checkbox' || type === 'radio') {
                if (field.checked !== field.defaultChecked) return true;
                continue;
            }

            if (field.value !== field.defaultValue) return true;
        }

        return false;
    }

    function closeModal(force = false) {
        if (!force && isModalDirty()) {
            const confirmDiscard = window.confirm('Discard unsaved changes?');
            if (!confirmDiscard) return false;
        }

        document.getElementById('modal-overlay').classList.remove('active');

        if (activeModalClass) {
            document.getElementById('modal').classList.remove(activeModalClass);
            activeModalClass = '';
        }

        // Clean up any custom header injections and restore default title
        const header = document.querySelector('#modal .modal-header');
        if (header) {
            header.querySelectorAll('.ct-header').forEach(el => el.remove());
            const title = header.querySelector('#modal-title');
            if (title) title.style.display = '';
        }

        return true;
    }

    // --- Toast ---
    function toast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const el = document.createElement('div');
        el.className = `toast toast-${type}`;

        const icons = { success: '✅', error: '❌', info: 'ℹ️' };
        el.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${escapeHtml(message)}`;
        container.appendChild(el);

        setTimeout(() => {
            el.remove();
        }, 3000);
    }

    // --- Export / Import ---
    async function exportData() {
        try {
            const data = await Store.exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tournament_tracker_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast('Data exported!', 'success');
        } catch (err) {
            toast('Export failed: ' + err.message, 'error');
        }
    }

    async function importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async function (evt) {
            try {
                await Store.importData(evt.target.result);
                Store.invalidateTeamsCache();
                await refreshAll();
                toast('Data imported successfully!', 'success');
            } catch (err) {
                toast('Import failed: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    // --- localStorage Migration ---
    async function checkLocalStorageMigration() {
        const STORAGE_KEY = 'tournament_tracker_data';
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        let data;
        try {
            data = JSON.parse(raw);
        } catch {
            return;
        }

        if (!data.teams || !data.sessions) return;
        if (data.teams.length === 0 && data.sessions.length === 0) return;

        const body = `
            <p>Found existing data in your browser's localStorage:</p>
            <ul style="margin:12px 0;">
                <li><strong>${data.teams.length}</strong> teams</li>
                <li><strong>${data.sessions.length}</strong> sessions</li>
            </ul>
            <p>Would you like to migrate this data to the new backend database?</p>
            <p class="text-muted mt-8" style="font-size:0.85rem;">After migration, localStorage data will be cleared.</p>
        `;
        const footer = `
            <button class="btn btn-ghost" onclick="App.skipMigration()">Skip</button>
            <button class="btn btn-primary" onclick="App.runMigration()">Migrate Data</button>
        `;
        openModal('📦 Data Migration Available', body, footer);
    }

    async function runMigration() {
        const STORAGE_KEY = 'tournament_tracker_data';
        const raw = localStorage.getItem(STORAGE_KEY);
        try {
            await Store.importData(raw);
            localStorage.removeItem(STORAGE_KEY);
            Store.invalidateTeamsCache();
            closeModal(true);
            toast('Data migrated successfully!', 'success');
            await refreshAll();
        } catch (err) {
            toast('Migration failed: ' + err.message, 'error');
        }
    }

    function skipMigration() {
        closeModal(true);
    }

    return {
        init, switchTab, refreshDashboard,
        openModal, closeModal, toast,
        runMigration, skipMigration, handleSessionStartIntent
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', App.init);
