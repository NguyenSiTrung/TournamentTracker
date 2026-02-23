/**
 * Session - Session & game management UI
 */
const Session = (() => {
    let currentSessionId = null;

    async function render() {
        const activeSessions = await Store.getActiveSessions();

        if (currentSessionId) {
            const session = await Store.getSession(currentSessionId);
            if (session && session.status === 'active') {
                await showActiveSession(session);
                return;
            } else {
                currentSessionId = null;
            }
        }

        // Show "no active session" view
        document.getElementById('no-active-session').style.display = 'block';
        document.getElementById('active-session-panel').style.display = 'none';

        // Show resume buttons if there are active sessions
        const resumeArea = document.getElementById('resume-session-area');
        const resumeList = document.getElementById('resume-session-list');
        if (activeSessions.length > 0) {
            resumeArea.style.display = 'block';
            resumeList.innerHTML = activeSessions.map(s => `
                <button class="btn btn-ghost btn-block resume-btn" onclick="Session.resumeSession('${s.id}')">
                    📋 ${escapeHtml(s.name)} (${new Date(s.date).toLocaleDateString()})
                </button>
            `).join('');
        } else {
            resumeArea.style.display = 'none';
        }
    }

    async function showActiveSession(session) {
        document.getElementById('no-active-session').style.display = 'none';
        document.getElementById('active-session-panel').style.display = 'block';

        const [teams, scores, allSessions] = await Promise.all([
            Store.getTeams(),
            Store.getSessionScores(session.id),
            Store.getSessions(),
        ]);

        const context = buildSessionContext(session, teams, scores, allSessions);

        renderSessionHeader(session, context);
        renderScoreboard(session, context);
        renderGamesList(session, context);
        renderPenalties(session);
    }

    function buildSessionContext(session, teams, scores, allSessions) {
        const sessionTeams = session.team_ids
            .map(tid => teams.find(t => t.id === tid))
            .filter(Boolean);

        const sortedStandings = sessionTeams
            .map(team => ({
                team,
                ...(scores[team.id] || { gamePoints: 0, penaltyPoints: 0, total: 0 }),
            }))
            .sort((a, b) => b.total - a.total);

        const penaltiesByTeam = {};
        session.penalties.forEach((penalty) => {
            penaltiesByTeam[penalty.team_id] = (penaltiesByTeam[penalty.team_id] || 0) + 1;
        });

        const orderedSessions = [...allSessions].sort((a, b) => new Date(a.date) - new Date(b.date));
        const sessionIndex = orderedSessions.findIndex(item => item.id === session.id);
        const averagePoints = sortedStandings.length > 0
            ? (sortedStandings.reduce((sum, entry) => sum + entry.total, 0) / sortedStandings.length).toFixed(1)
            : '0.0';

        return {
            sessionTeams,
            sortedStandings,
            penaltiesByTeam,
            sessionNumber: sessionIndex >= 0 ? sessionIndex + 1 : null,
            targetGames: Math.max(4, session.team_ids.length + 2),
            averagePoints,
        };
    }

    function renderSessionHeader(session, context) {
        const prettyDate = new Date(session.date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
        const leader = context.sortedStandings[0]?.team?.name || '-';

        document.getElementById('session-name-display').textContent = session.name;
        document.getElementById('session-number-display').textContent = context.sessionNumber
            ? `Session #${context.sessionNumber}`
            : 'Session';
        document.getElementById('session-date-display').textContent = prettyDate;
        document.getElementById('session-game-progress').textContent = `${session.games.length} of ${context.targetGames} games logged`;

        document.getElementById('session-total-games-stat').textContent = `${session.games.length} / ${context.targetGames}`;
        document.getElementById('session-leading-team-stat').textContent = leader;
        document.getElementById('session-avg-points-stat').textContent = context.averagePoints;
        document.getElementById('session-active-penalties-stat').textContent = String(session.penalties.length);
    }

    function renderScoreboard(session, context) {
        if (context.sortedStandings.length === 0) {
            document.getElementById('live-scoreboard').innerHTML = '<p class="empty-state">No teams in this session</p>';
            return;
        }

        const html = context.sortedStandings.map((entry, idx) => {
            const rank = idx + 1;
            const penaltiesCount = context.penaltiesByTeam[entry.team.id] || 0;
            const initials = getTeamInitials(entry.team.name);
            let noteText = `Games +${entry.gamePoints} | Pen ${formatSigned(entry.penaltyPoints)}`;
            let noteClass = 'standings-note-neutral';

            if (rank === 1 && penaltiesCount === 0) {
                noteText = 'Leader';
                noteClass = 'standings-note-positive';
            } else if (penaltiesCount > 0) {
                noteText = `-${penaltiesCount} penalty${penaltiesCount > 1 ? 'ies' : 'y'} active`;
                noteClass = 'standings-note-negative';
            }

            return `
                <article class="standings-card standings-card-rank-${rank}">
                    <span class="standings-rank-chip">${rank}</span>
                    <div class="standings-card-main">
                        <div class="standings-team-meta">
                            <span class="standings-team-avatar">${escapeHtml(initials)}</span>
                            <div>
                                <p class="standings-team-name">${escapeHtml(entry.team.name)}</p>
                                <p class="standings-team-note ${noteClass}">${escapeHtml(noteText)}</p>
                            </div>
                        </div>
                        <div class="standings-score">
                            ${entry.total}
                            <span>pts</span>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        document.getElementById('live-scoreboard').innerHTML = html;
    }

    function renderGamesList(session, context) {
        const container = document.getElementById('games-list');
        document.getElementById('game-count').textContent = `${session.games.length} game${session.games.length !== 1 ? 's' : ''}`;

        if (context.sessionTeams.length === 0) {
            container.innerHTML = '<p class="empty-state">No teams assigned to this session.</p>';
            return;
        }

        const headerCells = context.sessionTeams.map((team, idx) => `
            <th>
                <div class="matrix-team-header">
                    <span class="matrix-team-badge">${String.fromCharCode(65 + idx)}</span>
                    <span>${escapeHtml(team.name)}</span>
                </div>
            </th>
        `).join('');

        const gameRows = session.games.map((game, index) => {
            const cells = context.sessionTeams.map(team => renderMatrixTeamCell(team.id, game)).join('');
            return `
                <tr>
                    <th scope="row" class="matrix-game-label">
                        <span>Game ${index + 1}</span>
                        <button class="btn-delete-inline" onclick="Session.removeGame('${game.id}')" title="Remove game">🗑️</button>
                    </th>
                    ${cells}
                </tr>
            `;
        }).join('');

        const nextGameCells = context.sessionTeams.map(() => `
            <td>
                <button class="matrix-add-result-btn" onclick="Session.showAddGameModal()">Add Result</button>
            </td>
        `).join('');

        const subtotalCells = context.sessionTeams.map(team => {
            const entry = context.sortedStandings.find(item => item.team.id === team.id);
            const total = entry ? entry.total : 0;
            const penaltyPoints = entry ? entry.penaltyPoints : 0;
            return `
                <td>
                    <div class="matrix-subtotal-cell">
                        <strong>${total}</strong>
                        <span>${penaltyPoints !== 0 ? `Penalty ${formatSigned(penaltyPoints)}` : 'No penalties'}</span>
                    </div>
                </td>
            `;
        }).join('');

        container.innerHTML = `
            <div class="session-matrix-wrap">
                <table class="session-matrix-table">
                    <thead>
                        <tr>
                            <th class="matrix-game-col">Game</th>
                            ${headerCells}
                        </tr>
                    </thead>
                    <tbody>
                        ${gameRows || `
                            <tr>
                                <th scope="row" class="matrix-game-label">Game 1</th>
                                ${context.sessionTeams.map(() => '<td><div class="matrix-cell-empty">No result yet</div></td>').join('')}
                            </tr>
                        `}
                        <tr class="matrix-next-row">
                            <th scope="row" class="matrix-game-label">Next Game</th>
                            ${nextGameCells}
                        </tr>
                        <tr class="matrix-subtotal-row">
                            <th scope="row" class="matrix-game-label">Subtotal</th>
                            ${subtotalCells}
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderMatrixTeamCell(teamId, game) {
        const rawPlacement = game.placements[teamId];
        const placement = Number.isFinite(rawPlacement) && rawPlacement < 900 ? rawPlacement : null;
        const points = game.points[teamId] ?? 0;
        const players = (game.team_player_map && game.team_player_map[teamId]) ? game.team_player_map[teamId] : [];
        const playerBreakdown = players
            .map(playerName => ({
                placement: game.player_placements[playerName],
                points: game.player_points[playerName],
            }))
            .filter(item => item.placement !== undefined)
            .sort((a, b) => a.placement - b.placement)
            .slice(0, 2)
            .map((item, idx) => `P${idx + 1}: ${item.points}`)
            .join(' | ');

        return `
            <td>
                <div class="matrix-cell">
                    <span class="matrix-rank matrix-rank-${placement || 0}">${placement !== null ? getPositionLabel(placement) : '--'}</span>
                    <span class="matrix-points">${formatSigned(points)} pts</span>
                    <span class="matrix-player-breakdown">${escapeHtml(playerBreakdown || 'No player data')}</span>
                </div>
            </td>
        `;
    }

    function formatSigned(value) {
        if (value > 0) return `+${value}`;
        if (value < 0) return `${value}`;
        return '0';
    }

    function getTeamInitials(name) {
        return name
            .split(/\s+/)
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    function renderGameCard(game, index, showDelete) {
        const hasPlayerData = game.player_placements && Object.keys(game.player_placements).length > 0;

        let placementsHtml = '';

        if (hasPlayerData) {
            const teamSections = {};
            for (const [teamId, players] of Object.entries(game.team_player_map || {})) {
                const team = Store.getTeamFromCache(teamId);
                const teamName = team ? team.name : 'Unknown';
                const teamTotal = game.points[teamId] || 0;
                teamSections[teamId] = { teamName, teamTotal, players: [] };
                for (const pName of players) {
                    const pos = game.player_placements[pName];
                    const pts = game.player_points[pName];
                    if (pos !== undefined) {
                        teamSections[teamId].players.push({ name: pName, position: pos, points: pts });
                    }
                }
                teamSections[teamId].players.sort((a, b) => a.position - b.position);
            }

            const sortedTeams = Object.values(teamSections).sort((a, b) => b.teamTotal - a.teamTotal);

            placementsHtml = sortedTeams.map(ts => `
                <div class="team-game-section">
                    <div class="team-game-header">
                        <span class="team-game-name">${escapeHtml(ts.teamName)}</span>
                        <span class="team-game-total">Team: +${ts.teamTotal}</span>
                    </div>
                    <div class="player-placements">
                        ${ts.players.map(p => `
                            <div class="placement-row player-placement-row">
                                <span class="placement-position pos-${p.position}">${getPositionLabel(p.position)}</span>
                                <span class="placement-team">${escapeHtml(p.name)}</span>
                                <span class="placement-points">+${p.points}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        } else {
            const sortedPlacements = Object.entries(game.placements)
                .sort((a, b) => a[1] - b[1]);

            placementsHtml = sortedPlacements.map(([teamId, position]) => {
                const team = Store.getTeamFromCache(teamId);
                const teamName = team ? team.name : 'Unknown';
                const pts = game.points[teamId];
                const posLabel = getPositionLabel(position);
                return `
                    <div class="placement-row">
                        <span class="placement-position pos-${position}">${posLabel}</span>
                        <span class="placement-team">${escapeHtml(teamName)}</span>
                        <span class="placement-points">+${pts}</span>
                    </div>
                `;
            }).join('');
        }

        return `
            <div class="game-card">
                <div class="game-card-header">
                    <span class="game-card-title">🎯 Game ${index + 1}: ${escapeHtml(game.name)}</span>
                    ${showDelete ? `<button class="btn-delete-inline" onclick="Session.removeGame('${game.id}')" title="Remove game">🗑️</button>` : ''}
                </div>
                <div class="game-placements">
                    ${placementsHtml}
                </div>
            </div>
        `;
    }

    function renderPenalties(session) {
        const container = document.getElementById('penalties-list');

        if (session.penalties.length === 0) {
            container.innerHTML = '<p class="empty-state">No penalties applied.</p>';
            return;
        }

        container.innerHTML = session.penalties.map(p => {
            const team = Store.getTeamFromCache(p.team_id);
            const teamName = team ? team.name : 'Unknown';
            return `
                <div class="penalty-item penalty-item-modern">
                    <div class="penalty-info">
                        <span class="penalty-team">${escapeHtml(teamName)}</span>
                        <span class="penalty-reason">${p.reason ? `Reason: ${escapeHtml(p.reason)}` : 'Reason: Not specified'}</span>
                    </div>
                    <div class="penalty-item-actions">
                        <span class="penalty-value">${p.value} pts</span>
                        <button class="btn-delete-inline" onclick="Session.removePenalty('${p.id}')" title="Remove penalty">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function getPositionLabel(pos) {
        switch (pos) {
            case 1: return '1st';
            case 2: return '2nd';
            case 3: return '3rd';
            default: return pos + 'th';
        }
    }

    // --- Actions ---
    async function showNewSessionModal() {
        const teams = await Store.getTeams();
        if (teams.length < 2) {
            App.toast('You need at least 2 teams to create a session. Go to Teams tab first!', 'error');
            return;
        }

        const body = `
            <div class="form-group">
                <label class="form-label">Session Name</label>
                <input class="form-input" id="session-name-input" placeholder="e.g., Friday Night Games" autofocus>
            </div>
            <div class="form-group">
                <label class="form-label">Select Teams (at least 2)</label>
                <div class="form-checkbox-group" id="session-teams-checkboxes">
                    ${teams.map(t => `
                        <label class="form-checkbox-label">
                            <input type="checkbox" value="${t.id}">
                            <span>${escapeHtml(t.name)}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
        const footer = `
            <button class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-accent" onclick="Session.createNewSession()">Start Session</button>
        `;
        App.openModal('New Session', body, footer);
    }

    async function createNewSession() {
        const name = document.getElementById('session-name-input').value.trim();
        if (!name) {
            App.toast('Please enter a session name', 'error');
            return;
        }

        const checkboxes = document.querySelectorAll('#session-teams-checkboxes input[type="checkbox"]:checked');
        const teamIds = Array.from(checkboxes).map(cb => cb.value);

        if (teamIds.length < 2) {
            App.toast('Please select at least 2 teams', 'error');
            return;
        }

        const session = await Store.createSession(name, teamIds);
        currentSessionId = session.id;
        App.closeModal();
        await render();
        await App.refreshDashboard();
        App.toast('Session started!', 'success');
    }

    async function resumeSession(id) {
        currentSessionId = id;
        await render();
    }

    async function showEditSessionModal() {
        const session = await Store.getSession(currentSessionId);
        if (!session) return;

        const body = `
            <div class="form-group">
                <label class="form-label">Session Name</label>
                <input class="form-input" id="session-name-edit-input" value="${escapeHtml(session.name)}" autofocus>
            </div>
        `;
        const footer = `
            <button class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-accent" onclick="Session.saveSessionDetails()">Save Changes</button>
        `;

        App.openModal('Edit Session Details', body, footer);
    }

    async function saveSessionDetails() {
        const name = document.getElementById('session-name-edit-input').value.trim();
        if (!name) {
            App.toast('Please enter a session name', 'error');
            return;
        }

        await Store.updateSession(currentSessionId, { name });
        App.closeModal();
        await render();
        await App.refreshDashboard();
        App.toast('Session details updated', 'success');
    }

    async function showAddGameModal() {
        const session = await Store.getSession(currentSessionId);
        if (!session) return;

        const teams = await Store.getTeams();
        const sessionTeams = session.team_ids.map(tid => teams.find(t => t.id === tid)).filter(Boolean);
        const gameNum = session.games.length + 1;

        const allPlayers = [];
        sessionTeams.forEach(t => {
            t.players.forEach(pName => {
                allPlayers.push({ teamId: t.id, teamName: t.name, playerName: pName });
            });
        });

        const totalPlayers = allPlayers.length;

        const body = `
            <div class="form-group">
                <label class="form-label">Game Name</label>
                <input class="form-input" id="game-name-input" value="Game ${gameNum}" placeholder="e.g., Round 1">
            </div>
            <div class="form-group">
                <label class="form-label">Assign Player Placements</label>
                <p class="text-muted" style="font-size:0.78rem;margin-bottom:10px;">Rank each player individually. Team score = sum of player scores.</p>
                ${sessionTeams.map(t => `
                    <div class="player-placement-group">
                        <div class="player-placement-group-header">${escapeHtml(t.name)}</div>
                        ${t.players.map(pName => {
            return `
                                <div class="placement-form-row">
                                    <span class="placement-team-label">${escapeHtml(pName)}</span>
                                    <div class="placement-select-wrapper">
                                        <select class="form-select player-placement-select"
                                                data-team-id="${t.id}"
                                                data-player-name="${escapeHtml(pName)}">
                                            <option value="">Select...</option>
                                            ${Array.from({ length: totalPlayers }, (_, i) => i + 1).map(pos =>
                `<option value="${pos}">${getPositionLabel(pos)} (+${Store.calculatePoints(pos, totalPlayers)}pts)</option>`
            ).join('')}
                                        </select>
                                    </div>
                                </div>
                            `;
        }).join('')}
                    </div>
                `).join('')}
            </div>
        `;
        const footer = `
            <button class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-accent" onclick="Session.saveGame()">Save Game</button>
        `;
        App.openModal('Add Game', body, footer);
    }

    async function saveGame() {
        const name = document.getElementById('game-name-input').value.trim();
        if (!name) {
            App.toast('Please enter a game name', 'error');
            return;
        }

        const selects = document.querySelectorAll('.player-placement-select');
        const playerPlacements = {};
        const teamPlayerMap = {};
        const usedPositions = new Set();
        let allFilled = true;

        selects.forEach(sel => {
            const teamId = sel.getAttribute('data-team-id');
            const playerName = sel.getAttribute('data-player-name');
            const pos = parseInt(sel.value);

            if (!teamPlayerMap[teamId]) {
                teamPlayerMap[teamId] = [];
            }
            teamPlayerMap[teamId].push(playerName);

            if (!pos) {
                allFilled = false;
            } else {
                if (usedPositions.has(pos)) {
                    allFilled = false;
                }
                usedPositions.add(pos);
                playerPlacements[playerName] = pos;
            }
        });

        if (!allFilled || Object.keys(playerPlacements).length !== selects.length) {
            App.toast('Please assign a unique placement for each player', 'error');
            return;
        }

        await Store.addGame(currentSessionId, name, playerPlacements, teamPlayerMap);
        App.closeModal();
        await render();
        await App.refreshDashboard();
        App.toast('Game added!', 'success');
    }

    async function removeGame(gameId) {
        await Store.removeGame(currentSessionId, gameId);
        await render();
        await App.refreshDashboard();
        App.toast('Game removed', 'info');
    }

    async function showAddPenaltyModal() {
        const session = await Store.getSession(currentSessionId);
        if (!session) return;

        const teams = await Store.getTeams();
        const sessionTeams = session.team_ids.map(tid => teams.find(t => t.id === tid)).filter(Boolean);

        const body = `
            <div class="form-group">
                <label class="form-label">Team</label>
                <select class="form-select" id="penalty-team-select">
                    <option value="">Select team...</option>
                    ${sessionTeams.map(t => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Penalty Points</label>
                <select class="form-select" id="penalty-value-select">
                    <option value="-2">-2 points</option>
                    <option value="-4">-4 points</option>
                    <option value="-6">-6 points</option>
                </select>
                <div class="mt-8">
                    <label class="form-label">Or custom value</label>
                    <input class="form-input" id="penalty-custom-input" type="number" placeholder="e.g., -3" max="0">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Reason (optional)</label>
                <input class="form-input" id="penalty-reason-input" placeholder="e.g., Rule violation">
            </div>
        `;
        const footer = `
            <button class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-danger" onclick="Session.savePenalty()">Apply Penalty</button>
        `;
        App.openModal('Add Penalty', body, footer);
    }

    async function savePenalty() {
        const teamId = document.getElementById('penalty-team-select').value;
        if (!teamId) {
            App.toast('Please select a team', 'error');
            return;
        }

        const customVal = document.getElementById('penalty-custom-input').value;
        let penaltyValue;
        if (customVal) {
            penaltyValue = parseInt(customVal);
            if (isNaN(penaltyValue) || penaltyValue > 0) {
                App.toast('Penalty must be a negative number', 'error');
                return;
            }
        } else {
            penaltyValue = parseInt(document.getElementById('penalty-value-select').value);
        }

        const reason = document.getElementById('penalty-reason-input').value.trim();

        await Store.addPenalty(currentSessionId, teamId, penaltyValue, reason);
        App.closeModal();
        await render();
        await App.refreshDashboard();
        App.toast('Penalty applied!', 'info');
    }

    async function removePenalty(penaltyId) {
        await Store.removePenalty(currentSessionId, penaltyId);
        await render();
        await App.refreshDashboard();
        App.toast('Penalty removed', 'info');
    }

    async function completeSession() {
        const session = await Store.getSession(currentSessionId);
        if (!session) return;

        const scores = await Store.getSessionScores(currentSessionId);
        const sorted = Object.entries(scores).sort((a, b) => b[1].total - a[1].total);
        const winnerTeam = Store.getTeamFromCache(sorted[0]?.[0]);
        const winnerName = winnerTeam ? winnerTeam.name : 'Unknown';

        const body = `
            <p>Complete session <strong>${escapeHtml(session.name)}</strong>?</p>
            <p class="mt-8">🏆 Winner: <strong class="text-gold">${escapeHtml(winnerName)}</strong></p>
            <p class="text-muted mt-8" style="font-size: 0.85rem;">This will lock all results and move the session to history.</p>
        `;
        const footer = `
            <button class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-accent" onclick="Session.confirmComplete()">Complete Session</button>
        `;
        App.openModal('Complete Session', body, footer);
    }

    async function confirmComplete() {
        await Store.updateSession(currentSessionId, { status: 'completed' });
        currentSessionId = null;
        App.closeModal();
        await render();
        await App.refreshDashboard();
        await History.render();
        App.toast('Session completed! 🏆', 'success');
    }

    function getCurrentSessionId() {
        return currentSessionId;
    }

    return {
        render, showNewSessionModal, createNewSession, resumeSession,
        showEditSessionModal, saveSessionDetails,
        showAddGameModal, saveGame, removeGame,
        showAddPenaltyModal, savePenalty, removePenalty,
        completeSession, confirmComplete, getCurrentSessionId,
        renderGameCard, getPositionLabel
    };
})();
