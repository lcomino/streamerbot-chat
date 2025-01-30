// Função para carregar e exibir as estatísticas
function loadStats() {
    const statsData = JSON.parse(localStorage.getItem('userStats')) || {};
    const statsGrid = document.getElementById('statsGrid');
    const searchTerm = document.getElementById('searchUser').value.toLowerCase();
    const platformFilter = document.getElementById('platformFilter').value;
    
    statsGrid.innerHTML = '';
    
    Object.values(statsData)
        .filter(user => {
            const matchesSearch = user.userName.toLowerCase().includes(searchTerm);
            const matchesPlatform = !platformFilter || user.platform === platformFilter;
            return matchesSearch && matchesPlatform;
        })
        .sort((a, b) => b.totalMessages - a.totalMessages)
        .forEach(user => {
            const card = document.createElement('div');
            card.className = 'user-card';
            
            const platformClass = user.platform.toLowerCase();
            const lastMessageTime = user.lastMessageTime ? new Date(user.lastMessageTime).toLocaleString() : 'N/A';
            
            card.innerHTML = `
                <h3>
                    ${user.userName}
                    <span class="platform-badge ${platformClass}">${user.platform}</span>
                </h3>
                <div class="stats-info">
                    <p>Total de mensagens: ${user.totalMessages}</p>
                    <p>Comandos utilizados: ${user.totalCommands}</p>
                    <p>Última mensagem: ${user.lastMessage}</p>
                    <p>Horário: ${lastMessageTime}</p>
                </div>
                ${user.totalCommands > 0 ? `
                    <div class="commands-list">
                        <h4>Comandos mais usados:</h4>
                        ${Object.entries(user.commands)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 5)
                            .map(([cmd, count]) => `
                                <div class="command-item">
                                    <span>${cmd}</span>
                                    <span>${count}x</span>
                                </div>
                            `).join('')}
                    </div>
                ` : ''}
            `;
            
            statsGrid.appendChild(card);
        });
}

// Event Listeners
document.getElementById('searchUser').addEventListener('input', loadStats);
document.getElementById('platformFilter').addEventListener('change', loadStats);

// Carregar estatísticas iniciais
document.addEventListener('DOMContentLoaded', loadStats);

// Atualizar estatísticas a cada 30 segundos
setInterval(loadStats, 30000); 