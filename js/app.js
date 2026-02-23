/**
 * App - Main application controller
 */
const App = (() => {
    async function init() {
        setupTabNavigation();
        setupEventListeners();
        await checkLocalStorageMigration();
        await refreshAll();
    }

    function setupTabNavigation() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                switchTab(tab);
            });
        });
    }

    async function switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
        });

        const target = document.getElementById(`view-${tabName}`);
        document.querySelectorAll('.tab-content').forEach(content => {
            if (content === target) {
                content.classList.remove('active');
                void content.offsetWidth; // force reflow to re-trigger animation
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        switch (tabName) {
            case 'dashboard': await refreshDashboard(); break;
            case 'teams': await Teams.render(); break;
            case 'session': await Session.render(); break;
            case 'history': await History.render(); break;
        }
    }

    function setupEventListeners() {
        document.getElementById('btn-create-team').addEventListener('click', () => {
            Teams.showCreateModal();
        });

        document.getElementById('btn-new-session').addEventListener('click', () => {
            Session.showNewSessionModal();
        });

        document.getElementById('btn-add-game').addEventListener('click', () => {
            Session.showAddGameModal();
        });

        document.getElementById('btn-add-penalty').addEventListener('click', () => {
            Session.showAddPenaltyModal();
        });

        document.getElementById('btn-complete-session').addEventListener('click', () => {
            Session.completeSession();
        });

        document.getElementById('btn-go-to-session').addEventListener('click', () => {
            switchTab('session');
        });

        document.getElementById('modal-close').addEventListener('click', closeModal);
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modal-overlay')) {
                closeModal();
            }
        });

        document.getElementById('btn-export').addEventListener('click', exportData);

        document.getElementById('btn-import').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        document.getElementById('import-file').addEventListener('change', importData);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }

    async function refreshAll() {
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
            el.textContent = Math.round(from + (target - from) * eased);
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
        for (const s of sessions) {
            const full = await Store.getSession(s.id);
            totalGames += full.games.length;
        }

        animateCounter(document.getElementById('total-teams'), totalTeams);
        animateCounter(document.getElementById('total-sessions'), totalSessions);
        animateCounter(document.getElementById('total-games'), totalGames);
        animateCounter(document.getElementById('active-sessions'), totalActive);

        // Quick actions
        renderQuickActions(teams, activeSessions);

        // Active session preview
        const activeCard = document.getElementById('active-session-card');
        const activePreview = document.getElementById('active-session-preview');
        if (activeSessions.length > 0) {
            const session = await Store.getSession(activeSessions[0].id);
            activeCard.style.display = 'block';
            activePreview.innerHTML = `
                <p style="font-weight:600; margin-bottom:8px;">${escapeHtml(session.name)}</p>
                <p style="font-size:0.85rem; color:var(--text-secondary);">
                    ${session.games.length} games played • ${session.team_ids.length} teams
                </p>
            `;
        } else {
            activeCard.style.display = 'none';
        }

        await renderLeaderboard();
        await renderWinChart();
        await renderRecentResults();
    }

    function renderQuickActions(teams, activeSessions) {
        const container = document.getElementById('dashboard-quick-actions');
        const actions = [];

        if (activeSessions.length > 0) {
            actions.push(`
                <button class="quick-action-card quick-action-resume" onclick="App.switchTab('session')">
                    <span class="quick-action-icon">⚡</span>
                    <span class="quick-action-text">Resume Session</span>
                </button>
            `);
        } else {
            actions.push(`
                <button class="quick-action-card quick-action-start" onclick="App.switchTab('session'); setTimeout(() => Session.showNewSessionModal(), 100);">
                    <span class="quick-action-icon">🎮</span>
                    <span class="quick-action-text">Start Session</span>
                </button>
            `);
        }

        if (teams.length < 2) {
            actions.push(`
                <button class="quick-action-card quick-action-team" onclick="App.switchTab('teams'); setTimeout(() => Teams.showCreateModal(), 100);">
                    <span class="quick-action-icon">➕</span>
                    <span class="quick-action-text">Create Team</span>
                </button>
            `);
        }

        container.innerHTML = actions.join('');
    }

    async function renderLeaderboard() {
        const leaderboard = await Store.getAllTimeLeaderboard();
        const container = document.getElementById('leaderboard-content');

        if (leaderboard.length === 0) {
            container.innerHTML = `
                <div class="empty-state-illustrated">
                    <div class="empty-state-icon">🏅</div>
                    <h4>No Rankings Yet</h4>
                    <p>Complete a session to see your leaderboard!</p>
                    <button class="btn btn-accent btn-sm" onclick="App.switchTab('session')">Start Playing →</button>
                </div>`;
            return;
        }

        const top3 = leaderboard.slice(0, 3);
        const rest = leaderboard.slice(3, 8);

        function getInitials(name) {
            return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
        }

        const podiumOrder = [1, 0, 2];
        const podiumHeights = ['120px', '160px', '100px'];
        const trophyIcons = ['🥈', '🥇', '🥉'];
        const rankLabels = ['2nd', '1st', '3rd'];

        let podiumHtml = '<div class="podium">';
        podiumOrder.forEach((idx, pos) => {
            const entry = top3[idx];
            if (!entry) return;
            const team = Store.getTeamFromCache(entry.teamId);
            const teamName = team ? team.name : 'Unknown';
            const initials = getInitials(teamName);
            podiumHtml += `
                <div class="podium-place podium-place-${idx + 1}" style="--podium-height: ${podiumHeights[pos]}">
                    <div class="podium-trophy">${trophyIcons[pos]}</div>
                    <div class="podium-avatar podium-avatar-${idx + 1}">${escapeHtml(initials)}</div>
                    <div class="podium-name">${escapeHtml(teamName)}</div>
                    <div class="podium-score">${entry.totalPoints} pts</div>
                    <div class="podium-stats">${entry.wins}W • ${entry.sessions}S</div>
                    <div class="podium-bar"><span class="podium-rank-label">${rankLabels[pos]}</span></div>
                </div>
            `;
        });
        podiumHtml += '</div>';

        let restHtml = '';
        if (rest.length > 0) {
            restHtml = rest.map((entry, idx) => {
                const team = Store.getTeamFromCache(entry.teamId);
                const teamName = team ? team.name : 'Unknown';
                const rank = idx + 4;
                return `
                    <div class="leaderboard-entry rank-${rank}">
                        <span class="leaderboard-rank">#${rank}</span>
                        <div class="leaderboard-team">
                            <div class="leaderboard-team-name">${escapeHtml(teamName)}</div>
                            <div class="leaderboard-team-stats">${entry.wins} wins • ${entry.sessions} sessions</div>
                        </div>
                        <span class="leaderboard-score">${entry.totalPoints} pts</span>
                    </div>
                `;
            }).join('');
        }

        container.innerHTML = podiumHtml + restHtml;
    }

    async function renderWinChart() {
        const leaderboard = await Store.getAllTimeLeaderboard();
        const container = document.getElementById('chart-content');

        if (leaderboard.length === 0) {
            container.innerHTML = `
                <div class="empty-state-illustrated">
                    <div class="empty-state-icon">📊</div>
                    <h4>No Data Yet</h4>
                    <p>Play some games to see win distribution charts!</p>
                </div>`;
            return;
        }

        const maxWins = Math.max(...leaderboard.map(e => e.wins), 1);
        const barColors = ['var(--gold)', 'var(--silver)', 'var(--bronze)', 'var(--accent-start)', 'var(--accent-history)'];

        container.innerHTML = '<div class="bar-chart">' +
            leaderboard.slice(0, 8).map((entry, idx) => {
                const team = Store.getTeamFromCache(entry.teamId);
                const teamName = team ? team.name : 'Unknown';
                const pct = Math.round((entry.wins / maxWins) * 100);
                const color = barColors[idx] || 'var(--accent-start)';
                return `
                    <div class="bar-chart-row">
                        <span class="bar-chart-label">${escapeHtml(teamName)}</span>
                        <div class="bar-chart-track">
                            <div class="bar-chart-fill" style="--bar-width: ${pct}%; --bar-color: ${color}; animation-delay: ${idx * 0.1}s;"></div>
                        </div>
                        <span class="bar-chart-value">${entry.wins}</span>
                    </div>
                `;
            }).join('') +
            '</div>';

        // Trigger bar animation after render
        requestAnimationFrame(() => {
            container.querySelectorAll('.bar-chart-fill').forEach(bar => {
                bar.style.width = bar.style.getPropertyValue('--bar-width');
            });
        });
    }

    async function renderRecentResults() {
        const completed = await Store.getCompletedSessions();
        completed.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recent = completed.slice(0, 5);

        const container = document.getElementById('recent-results-content');

        if (recent.length === 0) {
            container.innerHTML = `
                <div class="empty-state-illustrated">
                    <div class="empty-state-icon">📋</div>
                    <h4>No Results Yet</h4>
                    <p>Complete your first session to see results here!</p>
                </div>`;
            return;
        }

        function getInitials(name) {
            return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
        }

        const entries = [];
        for (let i = 0; i < recent.length; i++) {
            const session = recent[i];
            const full = await Store.getSession(session.id);
            const scores = await Store.getSessionScores(session.id);
            const sorted = Object.entries(scores).sort((a, b) => b[1].total - a[1].total);
            const winnerTeam = Store.getTeamFromCache(sorted[0]?.[0]);
            const winnerName = winnerTeam ? winnerTeam.name : 'Unknown';
            const initials = getInitials(winnerName);

            entries.push(`
                <div class="recent-result" onclick="App.switchTab('history')" style="animation-delay: ${i * 0.08}s;">
                    <div class="recent-result-avatar">${escapeHtml(initials)}</div>
                    <div class="recent-result-info">
                        <span class="recent-result-name">${escapeHtml(full.name)}</span>
                        <span class="recent-result-date">${new Date(full.date).toLocaleDateString()}</span>
                    </div>
                    <span class="recent-result-games">${full.games.length} games</span>
                    <span class="recent-result-winner">🏆 ${escapeHtml(winnerName)}</span>
                </div>
            `);
        }

        container.innerHTML = entries.join('');
    }

    // --- Modal ---
    function openModal(title, bodyHtml, footerHtml) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = bodyHtml;
        document.getElementById('modal-footer').innerHTML = footerHtml;
        document.getElementById('modal-overlay').classList.add('active');

        setTimeout(() => {
            const input = document.querySelector('#modal-body .form-input');
            if (input) input.focus();
        }, 100);
    }

    function closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
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
            <button class="btn btn-accent" onclick="App.runMigration()">Migrate Data</button>
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
            closeModal();
            toast('Data migrated successfully!', 'success');
            await refreshAll();
        } catch (err) {
            toast('Migration failed: ' + err.message, 'error');
        }
    }

    function skipMigration() {
        closeModal();
    }

    return { init, switchTab, refreshDashboard, openModal, closeModal, toast, runMigration, skipMigration };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', App.init);
