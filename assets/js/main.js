const streamerBotChatOverlay = (() => {      

  const _subscribeWebSocket = (websocketAddress)=> {
    const websocket = new WebSocket(websocketAddress || 'ws://127.0.0.1:8080')
    websocket.onopen = (event) => {
      console.log('Conectado ao Streamer.Bot!')

      const subscribeMessage = {
        "request": "Subscribe",
        "id": "123123123123",
        "events": {
          "Twitch": ["ChatMessage"],
          "YouTube": ["Message"]
        }
      };
      websocket.send(JSON.stringify(subscribeMessage))
    }
    return websocket;
  }
  
  let _chatContainer = '';
  let messages = []
  let config = {
    maxMessages: 10,
    websocketAddress: 'ws://127.0.0.1:8080',
    ignoredUsers: [],
    maxTime: 15,
    removeOldMessages: true,
    removeOldMessagesInterval: 20000,
    playSound: true,
    animateMessage: true,
    usersColor: []
  }
  
  let lastPlayedSound = new Date();
  let lastUserName = 'Zoidepomba'

  const platformConfig = {
    "generic" : {
      logo: 'twitch.png',
      color: 'red'
    },
    "twitch" : {
      logo: 'twitch.png',
      color: '#6440a5'
    },
    "youtube" : {
      logo: 'youtube.png',
      color: '#ca1111'
    }
  }

  const _getPlatformConfig = (platform) => {
    return platformConfig[platform] || platformConfig['generic']
  }

  const _newMessage = (array, index) => {        
    const newMessage = array[index];    
    _chatContainer.prepend(newMessage);
    if(config.animateMessage){
      requestAnimationFrame(() => {
        newMessage.style.opacity = 1;
        newMessage.style.transform = 'translateY(0)';
        //newMessage.style.color = userColor;
      });
    }
    _chatContainer.scrollTop = _chatContainer.scrollHeight;
    if(array.length >= config.maxMessages){
      array.shift()          
      _removeFirstMessage()
    }
  }

  Object.defineProperty(messages, "push", {
    value: function () {
      for (var i = 0, n = this.length, l = arguments.length; i < l; i++, n++) {
        _newMessage(this, n, this[n] = arguments[i]);
      }
      return n;
    }
  });

  const _generateExpireTime = () => {
    const date = new Date()
    date.setSeconds(date.getSeconds()+config.maxTime)
    return date.getTime()
  }
  
  const _playSound = (userName) => {
    let now = new Date()
    console.log('NOw:', now)
    console.log('LPS:', lastPlayedSound)
    if(userName != lastUserName || lastPlayedSound < now){
      let audio = new Audio("http://127.0.0.1:5500/assets/audio/alert.ogg")
      audio.volume = 0.2    
      audio.play()
      lastPlayedSound = _generateExpireTime()
      lastUserName = userName
    }
  }

  const _createChatItem = (user, message, platform, color) => {
    const chatItem = document.createElement('div')
    const platformConfig = _getPlatformConfig(platform.toLowerCase())
    chatItem.classList.add('chat__item')
    chatItem.classList.add(platform.toLowerCase())
    chatItem.style.transform = 'translateY(20px)';
    chatItem.setAttribute('data-max-time', _generateExpireTime())
    const chatUser = document.createElement('div')
    chatUser.classList.add('chat__user')
    chatUser.innerHTML = `<span class="platform-logo"></span> | <span class="chat__username" style="color:${color || platformConfig.color}">${user}</span>`
    const chatMessage = document.createElement('div')
    chatMessage.classList.add('chat__message')
    chatMessage.innerHTML = message;
    chatItem.appendChild(chatUser)
    chatItem.appendChild(chatMessage)
    if(config.removeOldMessages){
      //_removeExpiredMessages()
    }

    if(config.playSound){
      //_playSound(user)
    }

    return chatItem;
  }
  
  const _removeFirstMessage = () => {
    let chatItens = _chatContainer.querySelectorAll('.chat__item')
    if(chatItens.length > 0){
      //chatItens[chatItens.length - 1].remove();
      _removeChatElement(chatItens[chatItens.length - 1])
    }
  }

  const _removeChatElement = (chatElement) => {
    requestAnimationFrame(() => {
      chatElement.style.opacity = 0;
      chatElement.style.transform = 'translateY(-20px)';                      
    });
    setTimeout(() => { chatElement.remove() }, 500) 
  }

  const _removeExpiredMessages = () => {
    let chatItens = _chatContainer.querySelectorAll('.chat__item')
    if(chatItens.length > 0){
      Array.prototype.forEach.call(chatItens, (chatElement)=>{
        const chatMaxExpireTime = new Date(parseInt(chatElement.getAttribute('data-max-time')))
        const now = new Date()
        if(chatMaxExpireTime < now){
          _removeChatElement(chatElement)         
        }
      })
    }
  }

  const _getYoutubeUserColor = (userName) => {
    const selectedColor = config.usersColor.filter((user) => {
      return user.userName === userName
    })

    return selectedColor.length > 0 ? selectedColor[0].color : 'black'
    
  }

  const _getUserColor = (wsData) => {
    const color = wsData.event.source == 'Twitch' ? 
      wsData.data.message.color : 
      _getYoutubeUserColor(wsData.data.user.name) 
    return color;
  }

  const _startCheckOldMessages = () => {
    if(config.removeOldMessages){
      //setInterval(_removeExpiredMessages, config.removeOldMessagesInterval)
    }
  }

  const _loadConfig = async () => {
    // Tentar carregar do localStorage primeiro
    let config = JSON.parse(localStorage.getItem('chatConfig'));
    
    // Se não existir no localStorage, carregar do config.json e salvar
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
    
    return config;
  }

  const _updateUserStats = (userName, message, platform) => {
    // Pegar estatísticas existentes ou criar novo objeto
    let userStats = JSON.parse(localStorage.getItem('userStats')) || {};
    let specialStats = JSON.parse(localStorage.getItem('specialStats')) || {
        firstMessages: {},
        salves: [],
        lurkers: []
    };
    
    // Registrar primeiro usuário de cada plataforma
    if (!specialStats.firstMessages[platform]) {
        specialStats.firstMessages[platform] = {
            userName: userName,
            time: new Date().toISOString()
        };
    }

    // Verificar comando !salve
    if (message.toLowerCase().startsWith('!salve')) {
        specialStats.salves.push({
            userName: userName,
            platform: platform,
            message: message,
            time: new Date().toISOString()
        });
    }

    // Verificar comandos de lurk
    if (message.toLowerCase().startsWith('!lurk') || message.toLowerCase().startsWith('!moita')) {
        // Verificar se o usuário já não está na lista de lurkers
        const existingLurker = specialStats.lurkers.find(lurker => 
            lurker.userName === userName && lurker.platform === platform
        );
        
        if (!existingLurker) {
            specialStats.lurkers.push({
                userName: userName,
                platform: platform,
                message: message,
                time: new Date().toISOString()
            });
        }
    }

    // Salvar estatísticas especiais
    localStorage.setItem('specialStats', JSON.stringify(specialStats));
    
    // Se o usuário não existe, criar entrada para ele
    if (!userStats[userName]) {
      userStats[userName] = {
        userName: userName,
        platform: platform,
        totalMessages: 0,
        totalCommands: 0,
        commands: {},
        lastMessage: '',
        lastMessageTime: null
      };
    }

    // Atualizar estatísticas
    userStats[userName].totalMessages++;
    userStats[userName].lastMessage = message;
    userStats[userName].lastMessageTime = new Date().toISOString();
    
    // Verificar se é um comando
    if (message.startsWith('!')) {
      userStats[userName].totalCommands++;
      
      // Extrair o nome do comando
      const command = message.split(' ')[0].toLowerCase();
      
      // Contar uso do comando específico
      if (!userStats[userName].commands[command]) {
        userStats[userName].commands[command] = 0;
      }
      userStats[userName].commands[command]++;
    }

    // Salvar no localStorage
    localStorage.setItem('userStats', JSON.stringify(userStats));
  }

  const _load = async () => {
    config = await _loadConfig();
    _chatContainer = document.querySelector('.chat');
    const websocket = _subscribeWebSocket(config.websocketAddress);
    _startCheckOldMessages();
    websocket.onmessage = (message) => {
      if(message){
        const wsData = JSON.parse(message.data);
        console.log(wsData)
        if(wsData.event){
          const data = wsData.data.message
          const message = wsData.event.source == 'Twitch' ? wsData.data.message.message : wsData.data.message
          const color = _getUserColor(wsData)
          console.log(data)
          const userName = wsData.event.source == 'Twitch' ? data.displayName : wsData.data.user.name 
          if(!config.ignoredUsers.includes(userName)){
            // Atualizar estatísticas do usuário
            _updateUserStats(userName, message, wsData.event.source);
            
            let chatMessage = _createChatItem(
                userName, 
                message, 
                wsData.event.source,
                color)
            messages.push(chatMessage)
          }
        }
      }
    }
  }

  return {
    playsound: _playSound,
    load : _load
  }
})()

// Inicialização
streamerBotChatOverlay.load();
