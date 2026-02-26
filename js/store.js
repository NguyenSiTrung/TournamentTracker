/**
 * Store - Data layer backed by API (was localStorage)
 */
const Store = (() => {
    // Local cache for teams (avoids repeated fetches during rendering)
    let _teamsCache = [];
    let _teamsCacheValid = false;
    let _scoringConfigCache = null;
    let _scoringConfigCacheValid = false;

    const DEFAULT_SCORING_CONFIG = {
        standard: { 1: 4, 2: 3, 3: 2, 4: 1 },
        twoPlayer: { 1: 4, 2: 1 },
    };

    function invalidateTeamsCache() {
        _teamsCacheValid = false;
    }

    function invalidateScoringCache() {
        _scoringConfigCacheValid = false;
    }

    function normalizeScoringConfig(settings) {
        const scoring = settings?.scoring || {};
        const scoring2p = settings?.scoring_2p || {};
        return {
            standard: {
                1: scoring.first ?? DEFAULT_SCORING_CONFIG.standard[1],
                2: scoring.second ?? DEFAULT_SCORING_CONFIG.standard[2],
                3: scoring.third ?? DEFAULT_SCORING_CONFIG.standard[3],
                4: scoring.fourth ?? DEFAULT_SCORING_CONFIG.standard[4],
            },
            twoPlayer: {
                1: scoring2p.first ?? DEFAULT_SCORING_CONFIG.twoPlayer[1],
                2: scoring2p.second ?? DEFAULT_SCORING_CONFIG.twoPlayer[2],
            },
        };
    }

    async function getScoringConfig() {
        if (!_scoringConfigCacheValid) {
            try {
                const settings = await API.getSettings();
                _scoringConfigCache = normalizeScoringConfig(settings);
            } catch (err) {
                console.error('Failed to load scoring settings, using defaults:', err);
                _scoringConfigCache = normalizeScoringConfig(null);
            }
            _scoringConfigCacheValid = true;
        }
        return _scoringConfigCache;
    }

    // --- Teams ---
    async function getTeams() {
        if (!_teamsCacheValid) {
            _teamsCache = await API.getTeams();
            _teamsCacheValid = true;
        }
        return _teamsCache;
    }

    function getTeamFromCache(id) {
        return _teamsCache.find(t => t.id === id) || null;
    }

    async function getTeam(id) {
        const cached = getTeamFromCache(id);
        if (cached) return cached;
        return API.getTeam(id);
    }

    async function createTeam(name, players, color = null, tag = null) {
        invalidateTeamsCache();
        return API.createTeam(name, players, color, tag);
    }

    async function updateTeam(id, name, players, color = null, tag = null) {
        invalidateTeamsCache();
        return API.updateTeam(id, name, players, color, tag);
    }

    async function deleteTeam(id) {
        invalidateTeamsCache();
        return API.deleteTeam(id);
    }

    // --- Sessions ---
    async function getSessions() {
        return API.getSessions();
    }

    async function getSession(id) {
        return API.getSession(id);
    }

    async function getActiveSessions() {
        return API.getSessions('active');
    }

    async function getCompletedSessions() {
        return API.getSessions('completed');
    }

    async function createSession(name, teamIds) {
        return API.createSession(name, teamIds);
    }

    async function updateSession(id, updates) {
        return API.updateSession(id, updates);
    }

    async function deleteSession(id) {
        return API.deleteSession(id);
    }

    // --- Games ---
    async function addGame(sessionId, gameName, playerPlacements, teamPlayerMap) {
        return API.addGame(sessionId, gameName, playerPlacements, teamPlayerMap);
    }

    async function removeGame(sessionId, gameId) {
        return API.removeGame(sessionId, gameId);
    }

    // --- Penalties ---
    async function addPenalty(sessionId, teamId, value, reason) {
        return API.addPenalty(sessionId, teamId, value, reason);
    }

    async function removePenalty(sessionId, penaltyId) {
        return API.removePenalty(sessionId, penaltyId);
    }

    // --- Points calculation (kept client-side for UI display) ---
    function calculatePoints(position, numPlayers, scoringConfig = null) {
        const activeConfig = scoringConfig || _scoringConfigCache || DEFAULT_SCORING_CONFIG;
        if (numPlayers <= 2) {
            return activeConfig.twoPlayer[position] ?? activeConfig.twoPlayer[2] ?? 1;
        }
        return activeConfig.standard[position] ?? activeConfig.standard[4] ?? 1;
    }

    async function getSessionScores(sessionId) {
        const scores = await API.getSessionScores(sessionId);
        // Convert array to object keyed by team_id for backward compat
        const result = {};
        scores.forEach(s => {
            result[s.team_id] = {
                gamePoints: s.game_points,
                penaltyPoints: s.penalty_points,
                total: s.total,
            };
        });
        return result;
    }

    // --- Stats ---
    async function getAllTimeLeaderboard() {
        const entries = await API.getLeaderboard();
        return entries.map(e => ({
            teamId: e.team_id,
            totalPoints: e.total_points,
            wins: e.wins,
            sessions: e.sessions,
        }));
    }

    async function getTotalGamesPlayed() {
        const sessions = await getSessions();
        // Sessions list endpoint doesn't include games count,
        // so we sum from the full session data for active ones
        let total = 0;
        for (const s of sessions) {
            const full = await getSession(s.id);
            total += full.games.length;
        }
        return total;
    }

    // --- Export / Import ---
    async function exportData() {
        const data = await API.exportData();
        return JSON.stringify(data, null, 2);
    }

    async function importData(jsonStr) {
        const data = JSON.parse(jsonStr);
        if (!data.teams || !data.sessions) {
            throw new Error('Invalid data format');
        }
        return API.importData(data);
    }

    return {
        getTeams, getTeam, getTeamFromCache, createTeam, updateTeam, deleteTeam,
        getSessions, getSession, getActiveSessions, getCompletedSessions,
        createSession, updateSession, deleteSession,
        addGame, removeGame,
        addPenalty, removePenalty,
        calculatePoints, getScoringConfig, getSessionScores,
        exportData, importData,
        getTotalGamesPlayed, getAllTimeLeaderboard,
        invalidateTeamsCache, invalidateScoringCache,
    };
})();
