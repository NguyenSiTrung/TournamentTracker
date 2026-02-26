/**
 * API - HTTP client for Tournament Tracker backend
 */
const API = (() => {
    const BASE_URL = '/api';

    async function request(path, options = {}) {
        const url = `${BASE_URL}${path}`;
        const config = {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        };
        const resp = await fetch(url, config);
        if (!resp.ok) {
            const err = await resp.json().catch(() => ({ detail: resp.statusText }));
            throw new Error(err.detail || `Request failed: ${resp.status}`);
        }
        if (resp.status === 204) return null;
        return resp.json();
    }

    // --- Teams ---
    const getTeams = () => request('/teams');
    const getTeam = (id) => request(`/teams/${id}`);
    const createTeam = (name, players, color = null, tag = null) => request('/teams', {
        method: 'POST',
        body: JSON.stringify({ name, players, color, tag }),
    });
    const updateTeam = (id, name, players, color = null, tag = null) => request(`/teams/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, players, color, tag }),
    });
    const deleteTeam = (id) => request(`/teams/${id}`, { method: 'DELETE' });

    // --- Sessions ---
    const getSessions = (status) => {
        const qs = status ? `?status=${status}` : '';
        return request(`/sessions${qs}`);
    };
    const getSession = (id) => request(`/sessions/${id}`);
    const createSession = (name, teamIds) => request('/sessions', {
        method: 'POST',
        body: JSON.stringify({ name, team_ids: teamIds }),
    });
    const updateSession = (id, updates) => request(`/sessions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
    const deleteSession = (id) => request(`/sessions/${id}`, { method: 'DELETE' });

    // --- Games ---
    const addGame = (sessionId, name, playerPlacements, teamPlayerMap) => request(`/sessions/${sessionId}/games`, {
        method: 'POST',
        body: JSON.stringify({ name, player_placements: playerPlacements, team_player_map: teamPlayerMap }),
    });
    const removeGame = (sessionId, gameId) => request(`/sessions/${sessionId}/games/${gameId}`, { method: 'DELETE' });

    // --- Penalties ---
    const addPenalty = (sessionId, teamId, value, reason) => request(`/sessions/${sessionId}/penalties`, {
        method: 'POST',
        body: JSON.stringify({ team_id: teamId, value, reason }),
    });
    const removePenalty = (sessionId, penaltyId) => request(`/sessions/${sessionId}/penalties/${penaltyId}`, { method: 'DELETE' });

    // --- Scores & Stats ---
    const getSessionScores = (sessionId) => request(`/sessions/${sessionId}/scores`);
    const getLeaderboard = () => request('/stats/leaderboard');

    // --- Import / Export ---
    const exportData = () => request('/export');
    const importData = (data) => request('/import', {
        method: 'POST',
        body: JSON.stringify(data),
    });

    // --- Settings ---
    const getSettings = () => request('/settings');
    const updateSettings = (data) => request('/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    const resetData = (categories) => request('/data/reset', {
        method: 'DELETE',
        body: JSON.stringify(categories),
    });

    return {
        getTeams, getTeam, createTeam, updateTeam, deleteTeam,
        getSessions, getSession, createSession, updateSession, deleteSession,
        addGame, removeGame,
        addPenalty, removePenalty,
        getSessionScores, getLeaderboard,
        exportData, importData,
        getSettings, updateSettings, resetData,
    };
})();
