/**
 * App - Main application controller
 */
const App = (() => {
    async function init() {
        setupSidebarNavigation();
        setupEventListeners();
        await checkLocalStorageMigration();
        await refreshAll();
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
        if (toggle) {
            toggle.addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('open');
            });
        }

        // Close sidebar on main area click (mobile)
        document.querySelector('.main-area').addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('open');
        });
    }

    async function switchTab(tabName) {
        // Update sidebar active state
        document.querySelectorAll('.sidebar-nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
        });

        // Show target view
        const target = document.getElementById(`view-${tabName}`);
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

        document.getElementById('btn-start-session-hero').addEventListener('click', () => {
            Session.showNewSessionModal();
        });

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

    async function renderLeaderboard() {
        const leaderboard = await Store.getAllTimeLeaderboard();
        const container = document.getElementById('leaderboard-content');

        if (leaderboard.length === 0) {
            container.innerHTML = `
                <div class="empty-state-illustrated">
                    <div class="empty-state-icon">🏅</div>
                    <h4>No Rankings Yet</h4>
                    <p>Complete a session to see your leaderboard!</p>
                    <button class="btn btn-primary btn-sm" onclick="App.switchTab('session')">Start Playing →</button>
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
        const recent = allSessions.slice(0, 6);

        const tbody = document.getElementById('recent-sessions-body');
        const viewAll = document.getElementById('sessions-view-all');

        if (recent.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No sessions yet. Start a new session!</td></tr>';
            viewAll.style.display = 'none';
            return;
        }

        const rows = [];
        for (let i = 0; i < recent.length; i++) {
            const session = recent[i];
            const full = await Store.getSession(session.id);
            const sessionNum = allSessions.length - allSessions.indexOf(session);
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

        if (allSessions.length > 6) {
            viewAll.style.display = 'block';
        } else {
            viewAll.style.display = allSessions.length > 0 ? 'block' : 'none';
        }

        // Update "View all X sessions" text
        const viewAllBtn = viewAll.querySelector('.panel-action-link');
        if (viewAllBtn) {
            viewAllBtn.textContent = `View all ${allSessions.length} sessions`;
        }
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
