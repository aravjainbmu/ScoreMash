class TeamsManager {
    constructor(teamsData) {
        this.teams = teamsData;     
        this.selectedTeam = null;      
        this.init();  
    }

    // Initialize - set up event listeners
    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // When user types in the search box, filter teams
        const searchInput = document.getElementById('teamSearch');
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => this.filterTeams(e.target.value));
        }

        // When user clicks on a team card, select that team
        const teamsGrid = document.getElementById('teamsGrid');
        if (teamsGrid) {
            teamsGrid.addEventListener('click', (e) => {
                const card = e.target.closest('.team-select-card');
                if (card) {
                    const teamId = card.dataset.teamId;
                    if (teamId) {
                        this.selectTeam(teamId);
                    }
                }
            });
        }

        // Set up direct listeners for existing cards
        document.querySelectorAll('.team-select-card').forEach(card => {
            const teamId = card.dataset.teamId;
            if (teamId) {
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => this.selectTeam(teamId));
            }
        });
    }

    // Filter teams based on search term
    filterTeams(searchTerm) {
        const teamCards = document.querySelectorAll('.team-select-card');
        const term = searchTerm.toLowerCase().trim();  // Make search case-insensitive
        
        // Loop through each team card
        teamCards.forEach(card => {
            const teamNameEl = card.querySelector('h3');
            if (!teamNameEl) return;
            
            const teamName = teamNameEl.textContent.toLowerCase();
            const teamId = (card.dataset.teamId || '').toLowerCase();
            
            // If team name or ID includes the search term, show it; otherwise hide it
            if (term === '' || teamName.includes(term) || teamId.includes(term)) {
                card.style.display = 'block';  
            } else {
                card.style.display = 'none';  
            }
        });
    }

    selectTeam(teamId) {
        const team = this.teams[teamId];
        if (!team) {
            console.error('Team not found:', teamId);
            return;
        }

        this.selectedTeam = team;
        
        // Hide selection grid and show team details
        const teamsGrid = document.getElementById('teamsGrid');
        const teamDetails = document.getElementById('teamDetails');
        
        if (teamsGrid) {
            teamsGrid.style.display = 'none';
        }
        if (teamDetails) {
            teamDetails.style.display = 'block';
        }

        // Update team header
        const teamNameEl = document.getElementById('teamName');
        const teamSubtitleEl = document.getElementById('teamSubtitle');
        if (teamNameEl) teamNameEl.textContent = team.name || '';
        if (teamSubtitleEl) teamSubtitleEl.textContent = team.subtitle || '';

        // Update roster
        this.updateRoster(team.roster || []);
        
        // Update results
        this.updateResults(team.results || []);
        
        // Update fixtures
        this.updateFixtures(team.fixtures || []);
        
        // Update star players
        this.updateStarPlayers(team.starPlayers || []);

        // Update URL without reload
        window.history.pushState({}, '', `/teams/${teamId}`);

        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateRoster(roster) {
        const rosterGrid = document.getElementById('rosterGrid');
        if (!rosterGrid) return;

        if (roster.length === 0) {
            rosterGrid.innerHTML = '<p>No roster data available</p>';
            return;
        }

        rosterGrid.innerHTML = roster.map(player => {
            // Create a player ID from the name (lowercase, replace spaces with hyphens)
            const playerId = (player.name || 'unknown').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const playerUrl = `/players/${playerId}`;
            
            return `
                <a href="${playerUrl}" class="roster-card-link">
                    <div class="roster-card">
                        <div class="player-photo">👤</div>
                        <h3>${player.name || 'Unknown'}</h3>
                        <p class="player-role">${player.role || ''}</p>
                        <p class="player-stat">${player.stat || ''}</p>
                    </div>
                </a>
            `;
        }).join('');
    }

    updateResults(results) {
        const resultsBody = document.getElementById('resultsTableBody');
        if (!resultsBody) return;

        if (results.length === 0) {
            resultsBody.innerHTML = '<tr><td colspan="5">No recent results</td></tr>';
            return;
        }

        resultsBody.innerHTML = results.map(result => `
            <tr>
                <td>${result.opponent || 'Unknown'}</td>
                <td>${result.date || ''}</td>
                <td><span class="result-${result.win ? 'win' : 'loss'}">${result.result || ''}</span></td>
                <td>${result.score || ''}</td>
                <td><a href="/matches/${result.matchId || '#'}" class="view-report">View Report</a></td>
            </tr>
        `).join('');
    }

    updateFixtures(fixtures) {
        const fixturesList = document.getElementById('fixturesList');
        if (!fixturesList) return;

        if (fixtures.length === 0) {
            fixturesList.innerHTML = '<p>No upcoming fixtures</p>';
            return;
        }

        fixturesList.innerHTML = fixtures.map(fixture => `
            <div class="fixture-item">
                <div class="fixture-opponent">${fixture.opponent || 'Unknown'}</div>
                <div class="fixture-venue">${fixture.venue || ''}</div>
                <div class="fixture-date">${fixture.date || ''}</div>
            </div>
        `).join('');
    }

    updateStarPlayers(starPlayers) {
        const starPlayersGrid = document.getElementById('starPlayersGrid');
        if (!starPlayersGrid) return;

        if (starPlayers.length === 0) {
            starPlayersGrid.innerHTML = '<p>No star players data available</p>';
            return;
        }

        starPlayersGrid.innerHTML = starPlayers.map(player => `
            <div class="star-player-card">
                <div class="star-player-image">🏏</div>
                <div class="star-player-content">
                    <h3>${player.name || 'Unknown'}</h3>
                    <p class="star-player-role">${player.role || ''}</p>
                    <p class="star-player-highlight">${player.highlight || ''}</p>
                    <p class="star-player-desc">${player.desc || ''}</p>
                </div>
            </div>
        `).join('');
    }

    backToTeams() {
        const teamsGrid = document.getElementById('teamsGrid');
        const teamDetails = document.getElementById('teamDetails');
        const searchInput = document.getElementById('teamSearch');
        
        if (teamsGrid) {
            teamsGrid.style.display = 'grid';
        }
        if (teamDetails) {
            teamDetails.style.display = 'none';
        }
        if (searchInput) {
            searchInput.value = '';
            this.filterTeams('');
        }

        this.selectedTeam = null;
        window.history.pushState({}, '', '/teams');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Initialize TeamsManager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.teamsData !== 'undefined' && Object.keys(window.teamsData).length > 0) {
        window.teamsManager = new TeamsManager(window.teamsData);
        return;
    }
});

// Global function for back button
function backToTeams() {
    if (window.teamsManager) {
        window.teamsManager.backToTeams();
    }
}

// Global function for selectTeam 
function selectTeam(teamId) {
    if (window.teamsManager) {
        window.teamsManager.selectTeam(teamId);
    }
}

// Global function for filterTeams
function filterTeams() {
    const searchInput = document.getElementById('teamSearch');
    if (window.teamsManager && searchInput) {
        window.teamsManager.filterTeams(searchInput.value);
    }
}

