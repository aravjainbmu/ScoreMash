// Handles player search and filtering
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-box input');
    const playerCards = document.querySelectorAll('.player-card');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            playerCards.forEach(card => {
                const playerName = card.querySelector('h3')?.textContent.toLowerCase() || '';
                const playerRole = card.querySelector('.player-role')?.textContent.toLowerCase() || '';
                const playerTeam = card.dataset.team?.toLowerCase() || '';
                
                if (playerName.includes(searchTerm) || 
                    playerRole.includes(searchTerm) || 
                    playerTeam.includes(searchTerm) ||
                    searchTerm === '') {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});




