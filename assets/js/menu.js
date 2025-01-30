// Criar e inserir o menu
function createMenu() {
    const menuHTML = `
    <header>
        <h1>Streamer.BOT Chat Manager</h1>
        <nav class="top-menu">
            <a href="index.html" class="menu-link">
                <i class="fas fa-home"></i>
                <span>Início</span>
            </a>
            <a href="chat.html" class="menu-link">
                <i class="fas fa-comments"></i>
                <span>Chat</span>
            </a>
            <a href="config.html" class="menu-link">
                <i class="fas fa-cog"></i>
                <span>Configurações</span>
            </a>
            <a href="stats.html" class="menu-link">
                <i class="fas fa-chart-bar"></i>
                <span>Estatísticas</span>
            </a>
            <a href="credits.html" class="menu-link">
                <i class="fas fa-star"></i>
                <span>Créditos</span>
            </a>
        </nav>
    </header>
    `;

    document.body.insertAdjacentHTML('afterbegin', menuHTML);
}

// Executar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', createMenu); 