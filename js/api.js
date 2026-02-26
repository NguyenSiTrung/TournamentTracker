/**
 * API - HTTP client for Tournament Tracker backend
 */
const API = (() => {
    const DEFAULT_BASE_URL = '/api';
    const LOCAL_BACKEND_PORT = '8000';
    const configuredBaseUrl = typeof window !== 'undefined' ? window.TOURNAMENT_TRACKER_API_BASE_URL : null;
    const PRIMARY_BASE_URL = (configuredBaseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');

    function getLocalBackendBaseUrl() {
        if (typeof window === 'undefined') return 'http://127.0.0.1:8000/api';
        const host = window.location.hostname || '127.0.0.1';
        return `${window.location.protocol}//${host}:${LOCAL_BACKEND_PORT}/api`;
    }

    function shouldRetryWithLocalBackend(method, status, detail) {
        // Static web servers commonly return these for unsupported write methods.
        const methodUpper = (method || 'GET').toUpperCase();
        if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(methodUpper)) return false;
        if ([404, 405, 501].includes(status)) return true;
        return typeof detail === 'string' && detail.includes("Unsupported method ('");
    }

    async function parseErrorDetail(resp) {
        const contentType = resp.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const payload = await resp.json().catch(() => null);
            if (payload && payload.detail) return payload.detail;
        }
        const text = await resp.text().catch(() => '');
        return text || resp.statusText;
    }

    async function fetchJson(baseUrl, path, options = {}) {
        const url = `${baseUrl}${path}`;
        const config = {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        };
        const resp = await fetch(url, config);
        if (!resp.ok) {
            const detail = await parseErrorDetail(resp);
            const error = new Error(detail || `Request failed: ${resp.status}`);
            error.status = resp.status;
            error.detail = detail;
            throw error;
        }
        if (resp.status === 204) return null;
        return resp.json();
    }

    async function request(path, options = {}) {
        try {
            return await fetchJson(PRIMARY_BASE_URL, path, options);
        } catch (error) {
            const method = options.method || 'GET';
            const localBackendBaseUrl = getLocalBackendBaseUrl();
            if (
                localBackendBaseUrl === PRIMARY_BASE_URL ||
                !shouldRetryWithLocalBackend(method, error.status, error.detail)
            ) {
                throw error;
            }

            return fetchJson(localBackendBaseUrl, path, options);
        }
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
