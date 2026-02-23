/**
 * Store - Data persistence layer using localStorage
 */
const Store = (() => {
    const STORAGE_KEY = 'tournament_tracker_data';

    function getAll() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return { teams: [], sessions: [] };
        }
        try {
            return JSON.parse(raw);
        } catch {
            return { teams: [], sessions: [] };
        }
    }

    function saveAll(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    }

    // --- Teams ---
    function getTeams() {
        return getAll().teams;
    }

    function getTeam(id) {
        return getTeams().find(t => t.id === id);
    }

    function createTeam(name, players) {
        const data = getAll();
        const team = {
            id: generateId(),
            name: name.trim(),
            players: players.map(p => p.trim()).filter(p => p),
            createdAt: new Date().toISOString()
        };
        data.teams.push(team);
        saveAll(data);
        return team;
    }

    function updateTeam(id, name, players) {
        const data = getAll();
        const idx = data.teams.findIndex(t => t.id === id);
        if (idx === -1) return null;
        data.teams[idx].name = name.trim();
        data.teams[idx].players = players.map(p => p.trim()).filter(p => p);
        saveAll(data);
        return data.teams[idx];
    }

    function deleteTeam(id) {
        const data = getAll();
        data.teams = data.teams.filter(t => t.id !== id);
        saveAll(data);
    }

    // --- Sessions ---
    function getSessions() {
        return getAll().sessions;
    }

    function getSession(id) {
        return getSessions().find(s => s.id === id);
    }

    function getActiveSessions() {
        return getSessions().filter(s => s.status === 'active');
    }

    function getCompletedSessions() {
        return getSessions().filter(s => s.status === 'completed');
    }

    function createSession(name, teamIds) {
        const data = getAll();
        const session = {
            id: generateId(),
            name: name.trim(),
            date: new Date().toISOString(),
            teamIds: teamIds,
            games: [],
            penalties: [],
            status: 'active'
        };
        data.sessions.push(session);
        saveAll(data);
        return session;
    }

    function updateSession(id, updates) {
        const data = getAll();
        const idx = data.sessions.findIndex(s => s.id === id);
        if (idx === -1) return null;
        Object.assign(data.sessions[idx], updates);
        saveAll(data);
        return data.sessions[idx];
    }

    function deleteSession(id) {
        const data = getAll();
        data.sessions = data.sessions.filter(s => s.id !== id);
        saveAll(data);
    }

    // --- Games within sessions ---
    function addGame(sessionId, gameName, playerPlacements, teamPlayerMap) {
        const data = getAll();
        const session = data.sessions.find(s => s.id === sessionId);
        if (!session) return null;

        // playerPlacements: { "playerName": position, ... }
        // teamPlayerMap: { teamId: ["playerName", ...], ... }
        const totalPlayers = Object.keys(playerPlacements).length;

        // Calculate per-player points
        const playerPoints = {};
        for (const [playerName, position] of Object.entries(playerPlacements)) {
            playerPoints[playerName] = calculatePoints(position, totalPlayers);
        }

        // Calculate per-team points (sum of player points)
        const points = {};
        const placements = {}; // keep team-level best placement for display
        for (const [teamId, players] of Object.entries(teamPlayerMap)) {
            let teamTotal = 0;
            let bestPos = Infinity;
            for (const pName of players) {
                if (playerPoints[pName] !== undefined) {
                    teamTotal += playerPoints[pName];
                }
                if (playerPlacements[pName] !== undefined && playerPlacements[pName] < bestPos) {
                    bestPos = playerPlacements[pName];
                }
            }
            points[teamId] = teamTotal;
            placements[teamId] = bestPos === Infinity ? 999 : bestPos;
        }

        const game = {
            id: generateId(),
            name: gameName.trim(),
            placements: placements,
            points: points,
            playerPlacements: playerPlacements,
            playerPoints: playerPoints,
            teamPlayerMap: teamPlayerMap
        };
        session.games.push(game);
        saveAll(data);
        return game;
    }

    function removeGame(sessionId, gameId) {
        const data = getAll();
        const session = data.sessions.find(s => s.id === sessionId);
        if (!session) return;
        session.games = session.games.filter(g => g.id !== gameId);
        saveAll(data);
    }

    // --- Penalties ---
    function addPenalty(sessionId, teamId, value, reason) {
        const data = getAll();
        const session = data.sessions.find(s => s.id === sessionId);
        if (!session) return null;

        const penalty = {
            id: generateId(),
            teamId: teamId,
            value: value,
            reason: reason || ''
        };
        session.penalties.push(penalty);
        saveAll(data);
        return penalty;
    }

    function removePenalty(sessionId, penaltyId) {
        const data = getAll();
        const session = data.sessions.find(s => s.id === sessionId);
        if (!session) return;
        session.penalties = session.penalties.filter(p => p.id !== penaltyId);
        saveAll(data);
    }

    // --- Points calculation ---
    function calculatePoints(position, numTeams) {
        // 1st = 4, 2nd = 3, 3rd = 2, last/others = 1
        // For 2 teams: 1st = 4, 2nd (last) = 1
        // For 3+ teams: 1st = 4, 2nd = 3, 3rd = 2, 4th+ = 1
        if (numTeams <= 2) {
            return position === 1 ? 4 : 1;
        }
        if (position === 1) return 4;
        if (position === 2) return 3;
        if (position === 3) return 2;
        return 1;
    }

    function getSessionScores(sessionId) {
        const session = getSession(sessionId);
        if (!session) return {};

        const scores = {};
        session.teamIds.forEach(tid => {
            scores[tid] = { gamePoints: 0, penaltyPoints: 0, total: 0 };
        });

        session.games.forEach(game => {
            for (const [teamId, pts] of Object.entries(game.points)) {
                if (scores[teamId]) {
                    scores[teamId].gamePoints += pts;
                }
            }
        });

        session.penalties.forEach(p => {
            if (scores[p.teamId]) {
                scores[p.teamId].penaltyPoints += p.value;
            }
        });

        for (const tid of Object.keys(scores)) {
            scores[tid].total = scores[tid].gamePoints + scores[tid].penaltyPoints;
        }

        return scores;
    }

    // --- Export / Import ---
    function exportData() {
        return JSON.stringify(getAll(), null, 2);
    }

    function importData(jsonStr) {
        const data = JSON.parse(jsonStr);
        if (!data.teams || !data.sessions) {
            throw new Error('Invalid data format');
        }
        saveAll(data);
    }

    // --- Stats ---
    function getTotalGamesPlayed() {
        return getSessions().reduce((sum, s) => sum + s.games.length, 0);
    }

    function getAllTimeLeaderboard() {
        const completed = getCompletedSessions();
        const scores = {};

        completed.forEach(session => {
            const sessionScores = getSessionScores(session.id);
            const sorted = Object.entries(sessionScores)
                .sort((a, b) => b[1].total - a[1].total);

            for (const [teamId, score] of Object.entries(sessionScores)) {
                if (!scores[teamId]) {
                    scores[teamId] = { totalPoints: 0, wins: 0, sessions: 0 };
                }
                scores[teamId].totalPoints += score.total;
                scores[teamId].sessions += 1;
            }

            if (sorted.length > 0) {
                const winnerId = sorted[0][0];
                if (scores[winnerId]) {
                    scores[winnerId].wins += 1;
                }
            }
        });

        return Object.entries(scores)
            .map(([teamId, stats]) => ({ teamId, ...stats }))
            .sort((a, b) => b.totalPoints - a.totalPoints);
    }

    return {
        getTeams, getTeam, createTeam, updateTeam, deleteTeam,
        getSessions, getSession, getActiveSessions, getCompletedSessions,
        createSession, updateSession, deleteSession,
        addGame, removeGame,
        addPenalty, removePenalty,
        calculatePoints, getSessionScores,
        exportData, importData,
        getTotalGamesPlayed, getAllTimeLeaderboard,
        generateId
    };
})();
