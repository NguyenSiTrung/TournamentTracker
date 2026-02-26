/**
 * Teams - Team management UI
 */
const Teams = (() => {
    // Team accent colors for visual variety
    const TEAM_ACCENT_COLORS = [
        { bg: 'linear-gradient(135deg, #2e7d32, #1b5e20)', accent: '#4caf50' },
        { bg: 'linear-gradient(135deg, #e65100, #bf360c)', accent: '#ff7043' },
        { bg: 'linear-gradient(135deg, #6a1b9a, #4a148c)', accent: '#ab47bc' },
        { bg: 'linear-gradient(135deg, #1565c0, #0d47a1)', accent: '#42a5f5' },
        { bg: 'linear-gradient(135deg, #f9a825, #f57f17)', accent: '#ffc107' },
        { bg: 'linear-gradient(135deg, #00838f, #006064)', accent: '#26c6da' },
        { bg: 'linear-gradient(135deg, #ad1457, #880e4f)', accent: '#ec407a' },
        { bg: 'linear-gradient(135deg, #4e342e, #3e2723)', accent: '#8d6e63' },
    ];

    // Player chip background colors
    const CHIP_COLORS = ['#455a64', '#546e7a', '#37474f', '#607d8b', '#78909c', '#263238'];

    /**
     * Darken a hex color by a given amount (0-255).
     * Used to derive gradient endpoints from stored team color.
     */
    function _darkenHex(hex, amount) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, (num >> 16) - amount);
        const g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
        const b = Math.max(0, (num & 0x0000FF) - amount);
        return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
    }

    let _searchQuery = '';

    async function render() {
        const teams = await Store.getTeams();
        const container = document.getElementById('view-teams');
        const grid = document.getElementById('teams-grid');

        // Remove existing search bar if any
        const existingSearch = container.querySelector('.teams-search-bar');
        if (existingSearch) existingSearch.remove();

        if (teams.length === 0) {
            grid.innerHTML = `
            <div class="empty-state-hero-card">
                <div class="empty-state-hero">
                    <svg class="empty-state-hero__svg-illustration" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M55 50h70v45c0 22-15 38-35 38s-35-16-35-38V50z" fill="#132218" stroke="#4caf50" stroke-width="2"/>
                        <path d="M60 55h60v40c0 18-13 32-30 32s-30-14-30-32V55z" fill="url(#trophyGradFill)" opacity="0.25"/>
                        <path d="M55 60H40a12 12 0 0 0 0 24h15" stroke="#2e7d32" stroke-width="2" fill="none"/>
                        <path d="M125 60h15a12 12 0 0 1 0 24h-15" stroke="#2e7d32" stroke-width="2" fill="none"/>
                        <rect x="78" y="133" width="24" height="12" rx="3" fill="#2e7d32" opacity="0.7"/>
                        <rect x="65" y="145" width="50" height="8" rx="4" fill="#2e7d32" opacity="0.5"/>
                        <polygon points="90,62 93.5,70 102,71 96,77 97.5,86 90,82 82.5,86 84,77 78,71 86.5,70" fill="#ffd700" opacity="0.85"/>
                        <circle cx="60" cy="165" r="6" fill="#4caf50" opacity="0.3"/>
                        <rect x="54" y="172" width="12" height="8" rx="4" fill="#4caf50" opacity="0.2"/>
                        <circle cx="90" cy="162" r="7" fill="#00c853" opacity="0.35"/>
                        <rect x="83" y="170" width="14" height="10" rx="5" fill="#00c853" opacity="0.25"/>
                        <circle cx="120" cy="165" r="6" fill="#4caf50" opacity="0.3"/>
                        <rect x="114" y="172" width="12" height="8" rx="4" fill="#4caf50" opacity="0.2"/>
                        <circle cx="42" cy="42" r="2.5" fill="#ffd700" opacity="0.6"/>
                        <circle cx="140" cy="38" r="2" fill="#ffd700" opacity="0.5"/>
                        <circle cx="150" cy="100" r="1.8" fill="#ffd700" opacity="0.4"/>
                        <circle cx="30" cy="95" r="2" fill="#4caf50" opacity="0.3"/>
                        <defs>
                            <linearGradient id="trophyGradFill" x1="60" y1="55" x2="120" y2="127">
                                <stop offset="0%" stop-color="#4caf50"/>
                                <stop offset="100%" stop-color="#00c853"/>
                            </linearGradient>
                        </defs>
                    </svg>
                    <h3 class="empty-state-hero__title">No Teams Registered</h3>
                    <p class="empty-state-hero__subtitle">Start by creating your first team to track their progress and scores across sessions.</p>
                    <button class="empty-state-hero__cta" onclick="Teams.showCreateModal()" id="cta-create-first-team">+ Create Your First Team</button>
                    <div class="empty-state-hero__steps">
                        <div class="empty-state-hero__step">
                            <div class="empty-state-hero__step-icon">✏️</div>
                            <span class="empty-state-hero__step-num">Step 1</span>
                            <span class="empty-state-hero__step-label">Name your team</span>
                        </div>
                        <div class="empty-state-hero__step">
                            <div class="empty-state-hero__step-icon">👥</div>
                            <span class="empty-state-hero__step-num">Step 2</span>
                            <span class="empty-state-hero__step-label">Add players</span>
                        </div>
                        <div class="empty-state-hero__step">
                            <div class="empty-state-hero__step-icon">🎮</div>
                            <span class="empty-state-hero__step-num">Step 3</span>
                            <span class="empty-state-hero__step-label">Start playing!</span>
                        </div>
                    </div>
                </div>
            </div>`;
            return;
        }

        // Insert search bar before grid
        const searchBar = document.createElement('div');
        searchBar.className = 'teams-search-bar';
        searchBar.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" id="teams-search-input" placeholder="Search teams or players..." value="${escapeHtml(_searchQuery)}">
            <span class="teams-search-count" id="teams-search-count">${teams.length} team${teams.length !== 1 ? 's' : ''}</span>
        `;
        grid.parentNode.insertBefore(searchBar, grid);

        // Attach search handler
        const searchInput = document.getElementById('teams-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                _searchQuery = e.target.value.trim().toLowerCase();
                filterTeamCards();
            });
        }

        // Fetch stats if available
        let teamStats = {};
        try {
            const sessions = await Store.getSessions();
            teams.forEach(t => { teamStats[t.id] = { wins: 0, points: 0, games: 0 }; });
            sessions.forEach(s => {
                if (s.games) {
                    s.games.forEach(g => {
                        Object.entries(g.scores || {}).forEach(([tid, pts]) => {
                            if (teamStats[tid]) {
                                teamStats[tid].points += pts;
                                teamStats[tid].games += 1;
                            }
                        });
                        if (g.winner && teamStats[g.winner]) {
                            teamStats[g.winner].wins += 1;
                        }
                    });
                }
            });
        } catch (e) { /* stats are optional */ }

        grid.innerHTML = teams.map((team, idx) => {
            const initials = team.name.split(' ').map(w => w[0]).join('').toUpperCase().substr(0, 2);

            // Use stored color if available, otherwise fall back to palette cycling
            const accentColor = team.color || TEAM_ACCENT_COLORS[idx % TEAM_ACCENT_COLORS.length].accent;
            const avatarBg = team.color
                ? `linear-gradient(135deg, ${team.color}, ${_darkenHex(team.color, 30)})`
                : TEAM_ACCENT_COLORS[idx % TEAM_ACCENT_COLORS.length].bg;

            const stats = teamStats[team.id] || { wins: 0, points: 0, games: 0 };
            const winRate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;

            // Build player chips (show up to 4, then "+N")
            const maxChips = 4;
            const chipPlayers = team.players.slice(0, maxChips);
            const extraCount = team.players.length - maxChips;
            const chipsHtml = chipPlayers.map((p, i) => {
                const chipColor = CHIP_COLORS[i % CHIP_COLORS.length];
                const chipInitial = p.trim().charAt(0).toUpperCase();
                return `<div class="team-player-chip" style="background:${chipColor}" title="${escapeHtml(p)}">${chipInitial}</div>`;
            }).join('') + (extraCount > 0 ? `<div class="team-player-chip team-player-chip-more">+${extraCount}</div>` : '');

            // Tag badge (only show if team has a tag)
            const tagBadge = team.tag
                ? `<span class="team-tag-badge" style="background:${accentColor}20; color:${accentColor}; border-color:${accentColor}40">${escapeHtml(team.tag)}</span>`
                : '';

            return `
                <div class="team-card" data-team-id="${team.id}" data-team-name="${escapeHtml(team.name).toLowerCase()}" data-team-players="${team.players.map(p => escapeHtml(p).toLowerCase()).join(',')}">
                    <div class="team-card-accent" style="background:${accentColor}"></div>
                    <div class="team-card-header">
                        <div class="team-avatar" style="background:${avatarBg}">${initials}</div>
                        <div class="team-card-actions">
                            <button class="team-action-btn" onclick="Teams.editTeam('${team.id}')" title="Edit">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button class="team-action-btn danger" onclick="Teams.deleteTeam('${team.id}')" title="Delete">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        </div>
                    </div>
                    <div class="team-name-row">
                        <div class="team-name">${escapeHtml(team.name)}</div>
                        ${tagBadge}
                    </div>
                    <div class="team-player-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        ${team.players.length} player${team.players.length !== 1 ? 's' : ''}
                    </div>
                    <div class="team-player-chips">${chipsHtml}</div>
                    <div class="team-stats-row">
                        <div class="team-stat-item">
                            <span class="team-stat-label">Wins</span>
                            <span class="team-stat-value highlight">${stats.wins}</span>
                        </div>
                        <div class="team-stat-item">
                            <span class="team-stat-label">Points</span>
                            <span class="team-stat-value">${stats.points}</span>
                        </div>
                        <div class="team-stat-item">
                            <span class="team-stat-label">Win%</span>
                            <span class="team-stat-value">${winRate}%</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Apply existing search filter
        if (_searchQuery) filterTeamCards();
    }

    function filterTeamCards() {
        const cards = document.querySelectorAll('.team-card');
        let visible = 0;
        cards.forEach(card => {
            const name = card.dataset.teamName || '';
            const players = card.dataset.teamPlayers || '';
            const match = !_searchQuery || name.includes(_searchQuery) || players.includes(_searchQuery);
            card.style.display = match ? '' : 'none';
            if (match) visible++;
        });
        const countEl = document.getElementById('teams-search-count');
        if (countEl) countEl.textContent = `${visible} team${visible !== 1 ? 's' : ''}`;
    }

    const TEAM_COLORS = [
        { name: 'Red', hex: '#e74c3c' },
        { name: 'Blue', hex: '#3498db' },
        { name: 'Green', hex: '#2ecc71' },
        { name: 'Amber', hex: '#f39c12' },
        { name: 'Purple', hex: '#9b59b6' },
        { name: 'Teal', hex: '#1abc9c' },
        { name: 'Orange', hex: '#e67e22' },
        { name: 'Pink', hex: '#e91e63' },
    ];

    let selectedColor = TEAM_COLORS[0].hex;

    // --- Shared Modal Builders (DRY: used by both Create and Edit) ---

    /**
     * Build the shared modal body HTML for team create/edit.
     * @param {Object|null} team - existing team data for pre-population, or null for create
     * @returns {string} HTML string
     */
    function buildTeamFormBody(team = null) {
        const currentColor = team?.color || TEAM_COLORS[0].hex;
        const currentTag = team?.tag || '';
        const currentName = team?.name || '';
        const players = team?.players?.length ? team.players : ['', ''];

        const colorSwatches = TEAM_COLORS.map(c => {
            const isActive = c.hex === currentColor ? ' active' : '';
            return `<button type="button" class="ct-color-swatch${isActive}" style="background:${c.hex}" data-color="${c.hex}" title="${c.name}" onclick="Teams.selectColor(this, '${c.hex}')"></button>`;
        }).join('');

        const playerRows = players.map((p, i) => {
            const removeBtn = (i > 0 || players.length > 1)
                ? `<button class="ct-player-remove" onclick="Teams.removePlayer(this)" title="Remove player">×</button>`
                : '';
            return `
                <div class="ct-player-row">
                    <div class="ct-player-avatar">P${i + 1}</div>
                    <input class="form-input" value="${escapeHtml(p)}" placeholder="Player ${i + 1} name" oninput="Teams.updatePlayerCount()">
                    ${removeBtn}
                </div>`;
        }).join('');

        // Build preview initials
        const previewInitials = currentName
            ? currentName.split(' ').map(w => w[0]).join('').toUpperCase().substr(0, 2)
            : '';
        const previewAvatarContent = previewInitials
            ? previewInitials
            : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;

        return `
            <!-- Team Identity Section -->
            <div class="ct-input-row">
                <div class="ct-input-group">
                    <label>Team Name</label>
                    <div class="ct-input-wrap">
                        <span class="ct-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </span>
                        <input class="form-input" id="team-name-input" placeholder="e.g. Shadow Strikers" value="${escapeHtml(currentName)}" autofocus oninput="Teams.updatePreview()">
                    </div>
                </div>
                <div class="ct-input-group ct-input-group-tag">
                    <label>Tag <span class="ct-char-count" id="tag-char-count">${currentTag.length}/4 · preview</span></label>
                    <input class="form-input ct-input-tag" id="team-tag-input" placeholder="TAG" maxlength="4" value="${escapeHtml(currentTag)}" oninput="Teams.updateTagCount(); Teams.updatePreview()">
                </div>
            </div>

            <!-- Color + Preview -->
            <div class="ct-color-preview-row">
                <div class="ct-color-picker-wrap">
                    <div class="ct-input-group" style="margin-bottom:0">
                        <label>Team Color <span class="ct-char-count">identity</span></label>
                        <div class="ct-color-picker">${colorSwatches}</div>
                    </div>
                </div>
                <div>
                    <span class="ct-preview-label">Preview</span>
                    <div class="ct-preview-card">
                        <div class="ct-preview-avatar" id="ct-preview-avatar" style="background:${currentColor}">
                            ${previewAvatarContent}
                        </div>
                        <div class="ct-preview-name" id="ct-preview-name">${currentName ? escapeHtml(currentName) : 'Team Name'}</div>
                        <div class="ct-preview-tag" id="ct-preview-tag">${currentTag ? escapeHtml(currentTag) : '[TAG]'}</div>
                    </div>
                </div>
            </div>

            <div class="ct-divider"></div>

            <!-- Players Section -->
            <div class="ct-section">
                <div class="ct-section-label">
                    <span>Team Members</span>
                    <span class="ct-badge" id="ct-player-count">${players.filter(p => p).length || players.length} players</span>
                </div>
                <div class="ct-players-grid" id="player-inputs">
                    ${playerRows}
                </div>
                <button type="button" class="ct-add-player-btn" onclick="Teams.addPlayerInput()">
                    <span class="ct-add-icon">+</span>
                    Add Player
                </button>
                <div class="ct-helper-text">Minimum 1 player required</div>
            </div>
        `;
    }

    /**
     * Build the shared modal footer HTML.
     * @param {'create'|'edit'} mode
     * @param {string} [teamId] - required for edit mode
     * @returns {string} HTML string
     */
    function buildTeamFormFooter(mode, teamId = '') {
        if (mode === 'edit') {
            return `
                <div class="ct-footer">
                    <span class="ct-footer-hint">Color and tag will be saved with the team.</span>
                    <div class="ct-footer-actions">
                        <button class="ct-btn-cancel" onclick="App.closeModal()">Cancel</button>
                        <button class="ct-btn-create" onclick="Teams.saveEditTeam('${teamId}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Save Changes
                        </button>
                    </div>
                </div>
            `;
        }
        return `
            <div class="ct-footer">
                <span class="ct-footer-hint">Color and tag will be saved with the team.</span>
                <div class="ct-footer-actions">
                    <button class="ct-btn-cancel" onclick="App.closeModal()">Cancel</button>
                    <button class="ct-btn-create" onclick="Teams.saveNewTeam()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Create Team
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Set up the custom modal header with icon, title, and subtitle.
     * @param {string} title
     * @param {string} subtitle
     */
    function _setupModalHeader(title, subtitle) {
        setTimeout(() => {
            const headerEl = document.querySelector('#modal .modal-header');
            if (headerEl) {
                const titleEl = headerEl.querySelector('#modal-title');
                const closeEl = headerEl.querySelector('#modal-close');
                if (titleEl) titleEl.style.display = 'none';
                headerEl.querySelectorAll('.ct-header').forEach(el => el.remove());
                const customHeader = document.createElement('div');
                customHeader.className = 'ct-header';
                customHeader.innerHTML = `
                    <div class="ct-header-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div class="ct-header-text">
                        <h3>${escapeHtml(title)}</h3>
                        <p>${escapeHtml(subtitle)}</p>
                    </div>
                `;
                headerEl.insertBefore(customHeader, closeEl);
            }
            const nameInput = document.getElementById('team-name-input');
            if (nameInput) nameInput.focus();
        }, 50);
    }

    // --- Modal Functions ---

    function showCreateModal() {
        selectedColor = TEAM_COLORS[0].hex;
        const body = buildTeamFormBody(null);
        const footer = buildTeamFormFooter('create');
        App.openModal('', body, footer, { modalClass: 'modal-create-team' });
        _setupModalHeader('Create New Team', 'Assemble your squad and customize your identity.');
    }

    async function editTeam(id) {
        const team = await Store.getTeam(id);
        if (!team) return;

        // Set the selectedColor to the team's stored color (or default)
        selectedColor = team.color || TEAM_COLORS[0].hex;

        const body = buildTeamFormBody(team);
        const footer = buildTeamFormFooter('edit', id);
        App.openModal('', body, footer, { modalClass: 'modal-create-team' });
        _setupModalHeader('Edit Team', 'Update your squad details.');
    }

    async function saveNewTeam() {
        const name = document.getElementById('team-name-input').value.trim();
        if (!name) {
            App.toast('Please enter a team name', 'error');
            return;
        }
        const players = Array.from(document.querySelectorAll('#player-inputs .form-input'))
            .map(input => input.value.trim())
            .filter(v => v);

        if (players.length < 1) {
            App.toast('Please add at least one player', 'error');
            return;
        }

        const color = selectedColor;
        const tag = (document.getElementById('team-tag-input')?.value || '').trim().toUpperCase() || null;

        try {
            await Store.createTeam(name, players, color, tag);
            App.closeModal(true);
            await render();
            await App.refreshDashboard();
            App.toast('Team created!', 'success');
        } catch (err) {
            App.toast('Failed to create team: ' + err.message, 'error');
        }
    }

    async function saveEditTeam(id) {
        const name = document.getElementById('team-name-input').value.trim();
        if (!name) {
            App.toast('Please enter a team name', 'error');
            return;
        }
        const players = Array.from(document.querySelectorAll('#player-inputs .form-input'))
            .map(input => input.value.trim())
            .filter(v => v);

        if (players.length < 1) {
            App.toast('Please add at least one player', 'error');
            return;
        }

        const color = selectedColor;
        const tag = (document.getElementById('team-tag-input')?.value || '').trim().toUpperCase() || null;

        try {
            await Store.updateTeam(id, name, players, color, tag);
            App.closeModal(true);
            await render();
            await App.refreshDashboard();
            App.toast('Team updated!', 'success');
        } catch (err) {
            App.toast('Failed to update team: ' + err.message, 'error');
        }
    }

    function selectColor(el, hex) {
        selectedColor = hex;
        document.querySelectorAll('.ct-color-swatch').forEach(s => s.classList.remove('active'));
        el.classList.add('active');
        updatePreview();
    }

    function updateTagCount() {
        const tag = document.getElementById('team-tag-input');
        const counter = document.getElementById('tag-char-count');
        if (tag && counter) {
            counter.textContent = `${tag.value.length}/4 · preview`;
        }
    }

    function updatePreview() {
        const name = document.getElementById('team-name-input')?.value.trim() || '';
        const tag = document.getElementById('team-tag-input')?.value.trim().toUpperCase() || '';

        const avatarEl = document.getElementById('ct-preview-avatar');
        const nameEl = document.getElementById('ct-preview-name');
        const tagEl = document.getElementById('ct-preview-tag');

        if (avatarEl) {
            avatarEl.style.background = selectedColor;
            if (name) {
                const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().substr(0, 2);
                avatarEl.innerHTML = initials;
            } else {
                avatarEl.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
            }
        }
        if (nameEl) nameEl.textContent = name || 'Team Name';
        if (tagEl) tagEl.textContent = tag ? tag : '[TAG]';
    }

    function updatePlayerCount() {
        const container = document.getElementById('player-inputs');
        const badge = document.getElementById('ct-player-count');
        if (container && badge) {
            const count = container.children.length;
            badge.textContent = `${count} player${count !== 1 ? 's' : ''}`;
        }
    }

    function addPlayerInput() {
        const container = document.getElementById('player-inputs');
        if (!container) return;
        const count = container.children.length + 1;
        const row = document.createElement('div');
        row.className = 'ct-player-row';
        row.innerHTML = `
            <div class="ct-player-avatar">P${count}</div>
            <input class="form-input" placeholder="Player ${count} name" oninput="Teams.updatePlayerCount()">
            <button class="ct-player-remove" onclick="Teams.removePlayer(this)" title="Remove player">×</button>
        `;
        container.appendChild(row);
        updatePlayerCount();
        row.querySelector('.form-input').focus();
    }

    function removePlayer(btn) {
        const row = btn.closest('.ct-player-row');
        if (row) {
            row.remove();
            renumberPlayers();
            updatePlayerCount();
        }
    }

    function renumberPlayers() {
        const container = document.getElementById('player-inputs');
        if (!container) return;
        container.querySelectorAll('.ct-player-row').forEach((row, i) => {
            const avatar = row.querySelector('.ct-player-avatar');
            const input = row.querySelector('.form-input');
            if (avatar) avatar.textContent = `P${i + 1}`;
            if (input && !input.value) input.placeholder = `Player ${i + 1} name`;
            const removeBtn = row.querySelector('.ct-player-remove');
            if (i === 0 && container.children.length <= 1) {
                if (removeBtn) removeBtn.style.display = 'none';
            } else {
                if (removeBtn) removeBtn.style.display = '';
            }
        });
    }

    async function deleteTeam(id) {
        const team = await Store.getTeam(id);
        if (!team) return;

        const body = `
            <p>Are you sure you want to delete <strong>${escapeHtml(team.name)}</strong>?</p>
            <p class="text-muted mt-8" style="font-size: 0.85rem;">This action cannot be undone. The team will be removed but sessions referencing it will keep historical data.</p>
        `;
        const footer = `
            <button class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-danger" onclick="Teams.confirmDelete('${id}')">Delete Team</button>
        `;
        App.openModal('Delete Team', body, footer);
    }

    async function confirmDelete(id) {
        await Store.deleteTeam(id);
        App.closeModal(true);
        await render();
        await App.refreshDashboard();
        App.toast('Team deleted', 'info');
    }

    return {
        render, showCreateModal, addPlayerInput,
        saveNewTeam, editTeam, saveEditTeam,
        deleteTeam, confirmDelete,
        selectColor, updateTagCount, updatePreview,
        updatePlayerCount, removePlayer
    };
})();

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
