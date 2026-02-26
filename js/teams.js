/**
 * Teams - Team management UI
 */
const Teams = (() => {
    async function render() {
        const teams = await Store.getTeams();
        const grid = document.getElementById('teams-grid');

        if (teams.length === 0) {
            grid.innerHTML = `
            <div class="empty-state-hero-card">
                <div class="empty-state-hero">
                    <svg class="empty-state-hero__svg-illustration" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <!-- Trophy cup -->
                        <path d="M55 50h70v45c0 22-15 38-35 38s-35-16-35-38V50z" fill="#132218" stroke="#4caf50" stroke-width="2"/>
                        <path d="M60 55h60v40c0 18-13 32-30 32s-30-14-30-32V55z" fill="url(#trophyGradFill)" opacity="0.25"/>
                        <!-- Trophy handles -->
                        <path d="M55 60H40a12 12 0 0 0 0 24h15" stroke="#2e7d32" stroke-width="2" fill="none"/>
                        <path d="M125 60h15a12 12 0 0 1 0 24h-15" stroke="#2e7d32" stroke-width="2" fill="none"/>
                        <!-- Trophy base -->
                        <rect x="78" y="133" width="24" height="12" rx="3" fill="#2e7d32" opacity="0.7"/>
                        <rect x="65" y="145" width="50" height="8" rx="4" fill="#2e7d32" opacity="0.5"/>
                        <!-- Star on trophy -->
                        <polygon points="90,62 93.5,70 102,71 96,77 97.5,86 90,82 82.5,86 84,77 78,71 86.5,70" fill="#ffd700" opacity="0.85"/>
                        <!-- Team silhouettes -->
                        <circle cx="60" cy="165" r="6" fill="#4caf50" opacity="0.3"/>
                        <rect x="54" y="172" width="12" height="8" rx="4" fill="#4caf50" opacity="0.2"/>
                        <circle cx="90" cy="162" r="7" fill="#00c853" opacity="0.35"/>
                        <rect x="83" y="170" width="14" height="10" rx="5" fill="#00c853" opacity="0.25"/>
                        <circle cx="120" cy="165" r="6" fill="#4caf50" opacity="0.3"/>
                        <rect x="114" y="172" width="12" height="8" rx="4" fill="#4caf50" opacity="0.2"/>
                        <!-- Sparkles -->
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

        grid.innerHTML = teams.map(team => {
            const initials = team.name.split(' ').map(w => w[0]).join('').toUpperCase().substr(0, 2);
            return `
                <div class="team-card" data-team-id="${team.id}">
                    <div class="team-card-header">
                        <div class="team-avatar">${initials}</div>
                        <span class="team-name">${escapeHtml(team.name)}</span>
                        <div class="team-card-actions">
                            <button class="btn btn-ghost btn-sm" onclick="Teams.editTeam('${team.id}')" title="Edit">✏️</button>
                            <button class="btn btn-danger btn-sm" onclick="Teams.deleteTeam('${team.id}')" title="Delete">🗑️</button>
                        </div>
                    </div>
                    <div class="team-players">
                        ${team.players.map(p => `<span class="player-tag"><span>${escapeHtml(p)}</span></span>`).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    const TEAM_COLORS = [
        { name: 'Green', hex: '#4caf50' },
        { name: 'Blue', hex: '#42a5f5' },
        { name: 'Purple', hex: '#ab47bc' },
        { name: 'Red', hex: '#ef5350' },
        { name: 'Amber', hex: '#ffc107' },
        { name: 'Cyan', hex: '#26c6da' },
        { name: 'Pink', hex: '#ec407a' },
        { name: 'Orange', hex: '#ff7043' },
    ];

    let selectedColor = TEAM_COLORS[0].hex;

    function showCreateModal() {
        const colorSwatches = TEAM_COLORS.map((c, i) =>
            `<button type="button" class="ct-color-swatch${i === 0 ? ' active' : ''}" style="background:${c.hex}" data-color="${c.hex}" title="${c.name}" onclick="Teams.selectColor(this, '${c.hex}')"></button>`
        ).join('');

        const body = `
            <!-- Team Identity Section -->
            <div class="ct-input-row">
                <div class="ct-input-group">
                    <label>Team Name</label>
                    <div class="ct-input-wrap">
                        <span class="ct-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </span>
                        <input class="form-input" id="team-name-input" placeholder="e.g. Shadow Strikers" autofocus oninput="Teams.updatePreview()">
                    </div>
                </div>
                <div class="ct-input-group ct-input-group-tag">
                    <label>Tag <span class="ct-char-count" id="tag-char-count">0/4 · preview</span></label>
                    <input class="form-input ct-input-tag" id="team-tag-input" placeholder="TAG" maxlength="4" oninput="Teams.updateTagCount(); Teams.updatePreview()">
                </div>
            </div>

            <!-- Color + Preview -->
            <div class="ct-color-preview-row">
                <div class="ct-color-picker-wrap">
                    <div class="ct-input-group" style="margin-bottom:0">
                        <label>Team Color <span class="ct-char-count">preview only</span></label>
                        <div class="ct-color-picker">${colorSwatches}</div>
                    </div>
                </div>
                <div>
                    <span class="ct-preview-label">Preview</span>
                    <div class="ct-preview-card">
                        <div class="ct-preview-avatar" id="ct-preview-avatar" style="background:${TEAM_COLORS[0].hex}">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </div>
                        <div class="ct-preview-name" id="ct-preview-name">Team Name</div>
                        <div class="ct-preview-tag" id="ct-preview-tag">[TAG]</div>
                    </div>
                </div>
            </div>

            <div class="ct-divider"></div>

            <!-- Players Section -->
            <div class="ct-section">
                <div class="ct-section-label">
                    <span>Team Members</span>
                    <span class="ct-badge" id="ct-player-count">2 players</span>
                </div>
                <div class="ct-players-grid" id="player-inputs">
                    <div class="ct-player-row">
                        <div class="ct-player-avatar">P1</div>
                        <input class="form-input" placeholder="Player 1 name" oninput="Teams.updatePlayerCount()">
                    </div>
                    <div class="ct-player-row">
                        <div class="ct-player-avatar">P2</div>
                        <input class="form-input" placeholder="Player 2 name" oninput="Teams.updatePlayerCount()">
                        <button class="ct-player-remove" onclick="Teams.removePlayer(this)" title="Remove player">×</button>
                    </div>
                </div>
                <button type="button" class="ct-add-player-btn" onclick="Teams.addPlayerInput()">
                    <span class="ct-add-icon">+</span>
                    Add Player
                </button>
                <div class="ct-helper-text">Minimum 1 player required</div>
            </div>
        `;

        const footer = `
            <div class="ct-footer">
                <span class="ct-footer-hint">Teams can be edited later. Tag and color are currently preview-only.</span>
                <div class="ct-footer-actions">
                    <button class="ct-btn-cancel" onclick="App.closeModal()">Cancel</button>
                    <button class="ct-btn-create" onclick="Teams.saveNewTeam()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Create Team
                    </button>
                </div>
            </div>
        `;
        selectedColor = TEAM_COLORS[0].hex;
        App.openModal('', body, footer, { modalClass: 'modal-create-team' });

        // Replace the default header with our custom rich header
        setTimeout(() => {
            const headerEl = document.querySelector('#modal .modal-header');
            if (headerEl) {
                const titleEl = headerEl.querySelector('#modal-title');
                const closeEl = headerEl.querySelector('#modal-close');
                if (titleEl) {
                    titleEl.style.display = 'none';
                }
                // Remove any previous custom headers first
                headerEl.querySelectorAll('.ct-header').forEach(el => el.remove());
                // Insert custom header
                const customHeader = document.createElement('div');
                customHeader.className = 'ct-header';
                customHeader.innerHTML = `
                    <div class="ct-header-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div class="ct-header-text">
                        <h3>Create New Team</h3>
                        <p>Assemble your squad and customize your identity.</p>
                    </div>
                `;
                headerEl.insertBefore(customHeader, closeEl);
            }
            // Focus name input
            const nameInput = document.getElementById('team-name-input');
            if (nameInput) nameInput.focus();
        }, 50);
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
            // Ensure first player doesn't have remove button
            const removeBtn = row.querySelector('.ct-player-remove');
            if (i === 0 && container.children.length <= 1) {
                if (removeBtn) removeBtn.style.display = 'none';
            } else {
                if (removeBtn) removeBtn.style.display = '';
            }
        });
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

        try {
            await Store.createTeam(name, players);
            App.closeModal(true);
            await render();
            await App.refreshDashboard();
            App.toast('Team created!', 'success');
        } catch (err) {
            App.toast('Failed to create team: ' + err.message, 'error');
        }
    }

    async function editTeam(id) {
        const team = await Store.getTeam(id);
        if (!team) return;

        const body = `
            <div class="form-group">
                <label class="form-label">Team Name</label>
                <input class="form-input" id="team-name-input" value="${escapeHtml(team.name)}">
            </div>
            <div class="form-group">
                <label class="form-label">Players</label>
                <div class="player-inputs" id="player-inputs">
                    ${team.players.map((p, i) => `
                        <div class="player-input-row">
                            <input class="form-input" value="${escapeHtml(p)}" placeholder="Player ${i + 1} name">
                            ${team.players.length > 1 ? `<button class="btn-remove-player" onclick="this.parentElement.remove()">×</button>` : ''}
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-ghost btn-sm btn-add-player mt-8" onclick="Teams.addPlayerInput()">+ Add Player</button>
            </div>
        `;
        const footer = `
            <button class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-accent" onclick="Teams.saveEditTeam('${id}')">Save Changes</button>
        `;
        App.openModal('Edit Team', body, footer);
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

        await Store.updateTeam(id, name, players);
        App.closeModal(true);
        await render();
        await App.refreshDashboard();
        App.toast('Team updated!', 'success');
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
