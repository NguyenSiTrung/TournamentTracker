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
            .map(playerName => {
                const compositeKey = `${teamId}::${playerName}`;
                return {
                    placement: game.player_placements[compositeKey] ?? game.player_placements[playerName],
                    points: game.player_points[compositeKey] ?? game.player_points[playerName],
                };
            })
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
                    const compositeKey = `${teamId}::${pName}`;
                    const pos = game.player_placements[compositeKey] ?? game.player_placements[pName];
                    const pts = game.player_points[compositeKey] ?? game.player_points[pName];
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

    function getOrdinalLabel(value) {
        const num = Number(value);
        if (!Number.isFinite(num)) return String(value);

        const absNum = Math.abs(num);
        const mod100 = absNum % 100;
        if (mod100 >= 11 && mod100 <= 13) {
            return `${num}th`;
        }

        switch (absNum % 10) {
            case 1: return `${num}st`;
            case 2: return `${num}nd`;
            case 3: return `${num}rd`;
            default: return `${num}th`;
        }
    }

    function getPositionLabel(pos) {
        return getOrdinalLabel(pos);
    }

    function computeAddGameLiveTotals(selects, totalPlayers) {
        const teamTotals = {};
        const playerPreviewPoints = {};
        const usedPlacements = new Set();
        let filledCount = 0;
        let hasDuplicatePlacements = false;

        selects.forEach((selectEl) => {
            const teamId = selectEl.getAttribute('data-team-id');
            const previewId = selectEl.getAttribute('data-preview-id');
            if (teamId && !Object.prototype.hasOwnProperty.call(teamTotals, teamId)) {
                teamTotals[teamId] = 0;
            }

            const placement = parseInt(selectEl.value, 10);
            if (!Number.isInteger(placement)) {
                if (previewId) {
                    playerPreviewPoints[previewId] = 0;
                }
                return;
            }

            filledCount += 1;
            if (usedPlacements.has(placement)) {
                hasDuplicatePlacements = true;
            } else {
                usedPlacements.add(placement);
            }

            const points = Store.calculatePoints(placement, totalPlayers);
            if (teamId) {
                teamTotals[teamId] = (teamTotals[teamId] || 0) + points;
            }
            if (previewId) {
                playerPreviewPoints[previewId] = points;
            }
        });

        return {
            teamTotals,
            playerPreviewPoints,
            filledCount,
            hasDuplicatePlacements,
            allPlacementsComplete: selects.length > 0 && filledCount === selects.length,
        };
    }

    function resolveAddGameWinnerTeamId(teamTotals, allPlacementsComplete, hasDuplicatePlacements) {
        if (!allPlacementsComplete || hasDuplicatePlacements) {
            return null;
        }

        const entries = Object.entries(teamTotals);
        if (entries.length === 0) {
            return null;
        }

        let topScore = Number.NEGATIVE_INFINITY;
        let topTeamIds = [];
        entries.forEach(([teamId, total]) => {
            if (total > topScore) {
                topScore = total;
                topTeamIds = [teamId];
            } else if (total === topScore) {
                topTeamIds.push(teamId);
            }
        });

        return topTeamIds.length === 1 ? topTeamIds[0] : null;
    }

    function updateAddGameLiveScoreboard(totalPlayers) {
        const selects = Array.from(document.querySelectorAll('.player-placement-select'));
        if (selects.length === 0) {
            return;
        }

        const liveTotals = computeAddGameLiveTotals(selects, totalPlayers);
        const winnerTeamId = resolveAddGameWinnerTeamId(
            liveTotals.teamTotals,
            liveTotals.allPlacementsComplete,
            liveTotals.hasDuplicatePlacements
        );

        document.querySelectorAll('[data-preview-id-ref]').forEach((previewEl) => {
            const previewId = previewEl.getAttribute('data-preview-id-ref');
            const points = previewId ? (liveTotals.playerPreviewPoints[previewId] || 0) : 0;
            previewEl.textContent = `${points > 0 ? `+${points}` : points} pts`;
        });

        document.querySelectorAll('[data-live-team-total]').forEach((totalEl) => {
            const teamId = totalEl.getAttribute('data-live-team-total');
            const total = teamId ? (liveTotals.teamTotals[teamId] || 0) : 0;
            totalEl.textContent = `${total} pts`;
        });

        document.querySelectorAll('[data-live-team-card]').forEach((cardEl) => {
            const teamId = cardEl.getAttribute('data-live-team-card');
            const isWinner = Boolean(teamId && winnerTeamId === teamId);
            cardEl.classList.toggle('is-winner', isWinner);

            const badgeEl = cardEl.querySelector('[data-live-team-winner]');
            if (badgeEl) {
                badgeEl.hidden = !isWinner;
            }
        });

        const statusEl = document.getElementById('add-game-live-status');
        if (!statusEl) return;

        if (liveTotals.hasDuplicatePlacements) {
            statusEl.textContent = 'Placements must be unique across all players.';
            return;
        }

        if (!liveTotals.allPlacementsComplete) {
            statusEl.textContent = `${liveTotals.filledCount}/${selects.length} placements assigned.`;
            return;
        }

        if (!winnerTeamId) {
            statusEl.textContent = 'Top teams are tied. No winner highlight yet.';
            return;
        }

        statusEl.textContent = 'Winner locked in for this game.';
    }

    function updateAddGamePenaltyFieldsState() {
        const penaltyToggle = document.getElementById('add-game-penalty-toggle');
        const enabled = Boolean(penaltyToggle && penaltyToggle.checked);

        document.querySelectorAll('.add-game-penalty-input').forEach((inputEl) => {
            inputEl.disabled = !enabled;
        });

        const fieldsWrap = document.getElementById('add-game-penalty-fields');
        if (fieldsWrap) {
            fieldsWrap.classList.toggle('is-active', enabled);
            fieldsWrap.hidden = !enabled;
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

        const totalPlayers = sessionTeams.reduce((count, team) => count + team.players.length, 0);

        const body = `
            <div class="add-game-modal">
                <section class="add-game-intro">
                    <div class="add-game-intro-main">
                        <p class="add-game-intro-kicker">Game Result</p>
                        <h4 class="add-game-intro-title">Log game ${gameNum}</h4>
                        <p class="add-game-intro-subtitle">Rank every player once. Team totals and winner preview update live.</p>
                    </div>
                    <div class="add-game-intro-meta">
                        <span class="add-game-meta-pill">${sessionTeams.length} Team${sessionTeams.length !== 1 ? 's' : ''}</span>
                        <span class="add-game-meta-pill">${totalPlayers} Player${totalPlayers !== 1 ? 's' : ''}</span>
                    </div>
                </section>

                <div class="form-group">
                    <label class="form-label" for="game-name-input">Game Name</label>
                    <input class="form-input" id="game-name-input" value="Game ${gameNum}" placeholder="e.g., Round 1">
                </div>

                <p class="add-game-live-status" id="add-game-live-status">0/${totalPlayers} placements assigned.</p>

                <section class="add-game-team-grid">
                    ${sessionTeams.map((team, teamIdx) => `
                        <article class="add-game-team-card" data-live-team-card="${team.id}">
                            <header class="add-game-team-card-header">
                                <div class="add-game-team-identity">
                                    <span class="add-game-team-badge">${escapeHtml(getTeamInitials(team.name) || String.fromCharCode(65 + teamIdx))}</span>
                                    <div>
                                        <p class="add-game-team-name">${escapeHtml(team.name)}</p>
                                        <p class="add-game-team-meta">${team.players.length} player${team.players.length !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                <div class="add-game-team-points-wrap">
                                    <span class="add-game-winner-badge" data-live-team-winner hidden>Winner</span>
                                    <strong class="add-game-team-total" data-live-team-total="${team.id}">0 pts</strong>
                                </div>
                            </header>
                            <div class="add-game-team-players">
                                ${team.players.map((playerName, playerIdx) => {
            const previewId = `add-game-preview-${teamIdx}-${playerIdx}`;
            return `
                                    <div class="add-game-player-row">
                                        <label class="add-game-player-name">${escapeHtml(playerName)}</label>
                                        <div class="add-game-player-controls">
                                            <select class="form-select player-placement-select"
                                                    data-team-id="${team.id}"
                                                    data-player-name="${escapeHtml(playerName)}"
                                                    data-preview-id="${previewId}">
                                                <option value="">Select rank...</option>
                                                ${Array.from({ length: totalPlayers }, (_, i) => i + 1).map(pos =>
                `<option value="${pos}">${getOrdinalLabel(pos)} (+${Store.calculatePoints(pos, totalPlayers)} pts)</option>`
            ).join('')}
                                            </select>
                                            <span class="add-game-player-points" data-preview-id-ref="${previewId}">0 pts</span>
                                        </div>
                                    </div>
                                `;
        }).join('')}
                            </div>
                        </article>
                    `).join('')}
                </section>

                <section class="add-game-penalty-panel">
                    <label class="add-game-penalty-toggle">
                        <input type="checkbox" id="add-game-penalty-toggle">
                        <span>Apply penalty to this game</span>
                    </label>
                    <div class="add-game-penalty-fields" id="add-game-penalty-fields" hidden>
                        <div class="form-group">
                            <label class="form-label" for="add-game-penalty-team">Team</label>
                            <select class="form-select add-game-penalty-input" id="add-game-penalty-team" disabled>
                                <option value="">Select team...</option>
                                ${sessionTeams.map(team => `<option value="${team.id}">${escapeHtml(team.name)}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="add-game-penalty-reason">Reason (optional)</label>
                            <input class="form-input add-game-penalty-input" id="add-game-penalty-reason" placeholder="e.g., Rule violation" disabled>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="add-game-penalty-value">Point deduction</label>
                            <input class="form-input add-game-penalty-input" id="add-game-penalty-value" type="number" min="1" step="1" placeholder="e.g., 2" disabled>
                        </div>
                    </div>
                </section>
            </div>
        `;
        const footer = `
            <button class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-accent" onclick="Session.saveGame()">Save Game Result</button>
        `;
        App.openModal(`Game ${gameNum} Result`, body, footer, { modalClass: 'modal-game-result' });

        document.querySelectorAll('.player-placement-select').forEach((selectEl) => {
            selectEl.addEventListener('change', () => {
                updateAddGameLiveScoreboard(totalPlayers);
            });
        });

        const penaltyToggle = document.getElementById('add-game-penalty-toggle');
        if (penaltyToggle) {
            penaltyToggle.addEventListener('change', updateAddGamePenaltyFieldsState);
        }

        updateAddGamePenaltyFieldsState();
        updateAddGameLiveScoreboard(totalPlayers);
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

        selects.forEach((sel) => {
            const teamId = sel.getAttribute('data-team-id');
            const playerName = sel.getAttribute('data-player-name');
            const pos = parseInt(sel.value, 10);

            if (!teamPlayerMap[teamId]) {
                teamPlayerMap[teamId] = [];
            }
            teamPlayerMap[teamId].push(playerName);

            if (!Number.isInteger(pos)) {
                allFilled = false;
            } else {
                if (usedPositions.has(pos)) {
                    allFilled = false;
                }
                usedPositions.add(pos);
                playerPlacements[`${teamId}::${playerName}`] = pos;
            }
        });

        if (!allFilled || Object.keys(playerPlacements).length !== selects.length) {
            App.toast('Please assign a unique placement for each player', 'error');
            return;
        }

        const penaltyEnabled = Boolean(document.getElementById('add-game-penalty-toggle')?.checked);
        let penaltyTeamId = '';
        let penaltyValue = 0;
        let penaltyReason = '';

        if (penaltyEnabled) {
            penaltyTeamId = document.getElementById('add-game-penalty-team').value;
            penaltyReason = document.getElementById('add-game-penalty-reason').value.trim();
            const rawPenaltyValue = parseInt(document.getElementById('add-game-penalty-value').value, 10);

            if (!penaltyTeamId) {
                App.toast('Select a team for the penalty', 'error');
                return;
            }

            if (!Number.isInteger(rawPenaltyValue) || rawPenaltyValue <= 0) {
                App.toast('Penalty deduction must be a positive number', 'error');
                return;
            }

            penaltyValue = -Math.abs(rawPenaltyValue);
        }

        await Store.addGame(currentSessionId, name, playerPlacements, teamPlayerMap);

        if (penaltyEnabled && penaltyTeamId && penaltyValue < 0) {
            await Store.addPenalty(currentSessionId, penaltyTeamId, penaltyValue, penaltyReason);
        }

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
