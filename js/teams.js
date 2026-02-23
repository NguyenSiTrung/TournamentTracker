/**
 * Teams - Team management UI
 */
const Teams = (() => {
    function render() {
        const teams = Store.getTeams();
        const grid = document.getElementById('teams-grid');

        if (teams.length === 0) {
            grid.innerHTML = '<p class="empty-state">No teams yet. Create your first team to get started!</p>';
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

    function showCreateModal() {
        const body = `
            <div class="form-group">
                <label class="form-label">Team Name</label>
                <input class="form-input" id="team-name-input" placeholder="Enter team name" autofocus>
            </div>
            <div class="form-group">
                <label class="form-label">Players</label>
                <div class="player-inputs" id="player-inputs">
                    <div class="player-input-row">
                        <input class="form-input" placeholder="Player 1 name">
                    </div>
                    <div class="player-input-row">
                        <input class="form-input" placeholder="Player 2 name">
                    </div>
                </div>
                <button class="btn btn-ghost btn-sm btn-add-player mt-8" onclick="Teams.addPlayerInput()">+ Add Player</button>
            </div>
        `;
        const footer = `
            <button class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-accent" onclick="Teams.saveNewTeam()">Create Team</button>
        `;
        App.openModal('Create Team', body, footer);
    }

    function addPlayerInput() {
        const container = document.getElementById('player-inputs');
        const count = container.children.length + 1;
        const row = document.createElement('div');
        row.className = 'player-input-row';
        row.innerHTML = `
            <input class="form-input" placeholder="Player ${count} name">
            <button class="btn-remove-player" onclick="this.parentElement.remove()">×</button>
        `;
        container.appendChild(row);
    }

    function saveNewTeam() {
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

        Store.createTeam(name, players);
        App.closeModal();
        render();
        App.refreshDashboard();
        App.toast('Team created!', 'success');
    }

    function editTeam(id) {
        const team = Store.getTeam(id);
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

    function saveEditTeam(id) {
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

        Store.updateTeam(id, name, players);
        App.closeModal();
        render();
        App.refreshDashboard();
        App.toast('Team updated!', 'success');
    }

    function deleteTeam(id) {
        const team = Store.getTeam(id);
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

    function confirmDelete(id) {
        Store.deleteTeam(id);
        App.closeModal();
        render();
        App.refreshDashboard();
        App.toast('Team deleted', 'info');
    }

    return {
        render, showCreateModal, addPlayerInput,
        saveNewTeam, editTeam, saveEditTeam,
        deleteTeam, confirmDelete
    };
})();

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
