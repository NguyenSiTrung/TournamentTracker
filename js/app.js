/**
 * App - Main application controller
 */
const App = (() => {
    function init() {
        setupTabNavigation();
        setupEventListeners();
        refreshAll();
    }

    function setupTabNavigation() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                switchTab(tab);
            });
        });
    }

    function switchTab(tabName) {
        // Update buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
        });

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `view-${tabName}`);
        });

        // Render the tab content
        switch (tabName) {
            case 'dashboard': refreshDashboard(); break;
            case 'teams': Teams.render(); break;
            case 'session': Session.render(); break;
            case 'history': History.render(); break;
        }
    }

    function setupEventListeners() {
        // Create team
        document.getElementById('btn-create-team').addEventListener('click', () => {
            Teams.showCreateModal();
        });

        // New session
        document.getElementById('btn-new-session').addEventListener('click', () => {
            Session.showNewSessionModal();
        });

        // Add game
        document.getElementById('btn-add-game').addEventListener('click', () => {
            Session.showAddGameModal();
        });

        // Add penalty
        document.getElementById('btn-add-penalty').addEventListener('click', () => {
            Session.showAddPenaltyModal();
        });

        // Complete session
        document.getElementById('btn-complete-session').addEventListener('click', () => {
            Session.completeSession();
        });

        // Go to session from dashboard
        document.getElementById('btn-go-to-session').addEventListener('click', () => {
            switchTab('session');
        });

        // Modal close
        document.getElementById('modal-close').addEventListener('click', closeModal);
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modal-overlay')) {
                closeModal();
            }
        });

        // Export
        document.getElementById('btn-export').addEventListener('click', exportData);

        // Import
        document.getElementById('btn-import').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        document.getElementById('import-file').addEventListener('change', importData);

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }

    function refreshAll() {
        refreshDashboard();
        Teams.render();
        Session.render();
        History.render();
    }

    function refreshDashboard() {
        const teams = Store.getTeams();
        const sessions = Store.getSessions();
        const activeSessions = Store.getActiveSessions();

        document.getElementById('total-teams').textContent = teams.length;
        document.getElementById('total-sessions').textContent = sessions.length;
        document.getElementById('total-games').textContent = Store.getTotalGamesPlayed();
        document.getElementById('active-sessions').textContent = activeSessions.length;

        // Active session preview
        const activeCard = document.getElementById('active-session-card');
        const activePreview = document.getElementById('active-session-preview');
        if (activeSessions.length > 0) {
            const session = activeSessions[0];
            const scores = Store.getSessionScores(session.id);
            activeCard.style.display = 'block';
            activePreview.innerHTML = `
                <p style="font-weight:600; margin-bottom:8px;">${escapeHtml(session.name)}</p>
                <p style="font-size:0.85rem; color:var(--text-secondary);">
                    ${session.games.length} games played • ${session.teamIds.length} teams
                </p>
            `;
        } else {
            activeCard.style.display = 'none';
        }

        // Leaderboard
        renderLeaderboard();

        // Recent results
        renderRecentResults();
    }

    function renderLeaderboard() {
        const leaderboard = Store.getAllTimeLeaderboard();
        const container = document.getElementById('leaderboard-content');

        if (leaderboard.length === 0) {
            container.innerHTML = '<p class="empty-state">No sessions completed yet. Start playing to see rankings!</p>';
            return;
        }

        container.innerHTML = leaderboard.slice(0, 5).map((entry, idx) => {
            const team = Store.getTeam(entry.teamId);
            const teamName = team ? team.name : 'Unknown';
            const rank = idx + 1;
            const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

            return `
                <div class="leaderboard-entry rank-${rank}">
                    <span class="leaderboard-rank">${rankIcon}</span>
                    <div class="leaderboard-team">
                        <div class="leaderboard-team-name">${escapeHtml(teamName)}</div>
                        <div class="leaderboard-team-stats">${entry.wins} wins • ${entry.sessions} sessions</div>
                    </div>
                    <span class="leaderboard-score">${entry.totalPoints} pts</span>
                </div>
            `;
        }).join('');
    }

    function renderRecentResults() {
        const completed = Store.getCompletedSessions()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        const container = document.getElementById('recent-results-content');

        if (completed.length === 0) {
            container.innerHTML = '<p class="empty-state">No completed sessions yet.</p>';
            return;
        }

        container.innerHTML = completed.map(session => {
            const scores = Store.getSessionScores(session.id);
            const sorted = Object.entries(scores).sort((a, b) => b[1].total - a[1].total);
            const winnerTeam = Store.getTeam(sorted[0]?.[0]);
            const winnerName = winnerTeam ? winnerTeam.name : 'Unknown';

            return `
                <div class="recent-result" onclick="App.switchTab('history')">
                    <div class="recent-result-info">
                        <span class="recent-result-name">${escapeHtml(session.name)}</span>
                        <span class="recent-result-date">${new Date(session.date).toLocaleDateString()} • ${session.games.length} games</span>
                    </div>
                    <span class="recent-result-winner">🏆 ${escapeHtml(winnerName)}</span>
                </div>
            `;
        }).join('');
    }

    // --- Modal ---
    function openModal(title, bodyHtml, footerHtml) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = bodyHtml;
        document.getElementById('modal-footer').innerHTML = footerHtml;
        document.getElementById('modal-overlay').classList.add('active');

        // Focus first input
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
    function exportData() {
        const data = Store.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tournament_tracker_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast('Data exported!', 'success');
    }

    function importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (evt) {
            try {
                Store.importData(evt.target.result);
                refreshAll();
                toast('Data imported successfully!', 'success');
            } catch (err) {
                toast('Import failed: Invalid data format', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    return { init, switchTab, refreshDashboard, openModal, closeModal, toast };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', App.init);
