// Função para carregar configurações do localStorage ou config.json
async function loadConfig() {
    let config = JSON.parse(localStorage.getItem('chatConfig'));
    
    if (!config) {
        try {
            const response = await fetch('config.json');
            config = await response.json();
            
            // Salvar no localStorage na primeira carga
            localStorage.setItem('chatConfig', JSON.stringify(config));
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            return;
        }
    }
    
    // Preencher campos básicos
    document.getElementById('maxMessages').value = config.maxMessages;
    document.getElementById('maxTime').value = config.maxTime;
    document.getElementById('websocketAddress').value = config.websocketAddress;
    document.getElementById('playSound').checked = config.playSound;
    document.getElementById('removeOldMessages').checked = config.removeOldMessages;
    document.getElementById('removeOldMessagesInterval').value = config.removeOldMessagesInterval;
    
    // Preencher usuários ignorados
    const ignoredUsersContainer = document.getElementById('ignoredUsers');
    ignoredUsersContainer.innerHTML = '';
    config.ignoredUsers.forEach(user => addIgnoredUserElement(user));
    
    // Preencher cores dos usuários
    const userColorsContainer = document.getElementById('userColors');
    userColorsContainer.innerHTML = '';
    config.usersColor.forEach(user => addUserColorElement(user));
}

// Função para adicionar elemento de usuário ignorado
function addIgnoredUserElement(username = '') {
    const container = document.getElementById('ignoredUsers');
    const div = document.createElement('div');
    div.className = 'ignored-user-item';
    div.innerHTML = `
        <input type="text" value="${username}" class="ignored-user-input">
        <button type="button" class="remove-button">Remover</button>
    `;
    
    div.querySelector('.remove-button').addEventListener('click', () => div.remove());
    container.appendChild(div);
}

// Função para adicionar elemento de cor de usuário
function addUserColorElement(user = { userName: '', color: '#000000' }) {
    const container = document.getElementById('userColors');
    const div = document.createElement('div');
    div.className = 'user-color-item';
    div.innerHTML = `
        <input type="text" value="${user.userName}" class="user-name-input">
        <input type="color" value="${user.color}" class="user-color-input">
        <button type="button" class="remove-button">Remover</button>
    `;
    
    div.querySelector('.remove-button').addEventListener('click', () => div.remove());
    container.appendChild(div);
}

// Event Listeners
document.getElementById('addIgnoredUser').addEventListener('click', () => addIgnoredUserElement());
document.getElementById('addUserColor').addEventListener('click', () => addUserColorElement());

// Salvar configurações
document.getElementById('configForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const config = {
        maxMessages: parseInt(document.getElementById('maxMessages').value),
        maxTime: parseInt(document.getElementById('maxTime').value),
        websocketAddress: document.getElementById('websocketAddress').value,
        playSound: document.getElementById('playSound').checked,
        removeOldMessages: document.getElementById('removeOldMessages').checked,
        removeOldMessagesInterval: parseInt(document.getElementById('removeOldMessagesInterval').value),
        ignoredUsers: Array.from(document.querySelectorAll('.ignored-user-input')).map(input => input.value),
        usersColor: Array.from(document.querySelectorAll('.user-color-item')).map(item => ({
            userName: item.querySelector('.user-name-input').value,
            color: item.querySelector('.user-color-input').value
        }))
    };
    
    // Salvar no localStorage
    localStorage.setItem('chatConfig', JSON.stringify(config));
    alert('Configurações salvas com sucesso!');
});

// Carregar configurações quando a página abrir
document.addEventListener('DOMContentLoaded', loadConfig); 