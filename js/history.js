/**
 * History - Session history & summary UI
 */
const History = (() => {
    async function render() {
        await renderOverallStats();
        await renderSessionList();
    }

    async function renderOverallStats() {
        const leaderboard = await Store.getAllTimeLeaderboard();
        const container = document.getElementById('overall-stats-content');

        if (leaderboard.length === 0) {
            container.innerHTML = `
                <div class="empty-state-hero-card">
                    <div class="empty-state-hero">
                        <svg class="empty-state-hero__svg-illustration" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <!-- Clock face -->
                            <circle cx="90" cy="80" r="45" fill="#132218" stroke="#4caf50" stroke-width="2"/>
                            <circle cx="90" cy="80" r="40" fill="none" stroke="#2e7d32" stroke-width="1" opacity="0.3"/>
                            <!-- Clock hands -->
                            <line x1="90" y1="80" x2="90" y2="52" stroke="#4caf50" stroke-width="2.5" stroke-linecap="round"/>
                            <line x1="90" y1="80" x2="110" y2="75" stroke="#00c853" stroke-width="2" stroke-linecap="round"/>
                            <circle cx="90" cy="80" r="3" fill="#ffd700" opacity="0.8"/>
                            <!-- Hour markers -->
                            <circle cx="90" cy="42" r="2" fill="#4caf50" opacity="0.5"/>
                            <circle cx="128" cy="80" r="2" fill="#4caf50" opacity="0.5"/>
                            <circle cx="90" cy="118" r="2" fill="#4caf50" opacity="0.5"/>
                            <circle cx="52" cy="80" r="2" fill="#4caf50" opacity="0.5"/>
                            <!-- Chart bars below -->
                            <rect x="40" y="140" width="16" height="28" rx="3" fill="#2e7d32" opacity="0.4"/>
                            <rect x="62" y="148" width="16" height="20" rx="3" fill="#4caf50" opacity="0.35"/>
                            <rect x="84" y="135" width="16" height="33" rx="3" fill="#00c853" opacity="0.45"/>
                            <rect x="106" y="142" width="16" height="26" rx="3" fill="#4caf50" opacity="0.35"/>
                            <rect x="128" y="150" width="16" height="18" rx="3" fill="#2e7d32" opacity="0.3"/>
                            <!-- Sparkles -->
                            <circle cx="35" cy="45" r="2" fill="#ffd700" opacity="0.5"/>
                            <circle cx="148" cy="50" r="2.5" fill="#ffd700" opacity="0.4"/>
                            <circle cx="155" cy="135" r="1.8" fill="#4caf50" opacity="0.3"/>
                        </svg>
                        <h3 class="empty-state-hero__title">No History Yet</h3>
                        <p class="empty-state-hero__subtitle">Complete sessions to build your tournament history and statistics.</p>
                        <button class="empty-state-hero__cta" data-switch-tab="session" id="cta-go-sessions-stats">Go to Sessions</button>
                    </div>
                </div>`;
            return;
        }

        let html = `
            <table class="stats-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Team</th>
                        <th>Wins</th>
                        <th>Sessions</th>
                        <th>Total Pts</th>
                        <th>Avg/Session</th>
                    </tr>
                </thead>
                <tbody>
        `;

        leaderboard.forEach((entry, idx) => {
            const team = Store.getTeamFromCache(entry.teamId);
            const teamName = team ? team.name : 'Unknown';
            const avg = entry.sessions > 0 ? (entry.totalPoints / entry.sessions).toFixed(1) : '0';
            const rank = idx + 1;
            const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`;

            html += `
                <tr>
                    <td class="fw-bold">${rankIcon}</td>
                    <td class="fw-bold">${escapeHtml(teamName)}</td>
                    <td class="text-gold fw-bold">${entry.wins}</td>
                    <td>${entry.sessions}</td>
                    <td class="fw-extra">${entry.totalPoints}</td>
                    <td class="text-muted">${avg}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    async function renderSessionList() {
        const completed = await Store.getCompletedSessions();
        completed.sort((a, b) => new Date(b.date) - new Date(a.date));
        const container = document.getElementById('history-list');

        if (completed.length === 0) {
            container.innerHTML = `
                <div class="empty-state-hero-card">
                    <div class="empty-state-hero">
                        <svg class="empty-state-hero__svg-illustration" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <!-- Clock face -->
                            <circle cx="90" cy="80" r="45" fill="#132218" stroke="#4caf50" stroke-width="2"/>
                            <circle cx="90" cy="80" r="40" fill="none" stroke="#2e7d32" stroke-width="1" opacity="0.3"/>
                            <!-- Clock hands -->
                            <line x1="90" y1="80" x2="90" y2="52" stroke="#4caf50" stroke-width="2.5" stroke-linecap="round"/>
                            <line x1="90" y1="80" x2="110" y2="75" stroke="#00c853" stroke-width="2" stroke-linecap="round"/>
                            <circle cx="90" cy="80" r="3" fill="#ffd700" opacity="0.8"/>
                            <!-- Hour markers -->
                            <circle cx="90" cy="42" r="2" fill="#4caf50" opacity="0.5"/>
                            <circle cx="128" cy="80" r="2" fill="#4caf50" opacity="0.5"/>
                            <circle cx="90" cy="118" r="2" fill="#4caf50" opacity="0.5"/>
                            <circle cx="52" cy="80" r="2" fill="#4caf50" opacity="0.5"/>
                            <!-- Chart bars below -->
                            <rect x="40" y="140" width="16" height="28" rx="3" fill="#2e7d32" opacity="0.4"/>
                            <rect x="62" y="148" width="16" height="20" rx="3" fill="#4caf50" opacity="0.35"/>
                            <rect x="84" y="135" width="16" height="33" rx="3" fill="#00c853" opacity="0.45"/>
                            <rect x="106" y="142" width="16" height="26" rx="3" fill="#4caf50" opacity="0.35"/>
                            <rect x="128" y="150" width="16" height="18" rx="3" fill="#2e7d32" opacity="0.3"/>
                            <!-- Sparkles -->
                            <circle cx="35" cy="45" r="2" fill="#ffd700" opacity="0.5"/>
                            <circle cx="148" cy="50" r="2.5" fill="#ffd700" opacity="0.4"/>
                            <circle cx="155" cy="135" r="1.8" fill="#4caf50" opacity="0.3"/>
                        </svg>
                        <h3 class="empty-state-hero__title">No Sessions Completed</h3>
                        <p class="empty-state-hero__subtitle">Complete a session to see detailed results and game history here.</p>
                        <button class="empty-state-hero__cta" data-switch-tab="session" id="cta-go-sessions-history">Go to Sessions</button>
                    </div>
                </div>`;
            return;
        }

        // Fetch full session data for each completed session
        const sessionsWithDetails = [];
        for (const s of completed) {
            const full = await Store.getSession(s.id);
            const scores = await Store.getSessionScores(s.id);
            sessionsWithDetails.push({ session: full, scores });
        }

        container.innerHTML = sessionsWithDetails.map(({ session, scores }) => {
            const sorted = Object.entries(scores).sort((a, b) => b[1].total - a[1].total);
            const winnerTeam = Store.getTeamFromCache(sorted[0]?.[0]);
            const winnerName = winnerTeam ? winnerTeam.name : 'Unknown';
            const gameCount = session.games.length;
            const teamCount = session.team_ids.length;

            return `
                <div class="history-session-card" data-session-id="${session.id}">
                    <div class="history-session-header" onclick="History.toggleSession('${session.id}')">
                        <div class="history-session-info">
                            <h4>${escapeHtml(session.name)}</h4>
                            <div class="history-session-meta">
                                <span>📅 ${new Date(session.date).toLocaleDateString()}</span>
                                <span>👥 ${teamCount} teams</span>
                                <span>🎯 ${gameCount} games</span>
                            </div>
                        </div>
                        <div style="display:flex;align-items:center;gap:16px;">
                            <div class="history-session-winner">
                                <span class="trophy">🏆</span>
                                <span class="text-gold">${escapeHtml(winnerName)}</span>
                            </div>
                            <span class="expand-icon">▼</span>
                        </div>
                    </div>
                    <div class="history-session-detail" id="detail-${session.id}">
                        ${renderSessionDetail(session, scores, sorted)}
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderSessionDetail(session, scores, sorted) {
        let html = '';

        // Final Standings
        html += '<h4 class="mb-8 mt-16">📊 Final Standings</h4>';
        html += `
            <table class="scoreboard-table mb-16">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Team</th>
                        <th style="text-align:right">Games</th>
                        <th style="text-align:right">Penalty</th>
                        <th style="text-align:right">Total</th>
                    </tr>
                </thead>
                <tbody>
        `;

        sorted.forEach(([teamId, score], idx) => {
            const team = Store.getTeamFromCache(teamId);
            const teamName = team ? team.name : 'Unknown';
            const rank = idx + 1;
            const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`;

            html += `
                <tr class="scoreboard-row">
                    <td class="scoreboard-rank">${rankIcon}</td>
                    <td class="scoreboard-team-name">${escapeHtml(teamName)}</td>
                    <td class="scoreboard-points">${score.gamePoints}</td>
                    <td class="scoreboard-penalty">${score.penaltyPoints < 0 ? score.penaltyPoints : score.penaltyPoints === 0 ? '-' : '+' + score.penaltyPoints}</td>
                    <td class="scoreboard-total">${score.total}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';

        // Game Details
        if (session.games.length > 0) {
            html += '<h4 class="mb-8">🎯 Game Details</h4>';
            session.games.forEach((game, index) => {
                html += Session.renderGameCard(game, index, false);
            });
        }

        // Penalties
        if (session.penalties.length > 0) {
            html += '<h4 class="mb-8 mt-16">⚠️ Penalties</h4>';
            session.penalties.forEach(p => {
                const team = Store.getTeamFromCache(p.team_id);
                const teamName = team ? team.name : 'Unknown';
                html += `
                    <div class="penalty-item">
                        <div class="penalty-info">
                            <span class="penalty-team">${escapeHtml(teamName)}</span>
                            ${p.reason ? `<span class="penalty-reason">— ${escapeHtml(p.reason)}</span>` : ''}
                        </div>
                        <span class="penalty-value">${p.value}</span>
                    </div>
                `;
            });
        }

        return html;
    }

    function toggleSession(id) {
        const card = document.querySelector(`.history-session-card[data-session-id="${id}"]`);
        if (card) {
            card.classList.toggle('expanded');
        }
    }

    return { render, toggleSession };
})();
