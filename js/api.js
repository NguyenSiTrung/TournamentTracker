/**
 * API - HTTP client for Tournament Tracker backend
 */
const API = (() => {
    const DEFAULT_BASE_URL = '/api';
    const COMMON_BACKEND_PORTS = ['8000', '8001', '8080', '5000'];
    const configuredBaseUrl = typeof window !== 'undefined' ? window.TOURNAMENT_TRACKER_API_BASE_URL : null;
    const PRIMARY_BASE_URL = (configuredBaseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    let resolvedBaseUrl = PRIMARY_BASE_URL;

    function getCandidateBaseUrls() {
        const candidates = [PRIMARY_BASE_URL];
        if (typeof window === 'undefined') {
            COMMON_BACKEND_PORTS.forEach((port) => candidates.push(`http://127.0.0.1:${port}/api`));
            return [...new Set(candidates)];
        }

        const protocol = window.location.protocol || 'http:';
        const hostname = window.location.hostname || '127.0.0.1';
        const origin = window.location.origin;
        if (origin && PRIMARY_BASE_URL.startsWith('/')) {
            candidates.push(`${origin}${PRIMARY_BASE_URL}`);
        }
        COMMON_BACKEND_PORTS.forEach((port) => candidates.push(`${protocol}//${hostname}:${port}/api`));
        return [...new Set(candidates.map((url) => url.replace(/\/$/, '')) )];
    }

    async function discoverBackendBaseUrl() {
        const candidates = getCandidateBaseUrls();
        for (const baseUrl of candidates) {
            try {
                const probe = await fetch(`${baseUrl}/settings`, { method: 'GET' });
                const contentType = probe.headers.get('content-type') || '';
                if (probe.ok && contentType.includes('application/json')) {
                    resolvedBaseUrl = baseUrl;
                    return baseUrl;
                }
            } catch (_error) {
                // Ignore probe failures and continue trying common local API locations.
            }
        }
        return null;
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
            return await fetchJson(resolvedBaseUrl, path, options);
        } catch (error) {
            const method = options.method || 'GET';
            if (!shouldRetryWithLocalBackend(method, error.status, error.detail)) {
                throw error;
            }

            const previousBaseUrl = resolvedBaseUrl;
            const discoveredBaseUrl = await discoverBackendBaseUrl();
            if (!discoveredBaseUrl || discoveredBaseUrl === previousBaseUrl) {
                throw error;
            }

            return fetchJson(discoveredBaseUrl, path, options);
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
