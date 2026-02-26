/**
 * Settings - Settings tab controller
 */
const Settings = (() => {
    const REDUCE_MOTION_KEY = 'tournament_tracker_reduce_motion';

    async function render() {
        await loadSettings();
        await loadDataStats();
        initToggles();
        restoreReduceMotion();
    }

    // --- Load Settings from API ---
    async function loadSettings() {
        try {
            const s = await API.getSettings();

            // Profile
            document.getElementById('settings-league-name').value = s.league_name || '';
            document.getElementById('settings-season').value = s.season || '';
            document.getElementById('settings-description').value = s.description || '';

            // Scoring
            document.getElementById('settings-scoring-1st').value = s.scoring.first;
            document.getElementById('settings-scoring-2nd').value = s.scoring.second;
            document.getElementById('settings-scoring-3rd').value = s.scoring.third;
            document.getElementById('settings-scoring-4th').value = s.scoring.fourth;

            // 2-Player scoring
            document.getElementById('settings-scoring-2p-1st').value = s.scoring_2p.first;
            document.getElementById('settings-scoring-2p-2nd').value = s.scoring_2p.second;

            // Update sidebar brand
            updateSidebarBrand(s.league_name, s.season);
        } catch (err) {
            console.error('Failed to load settings:', err);
        }
    }

    // --- Save Profile ---
    async function saveProfile() {
        const leagueName = document.getElementById('settings-league-name').value.trim();
        const season = document.getElementById('settings-season').value.trim();
        const description = document.getElementById('settings-description').value.trim();

        try {
            const updated = await API.updateSettings({
                league_name: leagueName,
                season: season,
                description: description,
            });

            updateSidebarBrand(updated.league_name, updated.season);
            App.toast('Profile saved!', 'success');
        } catch (err) {
            App.toast('Failed to save profile: ' + err.message, 'error');
        }
    }

    // --- Save Scoring ---
    async function saveScoring() {
        const first = parseInt(document.getElementById('settings-scoring-1st').value) || 0;
        const second = parseInt(document.getElementById('settings-scoring-2nd').value) || 0;
        const third = parseInt(document.getElementById('settings-scoring-3rd').value) || 0;
        const fourth = parseInt(document.getElementById('settings-scoring-4th').value) || 0;

        // Validation: 1st >= 2nd >= 3rd >= 4th, all positive
        if (first < second || second < third || third < fourth) {
            App.toast('Points must decrease by placement: 1st ≥ 2nd ≥ 3rd ≥ 4th', 'error');
            return;
        }
        if (first < 0 || second < 0 || third < 0 || fourth < 0) {
            App.toast('Points must be positive', 'error');
            return;
        }

        const payload = {
            scoring: { first, second, third, fourth },
        };

        // Include 2-player scoring if toggle is on
        const toggle2p = document.getElementById('settings-2p-toggle');
        if (toggle2p && toggle2p.checked) {
            const first2p = parseInt(document.getElementById('settings-scoring-2p-1st').value) || 0;
            const second2p = parseInt(document.getElementById('settings-scoring-2p-2nd').value) || 0;
            payload.scoring_2p = { first: first2p, second: second2p };
        }

        try {
            await API.updateSettings(payload);
            App.toast('Scoring configuration saved!', 'success');
        } catch (err) {
            App.toast('Failed to save scoring: ' + err.message, 'error');
        }
    }

    // --- Restore Default Scoring ---
    async function restoreDefaultScoring() {
        try {
            await API.updateSettings({
                scoring: { first: 4, second: 3, third: 2, fourth: 1 },
                scoring_2p: { first: 4, second: 1 },
            });
            // Update form fields
            document.getElementById('settings-scoring-1st').value = 4;
            document.getElementById('settings-scoring-2nd').value = 3;
            document.getElementById('settings-scoring-3rd').value = 2;
            document.getElementById('settings-scoring-4th').value = 1;
            document.getElementById('settings-scoring-2p-1st').value = 4;
            document.getElementById('settings-scoring-2p-2nd').value = 1;
            App.toast('Scoring restored to defaults', 'success');
        } catch (err) {
            App.toast('Failed to restore defaults: ' + err.message, 'error');
        }
    }

    // --- Data Stats ---
    async function loadDataStats() {
        try {
            const teams = await API.getTeams();
            const sessions = await API.getSessions();

            let totalGames = 0;
            for (const s of sessions) {
                const full = await API.getSession(s.id);
                totalGames += full.games.length;
            }

            document.getElementById('settings-stat-teams').textContent = teams.length;
            document.getElementById('settings-stat-sessions').textContent = sessions.length;
            document.getElementById('settings-stat-games').textContent = totalGames;
        } catch (err) {
            console.error('Failed to load data stats:', err);
        }
    }

    // --- Reset Modal ---
    function showResetModal() {
        const bodyHtml = `
            <div style="margin-bottom:16px;">
                <p style="color:#e74c3c;font-weight:600;margin-bottom:12px;">⚠️ This action is irreversible!</p>
                <p style="margin-bottom:16px;">Select what you want to reset:</p>
                <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:pointer;">
                    <input type="checkbox" id="reset-teams" value="teams"> Teams
                </label>
                <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:pointer;">
                    <input type="checkbox" id="reset-sessions" value="sessions"> Sessions, Games &amp; Scores
                </label>
                <label style="display:flex;align-items:center;gap:8px;margin-bottom:16px;cursor:pointer;">
                    <input type="checkbox" id="reset-settings" value="settings"> League Settings
                </label>
            </div>
            <div>
                <label style="display:block;font-size:0.85rem;color:#a5d6a7;margin-bottom:6px;">Type <strong>RESET</strong> to confirm:</label>
                <input type="text" class="form-input" id="reset-confirm-input" placeholder="RESET" autocomplete="off" style="width:100%;">
            </div>
        `;

        const footerHtml = `
            <button class="btn btn-ghost" onclick="App.closeModal(true)">Cancel</button>
            <button class="btn btn-danger" id="reset-execute-btn" onclick="Settings.executeReset()" disabled>Reset Data</button>
        `;

        App.openModal('Reset All Data', bodyHtml, footerHtml);

        // Enable button only when "RESET" is typed
        setTimeout(() => {
            const input = document.getElementById('reset-confirm-input');
            const btn = document.getElementById('reset-execute-btn');
            if (input && btn) {
                input.addEventListener('input', () => {
                    btn.disabled = input.value.trim() !== 'RESET';
                });
            }
        }, 100);
    }

    // --- Execute Reset ---
    async function executeReset() {
        const resetTeams = document.getElementById('reset-teams')?.checked || false;
        const resetSessions = document.getElementById('reset-sessions')?.checked || false;
        const resetSettings = document.getElementById('reset-settings')?.checked || false;

        if (!resetTeams && !resetSessions && !resetSettings) {
            App.toast('Select at least one category to reset', 'error');
            return;
        }

        const confirmInput = document.getElementById('reset-confirm-input');
        if (!confirmInput || confirmInput.value.trim() !== 'RESET') {
            App.toast('Type RESET to confirm', 'error');
            return;
        }

        try {
            await API.resetData({
                teams: resetTeams,
                sessions: resetSessions,
                settings: resetSettings,
            });

            App.closeModal(true);

            if (resetSettings) {
                await loadSettings();
            }
            if (resetTeams) {
                Store.invalidateTeamsCache();
            }

            await loadDataStats();
            App.toast('Data reset successfully', 'success');

            // Refresh dashboard to reflect changes
            await App.refreshDashboard();
        } catch (err) {
            App.toast('Reset failed: ' + err.message, 'error');
        }
    }

    // --- Reduce Motion Toggle ---
    function toggleReduceMotion() {
        const checkbox = document.getElementById('settings-reduce-motion');
        const enabled = checkbox.checked;

        if (enabled) {
            document.documentElement.classList.add('reduce-motion');
        } else {
            document.documentElement.classList.remove('reduce-motion');
        }

        localStorage.setItem(REDUCE_MOTION_KEY, String(enabled));
    }

    function restoreReduceMotion() {
        const stored = localStorage.getItem(REDUCE_MOTION_KEY);
        const checkbox = document.getElementById('settings-reduce-motion');

        if (stored === 'true') {
            checkbox.checked = true;
            document.documentElement.classList.add('reduce-motion');
        } else {
            checkbox.checked = false;
            document.documentElement.classList.remove('reduce-motion');
        }
    }

    // --- Toggle Init ---
    function initToggles() {
        // 2-Player toggle
        const toggle2p = document.getElementById('settings-2p-toggle');
        const section2p = document.getElementById('settings-2p-section');
        if (toggle2p && section2p) {
            toggle2p.addEventListener('change', () => {
                section2p.style.display = toggle2p.checked ? '' : 'none';
            });
        }

        // Reduce motion toggle
        const reduceMotion = document.getElementById('settings-reduce-motion');
        if (reduceMotion) {
            reduceMotion.addEventListener('change', toggleReduceMotion);
        }

        // Save Profile
        const saveProfileBtn = document.getElementById('settings-save-profile');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', saveProfile);
        }

        // Save Scoring
        const saveScoringBtn = document.getElementById('settings-save-scoring');
        if (saveScoringBtn) {
            saveScoringBtn.addEventListener('click', saveScoring);
        }

        // Restore Defaults
        const restoreBtn = document.getElementById('settings-restore-defaults');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', restoreDefaultScoring);
        }

        // Reset button
        const resetBtn = document.getElementById('settings-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', showResetModal);
        }
    }

    // --- Sidebar Brand Update ---
    function updateSidebarBrand(leagueName, season) {
        const brandEl = document.querySelector('.sidebar-brand');
        const seasonEl = document.querySelector('.sidebar-season');
        if (brandEl) brandEl.textContent = leagueName || 'Pro League';
        if (seasonEl) seasonEl.textContent = season || 'Season 4';
    }

    return {
        render,
        executeReset,
        restoreReduceMotion,
    };
})();
