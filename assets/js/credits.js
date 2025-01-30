class CreditsManager {
    constructor() {
        this.stats = this.loadStats();
        this.setupEventListeners();
        this.renderStats();
    }

    loadStats() {
        return JSON.parse(localStorage.getItem('userStats')) || {};
    }

    setupEventListeners() {
        document.getElementById('startCredits').addEventListener('click', () => this.startCreditsAnimation());
        document.getElementById('resetStats').addEventListener('click', () => this.resetStats());
    }

    renderStats() {
        this.renderTopChatters();
        this.renderTopCommands();
        this.renderPlatformStats();
        this.renderSessionStats();
    }

    renderTopChatters() {
        const topChatters = Object.values(this.stats)
            .sort((a, b) => b.totalMessages - a.totalMessages)
            .slice(0, 10);

        const container = document.getElementById('topChatters');
        container.innerHTML = topChatters.map((user, index) => `
            <div class="user-card">
                <h3>${index + 1}. ${user.userName}</h3>
                <p>Mensagens: ${user.totalMessages}</p>
                <p>Comandos: ${user.totalCommands}</p>
                <span class="platform-badge ${user.platform.toLowerCase()}">${user.platform}</span>
            </div>
        `).join('');
    }

    renderTopCommands() {
        // Agregar todos os comandos de todos os usuários
        const commandsCount = {};
        Object.values(this.stats).forEach(user => {
            Object.entries(user.commands || {}).forEach(([cmd, count]) => {
                commandsCount[cmd] = (commandsCount[cmd] || 0) + count;
            });
        });

        const topCommands = Object.entries(commandsCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        const container = document.getElementById('topCommands');
        container.innerHTML = topCommands.map(([cmd, count], index) => `
            <div class="user-card">
                <h3>${index + 1}. ${cmd}</h3>
                <p>Usado ${count} vezes</p>
            </div>
        `).join('');
    }

    renderPlatformStats() {
        const platforms = {
            Twitch: { users: 0, messages: 0, commands: 0 },
            YouTube: { users: 0, messages: 0, commands: 0 }
        };

        Object.values(this.stats).forEach(user => {
            if (platforms[user.platform]) {
                platforms[user.platform].users++;
                platforms[user.platform].messages += user.totalMessages;
                platforms[user.platform].commands += user.totalCommands;
            }
        });

        const container = document.getElementById('platformStats');
        container.innerHTML = Object.entries(platforms).map(([platform, stats]) => `
            <div class="platform-box ${platform.toLowerCase()}">
                <h3>${platform}</h3>
                <p>Usuários: ${stats.users}</p>
                <p>Mensagens: ${stats.messages}</p>
                <p>Comandos: ${stats.commands}</p>
            </div>
        `).join('');
    }

    renderSessionStats() {
        const totalMessages = Object.values(this.stats)
            .reduce((sum, user) => sum + user.totalMessages, 0);
        
        const totalCommands = Object.values(this.stats)
            .reduce((sum, user) => sum + user.totalCommands, 0);
        
        const totalUsers = Object.keys(this.stats).length;

        const container = document.getElementById('sessionStats');
        container.innerHTML = `
            <div class="stat-box">
                <div class="value">${totalUsers}</div>
                <div class="label">Usuários Únicos</div>
            </div>
            <div class="stat-box">
                <div class="value">${totalMessages}</div>
                <div class="label">Mensagens Totais</div>
            </div>
            <div class="stat-box">
                <div class="value">${totalCommands}</div>
                <div class="label">Comandos Usados</div>
            </div>
        `;
    }

    startCreditsAnimation() {
        window.open('credits-roll.html', '_blank', 'width=800,height=600');
    }

    resetStats() {
        if (confirm('Tem certeza que deseja resetar todas as estatísticas? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem('userStats');
            this.stats = {};
            this.renderStats();
        }
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new CreditsManager();
}); 